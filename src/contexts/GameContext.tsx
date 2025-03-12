import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { GameState, GameStatus, GameMode } from '../models/GameState';
import { PetalState } from '../models/Petal';
import { LetterArrangement } from '../models/LetterArrangement';
import { Challenge } from '../models/Challenge';
import { generateOptimizedArrangement, Difficulty } from '../services/enhancedLetterGeneration';
import { isValidWord, loadDictionary, getDictionaryStats } from '../services/dictionary';
import { calculateScore } from '../services/scoring';
import { arePetalsAdjacent } from '../utils/adjacency';
import { canFormWordWithValidPath } from '../services/pathValidation';
import { 
  createChallenge as createChallengeService, 
  getPlayerName, 
  getTopChallengeScore,
  submitChallengeScore
} from '../services/challengeService';

// Constants
const GAME_TIME = 10; // 2 minutes in seconds
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 9; // Maximum word length limit

// Initial State
const initialState: GameState = {
  score: 0,
  timeRemaining: GAME_TIME,
  foundWords: [],
  currentWord: '',
  selectedPetals: [],
  letterArrangement: {
    center: '',
    innerRing: [],
    outerRing: []
  },
  gameStatus: 'idle',
  gameMode: 'classic',
  invalidWordAttempt: false,
  showSuccessNotification: false,
  successMessage: '',
  showErrorNotification: false,
  errorMessage: '',
  stats: {
    wordsFound: 0,
    longestWord: '',
    avgWordLength: 0,
    totalScore: 0
  },
  lastWordScore: 0,
  activeChallenge: undefined,
  topChallengeScore: 0
};

// Action Types
type GameAction =
  | { type: 'START_GAME'; dictionary: any }
  | { type: 'START_CHALLENGE_GAME'; dictionary: any; challenge: Challenge; topScore: number }
  | { type: 'END_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'SELECT_PETAL'; payload: PetalState }
  | { type: 'RESET_SELECTION' }
  | { type: 'SUBMIT_WORD' }
  | { type: 'SET_INVALID_WORD_ATTEMPT'; payload: boolean }
  | { type: 'SET_LETTER_ARRANGEMENT'; payload: LetterArrangement }
  | { type: 'RESET_SUCCESS_NOTIFICATION' }
  | { type: 'RESET_ERROR_NOTIFICATION' }
  | { type: 'SET_GAME_MODE'; payload: GameMode }
  | { type: 'CREATE_CHALLENGE'; challenge: Challenge }
  | { type: 'UPDATE_TOP_CHALLENGE_SCORE'; payload: number };

// Reducer - defined outside the component
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      // Use the enhanced letter generation
      const letterArrangement = generateOptimizedArrangement(action.dictionary, Difficulty.EASY);
      return {
        ...initialState,
        letterArrangement,
        gameStatus: 'playing',
        gameMode: 'classic',
        activeChallenge: undefined
      };
      
    case 'START_CHALLENGE_GAME':
      return {
        ...initialState,
        letterArrangement: action.challenge.letterArrangement,
        gameStatus: 'playing',
        gameMode: 'challenge',
        activeChallenge: action.challenge,
        topChallengeScore: action.topScore
      };

    case 'END_GAME':
      return {
        ...state,
        gameStatus: 'gameOver'
      };

    case 'PAUSE_GAME':
      return {
        ...state,
        gameStatus: 'paused'
      };

    case 'RESUME_GAME':
      return {
        ...state,
        gameStatus: 'playing'
      };

    case 'UPDATE_TIME':
      const timeRemaining = action.payload;
      if (timeRemaining <= 0) {
        return {
          ...state,
          timeRemaining: 0,
          gameStatus: 'gameOver'
        };
      }
      return {
        ...state,
        timeRemaining
      };

    case 'SELECT_PETAL':
      const newPetal = action.payload;
      
      // Check if maximum word length has been reached
      if (state.selectedPetals.length >= MAX_WORD_LENGTH) {
        return state;
      }
      
      // Check if this is a valid selection
      if (state.selectedPetals.length > 0) {
        const lastPetal = state.selectedPetals[state.selectedPetals.length - 1];
        
        // Check if this is the same petal as the last selected one
        // This prevents immediate reuse of the same petal (like EE)
        if (lastPetal.tier === newPetal.tier && lastPetal.index === newPetal.index) {
          return state;
        }
        
        // Prevent problematic backtracking while allowing strategic reuse
        // Check if this petal has been used before
        const existingPetalIndex = state.selectedPetals.findIndex(
          p => p.tier === newPetal.tier && p.index === newPetal.index
        );
        
        if (existingPetalIndex !== -1) {
          // Don't allow immediate consecutive reuse (e.g., A-A)
          if (existingPetalIndex === state.selectedPetals.length - 2) {
            return state;
          }
          
          // Don't allow moving backward more than one step
          // This prevents simple backtracking like P-A-C-E-C-A
          if (existingPetalIndex === state.selectedPetals.length - 3) {
            return state;
          }
        }
        
        // Check for repeating patterns that would form cycles (like HANIHANI)
        if (state.selectedPetals.length >= 2) {
          const newPath = [...state.selectedPetals, newPetal];
          const pathLength = newPath.length;
          
          // Check for repeating patterns of length 2 up to half the path length
          const maxPatternLength = Math.floor(pathLength / 2);
          
          for (let patternLength = 2; patternLength <= maxPatternLength; patternLength++) {
            // Check if the last 'patternLength' petals match the previous 'patternLength' petals
            let isRepeatingPattern = true;
            
            for (let i = 0; i < patternLength; i++) {
              const recentIndex = pathLength - i - 1;
              const previousIndex = recentIndex - patternLength;
              
              // Compare tiers and indices to identify the same petals
              if (
                newPath[recentIndex].tier !== newPath[previousIndex].tier ||
                newPath[recentIndex].index !== newPath[previousIndex].index
              ) {
                isRepeatingPattern = false;
                break;
              }
            }
            
            // If we found a repeating pattern, reject this selection
            if (isRepeatingPattern) {
              return state;
            }
          }
        }
        
        // Check adjacency
        if (!arePetalsAdjacent(lastPetal, newPetal, state.letterArrangement)) {
          return state;
        }
      }
      
      // Explicitly ensure we're only adding the correct letter
      // This fixes the "HS" bug where extra letters might appear
      const updatedWord = state.currentWord + newPetal.letter;
      
      // Debug output
      console.log('Adding letter:', newPetal.letter, 'to current word:', state.currentWord, '=', updatedWord);
      
      return {
        ...state,
        selectedPetals: [...state.selectedPetals, newPetal],
        currentWord: updatedWord
      };

    case 'RESET_SELECTION':
      return {
        ...state,
        selectedPetals: [],
        currentWord: ''
      };

    case 'SUBMIT_WORD':
      const word = state.currentWord.toUpperCase();
      console.log('Attempting to submit word:', word);
      
      // Enhanced validation using path validation
      const isLongEnough = word.length >= MIN_WORD_LENGTH;
      const isShortEnough = word.length <= MAX_WORD_LENGTH;
      const isNotDuplicate = !state.foundWords.includes(word);
      const isInDictionary = isValidWord(word);
      const hasValidPath = canFormWordWithValidPath(word, state.letterArrangement);
      const includesCenterLetter = word.includes(state.letterArrangement.center.toUpperCase());
      
      console.log('Word validation:', {
        isLongEnough,
        isShortEnough,
        isNotDuplicate,
        isInDictionary,
        hasValidPath,
        includesCenterLetter
      });
      
      // Check if the word is valid
      if (
        isLongEnough &&
        isShortEnough &&
        isNotDuplicate &&
        isInDictionary &&
        hasValidPath && 
        includesCenterLetter
      ) {
        // Word is valid - add it to found words and update score
        const score = calculateScore(word, state.selectedPetals);
        const newFoundWords = [...state.foundWords, word];
        
        // Calculate stats
        const stats = {
          wordsFound: newFoundWords.length,
          longestWord: word.length > state.stats.longestWord.length ? word : state.stats.longestWord,
          avgWordLength: newFoundWords.reduce((sum, w) => sum + w.length, 0) / newFoundWords.length,
          totalScore: state.stats.totalScore + score
        };
        
        // Set a flag to show notification rather than calling it directly (which causes the React warning)
        return {
          ...state,
          score: state.score + score,
          foundWords: newFoundWords,
          currentWord: '',
          selectedPetals: [],
          stats,
          invalidWordAttempt: false,
          lastWordScore: score,  // Store the score of this word
          showSuccessNotification: true, // Flag to show notification
          successMessage: `+${score} points!`
        };
      } else {
        // Word is invalid - determine the reason
        let reason = '';
        
        if (!isLongEnough) {
          reason = 'Word too short';
        } else if (!includesCenterLetter) {
          reason = 'Must use center letter';
        } else if (!isNotDuplicate) {
          reason = 'Already found this word';
        } else if (!isInDictionary) {
          reason = 'Word not in dictionary';
        } else {
          reason = 'Invalid word';
        }
        
        // Set error flag instead of directly calling notification
        return {
          ...state,
          invalidWordAttempt: true,
          showErrorNotification: true,
          errorMessage: reason
        };
      }

    case 'SET_LETTER_ARRANGEMENT':
      return {
        ...state,
        letterArrangement: action.payload
      };
      
    case 'SET_INVALID_WORD_ATTEMPT':
      return {
        ...state,
        invalidWordAttempt: action.payload
      };
      
    case 'RESET_SUCCESS_NOTIFICATION':
      return {
        ...state,
        showSuccessNotification: false,
        successMessage: ''
      };

    case 'RESET_ERROR_NOTIFICATION':
      return {
        ...state,
        showErrorNotification: false,
        errorMessage: ''
      };
      
    case 'SET_GAME_MODE':
      return {
        ...state,
        gameMode: action.payload
      };
      
    case 'CREATE_CHALLENGE':
      return {
        ...state,
        activeChallenge: action.challenge
      };
      
    case 'UPDATE_TOP_CHALLENGE_SCORE':
      return {
        ...state,
        topChallengeScore: action.payload
      };

    default:
      return state;
  }
}

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  startChallengeGame: (challenge: Challenge) => Promise<void>;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  selectPetal: (petal: PetalState) => void;
  resetSelection: () => void;
  submitWord: () => void;
  clearInvalidWordState: () => void;
  setGameMode: (mode: GameMode) => void;
  createChallenge: () => Promise<Challenge | null>;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider Component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);
  
  // Load dictionary on mount
  useEffect(() => {
    async function initDictionary() {
      try {
        setIsLoading(true);
        const dict = await loadDictionary();
        setDictionary(dict);
        console.log('Dictionary loaded:', getDictionaryStats());
      } catch (error) {
        console.error('Failed to load dictionary:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initDictionary();
  }, []);
  
  // Timer effect
  useEffect(() => {
    let interval: number | null = null;
    
    if (state.gameStatus === 'playing' && state.timeRemaining > 0) {
      interval = window.setInterval(() => {
        dispatch({ type: 'UPDATE_TIME', payload: state.timeRemaining - 1 });
      }, 1000);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [state.gameStatus, state.timeRemaining]);
  
  // Invalid word attempt listener
  useEffect(() => {
    if (state.invalidWordAttempt) {
      console.log('Invalid word reset triggered in context');
      
      // Give some time for the error to be displayed then reset
      const timer = setTimeout(() => {
        resetSelection();
        dispatch({ type: 'SET_INVALID_WORD_ATTEMPT', payload: false });
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [state.invalidWordAttempt]);
  
  // Handle notifications
  useEffect(() => {
    // Handle success notifications
    if (state.showSuccessNotification && state.successMessage) {
      // Use window.addNotification safely outside the render cycle
      if (window.addNotification) {
        window.addNotification(state.successMessage, 'success', 2000);
      }
      
      // Reset the notification flag
      dispatch({
        type: 'RESET_SUCCESS_NOTIFICATION'
      });
    }
    
    // Handle error notifications
    if (state.showErrorNotification && state.errorMessage) {
      // Use window.addNotification safely outside the render cycle
      if (window.addNotification) {
        window.addNotification(state.errorMessage, 'error', 2500);
      }
      
      // Reset the notification flag
      dispatch({
        type: 'RESET_ERROR_NOTIFICATION'
      });
    }
  }, [state.showSuccessNotification, state.showErrorNotification]);
  
  // Game controller functions
  const startGame = () => {
    if (!isLoading && dictionary) {
      dispatch({ type: 'START_GAME', dictionary });
    } else {
      console.warn('Cannot start game - dictionary still loading');
    }
  };
  
  const startChallengeGame = async (challenge: Challenge) => {
    if (!isLoading && dictionary) {
      try {
        // Get the top score for this challenge
        const topScore = await getTopChallengeScore(challenge.id);
        
        dispatch({ 
          type: 'START_CHALLENGE_GAME', 
          dictionary,
          challenge,
          topScore
        });
      } catch (error) {
        console.error('Error starting challenge game:', error);
        if (window.addNotification) {
          window.addNotification('Error starting challenge', 'error', 3000);
        }
      }
    } else {
      console.warn('Cannot start challenge game - dictionary still loading');
    }
  };
  
  const endGame = () => dispatch({ type: 'END_GAME' });
  const pauseGame = () => dispatch({ type: 'PAUSE_GAME' });
  const resumeGame = () => dispatch({ type: 'RESUME_GAME' });
  const selectPetal = (petal: PetalState) => dispatch({ type: 'SELECT_PETAL', payload: petal });
  const resetSelection = () => dispatch({ type: 'RESET_SELECTION' });
  const submitWord = () => {
    console.log('submitWord called, current word:', state.currentWord);
    if (state.currentWord.length >= 3) {
      dispatch({ type: 'SUBMIT_WORD' });
    } else {
      console.log('Word too short, not submitting');
      // Reset if the word is too short
      resetSelection();
    }
  };
  const clearInvalidWordState = () => dispatch({ type: 'SET_INVALID_WORD_ATTEMPT', payload: false });
  const setGameMode = (mode: GameMode) => dispatch({ type: 'SET_GAME_MODE', payload: mode });
  
  const createChallenge = async (): Promise<Challenge | null> => {
    if (state.gameStatus === 'gameOver') {
      try {
        // Get player name
        const playerName = getPlayerName();
        console.log(`Creating challenge with letter arrangement:`, state.letterArrangement);
        
        // Create challenge with current letter arrangement
        const challenge = await createChallengeService(state.letterArrangement, playerName);
        
        // Update context
        dispatch({ type: 'CREATE_CHALLENGE', challenge });
        
        // Immediately submit score for the creator
        await submitChallengeScore(
          challenge.id,
          playerName,
          state.score,
          state.foundWords
        );
        
        console.log(`Challenge created with ID ${challenge.id} and creator score ${state.score} submitted`);
        
        return challenge;
      } catch (error) {
        console.error('Error creating challenge:', error);
        if (window.addNotification) {
          window.addNotification('Failed to create challenge', 'error', 3000);
        }
        return null;
      }
    }
    return null;
  };
  
  const value = {
    state,
    dispatch,
    startGame,
    startChallengeGame,
    endGame,
    pauseGame,
    resumeGame,
    selectPetal,
    resetSelection,
    submitWord,
    clearInvalidWordState,
    setGameMode,
    createChallenge,
    isLoading
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the GameContext
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};