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
} 