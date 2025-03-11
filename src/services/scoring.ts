import { LetterValue, ScoreMultiplier } from '../models/Score';
import { PetalState, PetalTier } from '../models/Petal';

// Letter values based on frequency and difficulty
export const letterValues: LetterValue = {
  'A': 1, 'E': 1, 'I': 1, 'O': 1, 'N': 1, 'R': 1, 'S': 1, 'T': 1,
  'D': 2, 'G': 2, 'L': 2, 'M': 2, 'U': 2,
  'B': 3, 'C': 3, 'H': 3, 'P': 3, 'Y': 3,
  'F': 4, 'K': 4, 'W': 4,
  'J': 5, 'Q': 5, 'V': 5, 'X': 5, 'Z': 5
};

// Scoring multipliers
export const scoreMultipliers: ScoreMultiplier = {
  byWordLength: {
    3: 1,    // 3 letters: 1x
    4: 1.5,  // 4 letters: 1.5x
    5: 2,    // 5 letters: 2x
    6: 3,    // 6+ letters: 3x
    7: 3,
    8: 3,
    9: 3,
    10: 3
  },
  byTier: {
    1: 1,    // Tier 1 (Center): 1x
    2: 1.5,  // Tier 2 (Inner): 1.5x
    3: 2     // Tier 3 (Outer): 2x
  },
  bonuses: {
    allTiers: 5,      // Using all three tiers: +5 points
    superBloom: 50    // Using all letters: +50 points
  }
};

/**
 * Calculate score for a word based on letters, tiers, and bonuses
 */
export function calculateScore(word: string, selectedPetals: PetalState[]): number {
  // Base score is sum of letter values
  let wordScore = 0;
  
  // Add value for each letter based on its position
  for (const petal of selectedPetals) {
    const letterValue = letterValues[petal.letter.toUpperCase()] || 1;
    const tierMultiplier = scoreMultipliers.byTier[petal.tier];
    wordScore += letterValue * tierMultiplier;
  }
  
  // Apply word length multiplier
  const lengthMultiplier = scoreMultipliers.byWordLength[word.length] || 
                           scoreMultipliers.byWordLength[6]; // Use 6+ multiplier for longer words
  
  wordScore = Math.floor(wordScore * lengthMultiplier);
  
  // Check if all tiers were used
  const tierUsed = selectedPetals.reduce<Record<PetalTier, boolean>>(
    (tiers, petal) => {
      tiers[petal.tier] = true;
      return tiers;
    }, 
    { 1: false, 2: false, 3: false }
  );
  
  if (tierUsed[1] && tierUsed[2] && tierUsed[3]) {
    wordScore += scoreMultipliers.bonuses.allTiers;
  }
  
  // No "Super Bloom" check yet as it requires counting all board petals
  
  return wordScore;
} 