import { LetterArrangement } from '../models/LetterArrangement';
import { ProcessedDictionary } from '../models/Dictionary';
import { countPossibleWords, findPossibleWords } from './dictionary';
import { countValidPathWords } from './pathValidation';

// Letter frequency groups based on advanced linguistic analysis
const HIGH_FREQ_VOWELS = ['A', 'E']; // Appear in >75% of words
const MED_FREQ_VOWELS = ['I', 'O', 'U']; // Appear in 50-75% of words
const HIGH_FREQ_CONSONANTS = ['R', 'S', 'T', 'N', 'L']; // Appear in >35% of words
const MED_FREQ_CONSONANTS = ['C', 'D', 'P', 'M', 'H']; // Appear in 20-35% of words
const LOW_FREQ_CONSONANTS = ['F', 'W', 'G', 'B', 'Y', 'V', 'K']; // Appear in 10-20% of words
const RARE_CONSONANTS = ['J', 'X', 'Q', 'Z']; // Appear in <5% of words

// Common letter pairs that should be positioned adjacently if possible
const COMMON_PAIRS = [
  ['T', 'H'], ['E', 'R'], ['I', 'N'], ['A', 'N'], 
  ['R', 'E'], ['O', 'N'], ['S', 'T'], ['A', 'T'],
  ['E', 'N'], ['E', 'S'], ['O', 'R'], ['A', 'R']
];

// Position-optimized letter combinations for center letters
const CENTER_POSITION_SCORES: Record<string, number> = {
  // Vowels are excellent center letters as they appear in most words
  'A': 9.5, 'E': 9.8, 'I': 8.6, 'O': 8.2, 'U': 6.5,
  // High-frequency consonants that commonly appear mid-word
  'R': 8.7, 'N': 8.5, 'S': 8.3, 'T': 8.0, 'L': 7.8,
  // Medium-frequency consonants
  'D': 6.9, 'C': 6.5, 'M': 6.4, 'P': 6.0, 'H': 5.9,
  // Lower-frequency letters have lower scores
  'G': 5.0, 'B': 4.8, 'F': 4.5, 'Y': 4.2, 'W': 4.0, 'K': 3.5, 'V': 3.0,
  // Rare letters get the lowest scores
  'J': 2.0, 'X': 1.8, 'Q': 1.5, 'Z': 1.2
};

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
 * Compatible interface with the existing implementation but using enhanced algorithm
 */
export function generateLetterArrangement(
  dictionary: ProcessedDictionary, 
  difficulty: Difficulty = Difficulty.EASY
): LetterArrangement {
  // Use the enhanced algorithm
  return generateOptimizedLetterArrangement(dictionary, difficulty);
}

/**
 * Generate an optimized letter arrangement with enhanced word formation potential
 * Based on linguistic analysis of letter positions in English words
 */
export function generateOptimizedLetterArrangement(
  dictionary: ProcessedDictionary, 
  difficulty: Difficulty = Difficulty.MEDIUM
): LetterArrangement {
  // 1. Select center letter with position-optimized approach
  const centerLetter = selectOptimalCenterLetter(dictionary, difficulty);
  
  // 2. Generate inner ring with strategic pairing to center letter
  const innerRing = generateStrategyInnerRing(centerLetter, dictionary, difficulty);
  
  // 3. Generate outer ring with optimized connections to inner ring
  const outerRing = generateStrategyOuterRing(centerLetter, innerRing, dictionary, difficulty);
  
  // 4. Create and validate arrangement
  const arrangement: LetterArrangement = {
    center: centerLetter,
    innerRing,
    outerRing
  };
  
  // Validate the arrangement generates sufficient possible words
  const wordCount = estimatePossibleWords(arrangement, dictionary);
  console.log(`Arrangement validation: ${wordCount} possible words`);
  
  // Regenerate if below threshold
  const minWordCount = getMinWordCountForDifficulty(difficulty);
  if (wordCount < minWordCount) {
    console.log(`Insufficient word count (${wordCount}), regenerating...`);
    return generateOptimizedLetterArrangement(dictionary, difficulty);
  }
  
  // Debug: Verify outer ring length
  console.log(`Outer ring has ${outerRing.length} letters:`, outerRing);
  if (outerRing.length !== 12) {
    console.error(`ERROR: Outer ring should have 12 letters but has ${outerRing.length}`);
    // Force exactly 12 letters if somehow still incorrect
    while (outerRing.length < 12) {
      outerRing.push('X');
    }
    return {
      center: centerLetter,
      innerRing,
      outerRing: outerRing.slice(0, 12)
    };
  }
  
  return arrangement;
}

/**
 * Select an optimal center letter based on linguistic position analysis
 */
function selectOptimalCenterLetter(
  dictionary: ProcessedDictionary, 
  difficulty: Difficulty
): string {
  // Calculate vowel probability (easier games = more vowels)
  const vowelCenterProbability = 0.8 - (difficulty * 0.1); // 0.7 for medium difficulty
  
  // Candidate pool based on difficulty
  let candidatePool: string[] = [];
  
  // Choose between vowels and consonants based on difficulty
  if (Math.random() < vowelCenterProbability) {
    // Vowel center - higher chance for easier games
    candidatePool = [...HIGH_FREQ_VOWELS];
    
    // Add medium frequency vowels for medium/hard difficulties
    if (difficulty >= Difficulty.MEDIUM) {
      candidatePool = [...candidatePool, ...MED_FREQ_VOWELS];
    }
  } else {
    // Consonant center
    candidatePool = [...HIGH_FREQ_CONSONANTS];
    
    // Add medium frequency consonants for harder difficulties
    if (difficulty >= Difficulty.MEDIUM) {
      // Add some medium frequency consonants (more for harder difficulties)
      const medFreqCount = Math.min(Math.floor(difficulty / 2) + 1, MED_FREQ_CONSONANTS.length);
      candidatePool = [...candidatePool, ...MED_FREQ_CONSONANTS.slice(0, medFreqCount)];
    }
  }
  
  // Weight candidates by their positional score
  const weights = candidatePool.map(letter => CENTER_POSITION_SCORES[letter] || 1);
  
  // Select center letter using weighted random choice
  return weightedRandomSelection(candidatePool, weights);
}

/**
 * Generate inner ring with strategic letter pairs for game balance
 */
function generateStrategyInnerRing(
  centerLetter: string,
  dictionary: ProcessedDictionary,
  difficulty: Difficulty
): string[] {
  const innerRing: string[] = [];
  
  // Determine vowel count based on difficulty (easier = more vowels)
  const targetVowelCount = Math.max(2, Math.min(4, 5 - Math.floor(difficulty / 2)));
  
  // Calculate letter pairing scores with center letter
  const pairingScores = calculateLetterPairingScores(centerLetter, dictionary);
  
  // 1. Add vowels based on their pairing strength with center letter
  const availableVowels = [...HIGH_FREQ_VOWELS, ...MED_FREQ_VOWELS]
    .filter(v => v !== centerLetter)
    .sort((a, b) => (pairingScores[b] || 0) - (pairingScores[a] || 0));
  
  // Add top vowels that pair well with center letter
  for (let i = 0; i < Math.min(targetVowelCount, availableVowels.length); i++) {
    innerRing.push(availableVowels[i]);
  }
  
  // 2. Add consonants based on pairing strength
  const availableConsonants = [
    ...HIGH_FREQ_CONSONANTS, 
    ...MED_FREQ_CONSONANTS
  ]
    .filter(c => c !== centerLetter)
    .sort((a, b) => (pairingScores[b] || 0) - (pairingScores[a] || 0));
  
  // Add top consonants until we reach 6 letters
  while (innerRing.length < 6 && availableConsonants.length > 0) {
    innerRing.push(availableConsonants.shift()!);
  }
  
  // 3. Arrange inner ring to maximize adjacent common pairs
  const arranged = arrangeLettersForPairing(innerRing);
  
  // Ensure we have exactly 6 letters
  return arranged.slice(0, 6);
}

/**
 * Generate outer ring with optimized connections to inner ring
 */
function generateStrategyOuterRing(
  centerLetter: string,
  innerRing: string[],
  dictionary: ProcessedDictionary,
  difficulty: Difficulty
): string[] {
  const outerRing: string[] = [];
  const usedLetters = new Set([centerLetter, ...innerRing]);
  
  // Calculate pairwise scores for each inner ring letter
  const innerLetterPairingScores: Record<string, Record<string, number>> = {};
  
  for (const letter of innerRing) {
    innerLetterPairingScores[letter] = calculateLetterPairingScores(letter, dictionary);
  }
  
  // Each inner letter should influence 2 outer ring positions
  for (let i = 0; i < innerRing.length; i++) {
    const innerLetter = innerRing[i];
    const pairingScores = innerLetterPairingScores[innerLetter];
    
    // For each inner letter, find the top 2 letters that pair well with it
    const candidates = Object.entries(pairingScores)
      .filter(([letter, _]) => !usedLetters.has(letter))
      .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA)
      .map(([letter, _]) => letter);
    
    // Add up to 2 good pairs per inner letter
    for (let j = 0; j < Math.min(2, candidates.length); j++) {
      const letter = candidates[j];
      outerRing.push(letter);
      usedLetters.add(letter);
    }
  }
  
  // Ensure we have a good vowel balance in the outer ring
  const currentVowelCount = outerRing.filter(l => 'AEIOU'.includes(l)).length;
  const targetVowelCount = Math.max(3, Math.min(5, 6 - Math.floor(difficulty / 2)));
  
  // Add or remove vowels as needed
  if (currentVowelCount < targetVowelCount) {
    // Need more vowels
    const missingVowels = targetVowelCount - currentVowelCount;
    const availableVowels = [...HIGH_FREQ_VOWELS, ...MED_FREQ_VOWELS]
      .filter(v => !usedLetters.has(v));
    
    // Add vowels to reach target
    for (let i = 0; i < Math.min(missingVowels, availableVowels.length); i++) {
      if (outerRing.length < 12) {
        outerRing.push(availableVowels[i]);
        usedLetters.add(availableVowels[i]);
      }
    }
  }
  
  // Make sure we have exactly 12 letters for the outer ring
  while (outerRing.length < 12) {
    // Add remaining letters based on frequency
    const remainingPoolsByFrequency = [
      HIGH_FREQ_CONSONANTS,
      MED_FREQ_CONSONANTS,
      LOW_FREQ_CONSONANTS,
      // Include rare consonants only for harder difficulties
      ...(difficulty >= Difficulty.MEDIUM ? [RARE_CONSONANTS] : [])
    ];
    
    // Try adding from each pool in order
    let letterAdded = false;
    for (const pool of remainingPoolsByFrequency) {
      for (const letter of pool) {
        if (!usedLetters.has(letter)) {
          outerRing.push(letter);
          usedLetters.add(letter);
          letterAdded = true;
          break;
        }
      }
      if (letterAdded) break;
    }
    
    // If we couldn't add a new unique letter, allow duplicates
    if (!letterAdded) {
      if (difficulty <= Difficulty.EASY) {
        // For easy difficulties, duplicate a good letter (vowel or common consonant)
        const easyDuplicateCandidates = [...HIGH_FREQ_VOWELS, ...HIGH_FREQ_CONSONANTS];
        outerRing.push(easyDuplicateCandidates[Math.floor(Math.random() * easyDuplicateCandidates.length)]);
      } else {
        // For harder difficulties, add any letter
        const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        outerRing.push(allLetters[Math.floor(Math.random() * allLetters.length)]);
      }
    }
    
    // Safety check to prevent infinite loops
    if (outerRing.length >= 12) break;
  }
  
  // If we somehow have too many letters, trim to exactly 12
  return outerRing.slice(0, 12);
}

/**
 * Arrange letters to maximize common pairs being adjacent
 */
function arrangeLettersForPairing(letters: string[]): string[] {
  // For small arrays, just return as-is
  if (letters.length <= 2) return [...letters];
  
  // Create a matrix of pairing scores between letters
  const pairingMatrix: Record<string, Record<string, number>> = {};
  
  for (const letter of letters) {
    pairingMatrix[letter] = {};
    
    for (const otherLetter of letters) {
      if (letter !== otherLetter) {
        // Check if this pair appears in common pairs
        let pairScore = 0;
        
        for (const [a, b] of COMMON_PAIRS) {
          if ((letter === a && otherLetter === b) || (letter === b && otherLetter === a)) {
            pairScore += 10; // High score for common pairs
          }
        }
        
        // Default score based on letter frequency
        if (pairScore === 0) {
          if (HIGH_FREQ_VOWELS.includes(letter) || HIGH_FREQ_VOWELS.includes(otherLetter)) {
            pairScore += 5;
          } else if (HIGH_FREQ_CONSONANTS.includes(letter) || HIGH_FREQ_CONSONANTS.includes(otherLetter)) {
            pairScore += 4;
          } else if (MED_FREQ_VOWELS.includes(letter) || MED_FREQ_VOWELS.includes(otherLetter)) {
            pairScore += 3;
          }
        }
        
        pairingMatrix[letter][otherLetter] = pairScore;
      }
    }
  }
  
  // Arranging letters to maximize good adjacencies
  const result: string[] = [letters[0]];
  const remaining = new Set(letters.slice(1));
  
  while (remaining.size > 0) {
    const lastLetter = result[result.length - 1];
    let bestNextLetter = '';
    let bestScore = -1;
    
    // Find the best next letter based on pairing score
    for (const candidate of remaining) {
      const score = pairingMatrix[lastLetter][candidate] || 0;
      if (score > bestScore) {
        bestScore = score;
        bestNextLetter = candidate;
      }
    }
    
    // If no good pair found, take the first remaining letter
    if (bestScore <= 0) {
      bestNextLetter = Array.from(remaining)[0];
    }
    
    result.push(bestNextLetter);
    remaining.delete(bestNextLetter);
  }
  
  return result;
}

/**
 * Calculate letter pairing scores based on dictionary analysis
 */
function calculateLetterPairingScores(letter: string, dictionary: ProcessedDictionary): Record<string, number> {
  const scores: Record<string, number> = {};
  
  // Get all words containing the target letter
  const wordsWithLetter = dictionary.centerLetterIndex[letter] || [];
  
  // Count co-occurrences with other letters
  wordsWithLetter.forEach(word => {
    // Get unique letters in the word (excluding the target letter)
    const uniqueLetters = new Set(word.split('').filter(l => l !== letter));
    
    // Increment score for each unique letter that co-occurs
    uniqueLetters.forEach(l => {
      scores[l] = (scores[l] || 0) + 1;
    });
  });
  
  return scores;
}

/**
 * Estimate the number of possible words for an arrangement
 */
function estimatePossibleWords(arrangement: LetterArrangement, dictionary: ProcessedDictionary): number {
  // Use the path validation to get accurate count
  return countValidPathWords(dictionary, arrangement);
}

/**
 * Get minimum word count threshold based on difficulty
 */
function getMinWordCountForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case Difficulty.EASY:
      return 35; // Easy puzzles should have lots of words
    case Difficulty.MEDIUM:
      return 25; // Medium difficulty
    case Difficulty.HARD:
      return 20; // Hard difficulty can have fewer possible words
    default:
      return 25;
  }
}

/**
 * Select an item randomly but weighted by scores
 */
function weightedRandomSelection<T>(items: T[], weights: number[]): T {
  // Ensure arrays are the same length
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Random value between 0 and total weight
  const randomValue = Math.random() * totalWeight;
  
  // Find the selected item
  let cumulativeWeight = 0;
  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += weights[i];
    if (randomValue <= cumulativeWeight) {
      return items[i];
    }
  }
  
  // Fallback to last item if something goes wrong
  return items[items.length - 1];
}

/**
 * Find all possible words for a given letter arrangement
 * Maintains compatibility with existing code
 */
export function findAllPossibleWords(arrangement: LetterArrangement): string[] {
  const allLetters = [
    arrangement.center, 
    ...arrangement.innerRing, 
    ...arrangement.outerRing
  ];
  
  return findPossibleWords(allLetters, arrangement.center);
}

/**
 * Original center letter selection function
 * Kept for reference or backward compatibility
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
 * Original inner ring generation function
 * Kept for reference or backward compatibility
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
 * Original common pairs arrangement function
 * Kept for reference or backward compatibility
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
 * Original function to count letter pairs
 * Kept for reference or backward compatibility
 */
function countPairsWithLetter(letter: string, pairs: string[][]): number {
  return pairs.filter(pair => pair[0] === letter || pair[1] === letter).length;
}

/**
 * Original outer ring generation function
 * Kept for reference or backward compatibility
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