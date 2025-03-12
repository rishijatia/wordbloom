// Import dependencies
import { PetalState } from './Petal';
import { LetterArrangement } from './LetterArrangement';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface GameStats {
  wordsFound: number;
  longestWord: string;
  avgWordLength: number;
  totalScore: number;
}

export interface GameState {
  score: number;
  timeRemaining: number;
  foundWords: string[];
  currentWord: string;
  selectedPetals: PetalState[];
  letterArrangement: LetterArrangement;
  gameStatus: GameStatus;
  invalidWordAttempt: boolean;
  stats: GameStats;
  lastWordScore?: number; // Track the score of the most recently submitted word
  showSuccessNotification?: boolean; // Flag to show success notification
  successMessage?: string; // Message for success notification
  showErrorNotification?: boolean; // Flag to show error notification
  errorMessage?: string; // Message for error notification
} 