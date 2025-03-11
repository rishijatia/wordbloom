import { PetalTier } from './Petal';

export interface LetterValue {
  [key: string]: number;
}

export interface ScoreMultiplier {
  byWordLength: Record<number, number>;
  byTier: Record<PetalTier, number>;
  bonuses: {
    allTiers: number;
    superBloom: number;
  };
} 