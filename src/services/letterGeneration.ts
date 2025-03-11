import { LetterArrangement } from '../models/LetterArrangement';
import { ProcessedDictionary } from '../models/Dictionary';
import { countPossibleWords, findPossibleWords } from './dictionary';

// Letter frequency groups based on linguistic research
const HIGH_FREQ_VOWELS = ['A', 'E']; // Appear in >75% of words
const MED_FREQ_VOWELS = ['I', 'O', 'U']; // Appear in 50-75% of words
const HIGH_FREQ_CONSONANTS = ['R', 'S', 'T', 'N', 'L']; // Appear in >35% of words
const MED_FREQ_CONSONANTS = ['C', 'D', 'P', 'M', 'H']; // Appear in 20-35% of words
const LOW_FREQ_CONSONANTS = ['F', 'W', 'G', 'B', 'Y', 'V', 'K']; // Appear in 10-20% of words
const RARE_CONSONANTS = ['J', 'X', 'Q', 'Z']; // Appear in <5% of words

// Common letter pairs for strategic placement
const COMMON_PAIRS = [
  ['T', 'H'], ['E', 'R'], ['I', 'N'], ['A', 'N'], 
  ['R', 'E'], ['O', 'N'], ['S', 'T'], ['A', 'T'],
  ['E', 'N'], ['E', 'S'], ['O', 'R'], ['A', 'R']
];

/**
 * Difficulty level for letter arrangement
 * 1 = Easiest, 5 = Hardest
 */
export enum Difficulty {
  EASY = 1,
  MEDIUM = 3,
  HARD = 5
}

/**
 * Generate a letter arrangement with optimized word formation potential
 */
export function generateLetterArrangement(
  dictionary: ProcessedDictionary, 
  difficulty: Difficulty = Difficulty.EASY
): LetterArrangement {
  // 1. Select center letter (Tier 1)
  const centerLetter = selectCenterLetter(difficulty);
  
  // 2. Generate inner ring (Tier 2)
  const innerRing = generateInnerRing(centerLetter, difficulty);
  
  // 3. Generate outer ring (Tier 3) - ensure exactly 12 letters
  const outerRingLetters = generateOuterRing(centerLetter, innerRing, difficulty);
  // Take existing letters or pad if needed
  let outerRing = outerRingLetters.slice(0, 12);
  // Make sure all 12 positions are properly filled
  while (outerRing.length < 12) {
    const letterPool = [...HIGH_FREQ_CONSONANTS, ...MED_FREQ_CONSONANTS, ...MED_FREQ_VOWELS].filter(l => !outerRing.includes(l));
    if (letterPool.length > 0) {
      outerRing.push(letterPool[Math.floor(Math.random() * letterPool.length)]);
    } else {
      // Use a different letter from existing high frequency consonants if needed
      outerRing.push(['S', 'T', 'R', 'N'][Math.floor(Math.random() * 4)]); 
    }
  }
  
  // Debug: Verify outer ring length
  console.log(`Outer ring has ${outerRing.length} letters:`, outerRing);
  if (outerRing.length !== 12) {
    console.error(`ERROR: Outer ring should have 12 letters but has ${outerRing.length}`);
    // Force exactly 12 letters if somehow still incorrect
    while (outerRing.length < 12) {
      outerRing.push('X');
    }
    outerRing = outerRing.slice(0, 12);
  }
  
  // 4. Create arrangement
  const arrangement: LetterArrangement = {
    center: centerLetter,
    innerRing: innerRing,
    outerRing: outerRing
  };
  
  // For now, just return the arrangement without validation
  return arrangement;
}

/**
 * Select an optimal center letter based on difficulty
 */
function selectCenterLetter(difficulty: Difficulty): string {
  // Calculate vowel probability (easier games = more vowels)
  const vowelCenterProbability = 0.8 - (difficulty * 0.1); // 0.7 for medium difficulty
  
  let centerLetterOptions: string[] = [];
  
  if (Math.random() < vowelCenterProbability) {
    // Higher chance of high-frequency vowels
    centerLetterOptions = Math.random() < 0.7 ? HIGH_FREQ_VOWELS : MED_FREQ_VOWELS;
  } else {
    // Only use high-frequency consonants for center
    centerLetterOptions = HIGH_FREQ_CONSONANTS;
  }
  
  return centerLetterOptions[Math.floor(Math.random() * centerLetterOptions.length)];
}

/**
 * Generate the 6 letters for the inner ring (Tier 2)
 */
function generateInnerRing(centerLetter: string, difficulty: Difficulty): string[] {
  const tier2: string[] = [];
  
  // Vowel count varies by difficulty (more vowels = easier)
  const tier2VowelCount = Math.max(1, Math.min(3, 4 - Math.floor(difficulty / 2)));
  
  // Determine which vowels to use (exclude center if it's a vowel)
  const availableVowels = [...HIGH_FREQ_VOWELS, ...MED_FREQ_VOWELS]
    .filter(v => v !== centerLetter);
    
  // Add vowels to Tier 2
  for (let i = 0; i < tier2VowelCount && availableVowels.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableVowels.length);
    tier2.push(availableVowels[randomIndex]);
    availableVowels.splice(randomIndex, 1);
  }
  
  // Fill remaining Tier 2 slots with consonants
  const tier2Consonants = [...HIGH_FREQ_CONSONANTS, ...MED_FREQ_CONSONANTS]
    .filter(c => c !== centerLetter);
  
  while (tier2.length < 6 && tier2Consonants.length > 0) {
    const randomIndex = Math.floor(Math.random() * tier2Consonants.length);
    const letter = tier2Consonants[randomIndex];
    
    // Check if this letter would create adjacent duplicates
    const prevLetter = tier2[tier2.length - 1];
    if (letter !== prevLetter) {
      tier2.push(letter);
      tier2Consonants.splice(randomIndex, 1);
    }
  }
  
  // Shuffle the array to randomize positions while preserving no adjacent duplicates
  for (let i = tier2.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Only swap if it won't create adjacent duplicates
    if (tier2[i] !== tier2[j] && 
        (j === 0 || tier2[j-1] !== tier2[i]) &&
        (j === tier2.length - 1 || tier2[j+1] !== tier2[i]) &&
        (i === 0 || tier2[i-1] !== tier2[j]) &&
        (i === tier2.length - 1 || tier2[i+1] !== tier2[j])) {
      [tier2[i], tier2[j]] = [tier2[j], tier2[i]];
    }
  }
  
  return tier2;
}

/**
 * Strategically arranges letters to position common pairs adjacently
 */
function arrangeCommonPairs(letters: string[], centerLetter: string): void {
  // Find pairs that can be formed with our letters + center
  const possiblePairs = COMMON_PAIRS.filter(pair => {
    const [a, b] = pair;
    return (letters.includes(a) || centerLetter === a) && 
           (letters.includes(b) || centerLetter === b);
  });
  
  if (possiblePairs.length > 0) {
    // Sort letters to maximize adjacent common pairs
    letters.sort((a, b) => {
      const aPairCount = countPairsWithLetter(a, possiblePairs);
      const bPairCount = countPairsWithLetter(b, possiblePairs);
      return bPairCount - aPairCount;
    });
  }
}

/**
 * Counts how many common pairs include a specific letter
 */
function countPairsWithLetter(letter: string, pairs: string[][]): number {
  return pairs.filter(pair => pair[0] === letter || pair[1] === letter).length;
}

/**
 * Generate the 12 letters for the outer ring (Tier 3)
 */
function generateOuterRing(centerLetter: string, innerRing: string[], difficulty: Difficulty): string[] {
  const tier3: string[] = [];
  
  // Balance vowels based on difficulty
  const tier3VowelCount = Math.max(2, Math.min(4, 6 - difficulty));
  
  // Create a set of all used letters to prevent duplicates
  const usedLetters = new Set([centerLetter, ...innerRing]);
  
  // Add vowels to Tier 3
  const tier3Vowels = [...HIGH_FREQ_VOWELS, ...MED_FREQ_VOWELS]
    .filter(v => !usedLetters.has(v));
  
  for (let i = 0; i < tier3VowelCount && tier3Vowels.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * tier3Vowels.length);
    const letter = tier3Vowels[randomIndex];
    
    // Check for adjacent duplicates with inner ring connections
    const innerIndex = Math.floor(i / 2); // Each inner petal connects to 2 outer petals
    if (innerRing[innerIndex] !== letter) {
      tier3.push(letter);
      usedLetters.add(letter);
      tier3Vowels.splice(randomIndex, 1);
    }
  }
  
  // Add high frequency consonants
  const highFreqCount = Math.max(3, Math.min(5, 8 - difficulty));
  const availableHighFreq = HIGH_FREQ_CONSONANTS.filter(c => !usedLetters.has(c));
  
  for (let i = 0; i < highFreqCount && tier3.length < 12 && availableHighFreq.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableHighFreq.length);
    const letter = availableHighFreq[randomIndex];
    
    // Check for adjacent duplicates
    const prevLetter = tier3[tier3.length - 1];
    const innerIndex = Math.floor(tier3.length / 2);
    if (letter !== prevLetter && (innerIndex >= innerRing.length || innerRing[innerIndex] !== letter)) {
      tier3.push(letter);
      usedLetters.add(letter);
      availableHighFreq.splice(randomIndex, 1);
    }
  }
  
  // Add medium frequency consonants
  const medFreqCount = Math.floor(Math.random() * 2) + 3;
  const availableMedFreq = MED_FREQ_CONSONANTS.filter(c => !usedLetters.has(c));
  
  for (let i = 0; i < medFreqCount && tier3.length < 12 && availableMedFreq.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableMedFreq.length);
    const letter = availableMedFreq[randomIndex];
    
    // Check for adjacent duplicates
    const prevLetter = tier3[tier3.length - 1];
    const innerIndex = Math.floor(tier3.length / 2);
    if (letter !== prevLetter && (innerIndex >= innerRing.length || innerRing[innerIndex] !== letter)) {
      tier3.push(letter);
      usedLetters.add(letter);
      availableMedFreq.splice(randomIndex, 1);
    }
  }
  
  // Fill remaining slots if needed
  while (tier3.length < 12) {
    const allPossibleLetters = [
      ...HIGH_FREQ_CONSONANTS,
      ...MED_FREQ_CONSONANTS,
      ...LOW_FREQ_CONSONANTS
    ].filter(letter => {
      const prevLetter = tier3[tier3.length - 1];
      const innerIndex = Math.floor(tier3.length / 2);
      return letter !== prevLetter && 
             (innerIndex >= innerRing.length || innerRing[innerIndex] !== letter);
    });
    
    if (allPossibleLetters.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPossibleLetters.length);
      tier3.push(allPossibleLetters[randomIndex]);
    } else {
      // If we can't find a letter that avoids duplicates, just use any high frequency consonant
      const randomIndex = Math.floor(Math.random() * HIGH_FREQ_CONSONANTS.length);
      tier3.push(HIGH_FREQ_CONSONANTS[randomIndex]);
    }
  }
  
  // Final pass to ensure no adjacent duplicates in the outer ring
  for (let i = 0; i < tier3.length; i++) {
    const nextIndex = (i + 1) % tier3.length;
    if (tier3[i] === tier3[nextIndex]) {
      // Try to swap with a non-adjacent position
      for (let j = (i + 2) % tier3.length; j !== i; j = (j + 1) % tier3.length) {
        const prevJ = (j - 1 + tier3.length) % tier3.length;
        const nextJ = (j + 1) % tier3.length;
        if (tier3[j] !== tier3[i] && 
            tier3[j] !== tier3[prevJ] && 
            tier3[j] !== tier3[nextJ] &&
            tier3[i] !== tier3[prevJ] && 
            tier3[i] !== tier3[nextJ]) {
          [tier3[nextIndex], tier3[j]] = [tier3[j], tier3[nextIndex]];
          break;
        }
      }
    }
  }
  
  return tier3;
}

/**
 * Find all possible words for a given letter arrangement
 */
export function findAllPossibleWords(arrangement: LetterArrangement): string[] {
  const allLetters = [
    arrangement.center, 
    ...arrangement.innerRing, 
    ...arrangement.outerRing
  ];
  
  return findPossibleWords(allLetters, arrangement.center);
}
