import { useGameContext } from '../contexts/GameContext';

export const useGameState = () => {
  const { state } = useGameContext();
  const { 
    score, 
    timeRemaining, 
    foundWords, 
    currentWord, 
    gameMode, 
    activeChallenge,
    topChallengeScore,
    stats
  } = state;
  const totalTime = 120; // 2 minutes in seconds

  return {
    score,
    timeRemaining,
    totalTime,
    foundWords,
    currentWord,
    gameMode,
    activeChallenge,
    topChallengeScore,
    stats
  };
}; 