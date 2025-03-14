import { LetterArrangement } from '../models/LetterArrangement';
import { ProcessedDictionary } from '../models/Dictionary';
import { countValidPathWords, findValidPathWords } from './pathValidation';
import { arePetalsAdjacent } from '../utils/adjacency';

/**
 * Letter frequency groups based on SOWPODS linguistic analysis
 * These frequencies are specifically optimized for 3-6 letter word formation
 */
const PRIMARY_CENTER_LETTERS = ['S', 'R', 'T']; // Proven high-yield center letters (90-100% yield)
const SECONDARY_CENTER_LETTERS = ['A', 'E', 'N', 'L']; // Good center letters (75-89% yield)
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const HIGH_FREQ_CONSONANTS = ['R', 'S', 'T', 'N', 'L']; // Appear in >35% of words
const MED_FREQ_CONSONANTS = ['C', 'D', 'P', 'M', 'H']; // Appear in 20-35% of words
const LOW_FREQ_CONSONANTS = ['F', 'W', 'G', 'B', 'Y', 'V', 'K']; // Appear in 10-20% of words
const RARE_CONSONANTS = ['J', 'X', 'Q', 'Z']; // Appear in <5% of words

// Common patterns that produce many words
const PRODUCTIVE_PREFIXES = ['RE', 'IN', 'UN', 'DI', 'CO', 'PR'];
const PRODUCTIVE_SUFFIXES = ['ER', 'ED', 'ES', 'ING', 'LY'];
const PRODUCTIVE_DIGRAPHS = ['TH', 'HE', 'IN', 'ER', 'AN', 'RE', 'ON', 'AT', 'ES', 'OR'];

/**
 * Difficulty level for letter arrangement
 */
export enum Difficulty {
  EASY = 1,
  MEDIUM = 3,
  HARD = 5
}

/**
 * Enhanced letter arrangement generation that produces balanced, playable puzzles
 * with a focus on producing 50+ words in Easy mode
 */
export function generateOptimizedArrangement(
  dictionary: ProcessedDictionary,
  difficulty: Difficulty = Difficulty.EASY
): LetterArrangement {
  // Track our generation attempts with improved logging
  let attempts = 0;
  const maxAttempts = 20;
  let bestArrangement: LetterArrangement | null = null;
  let maxWordCount = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Generate a candidate arrangement with improved strategy
    const arrangement = generateStrategicCandidate(difficulty);
    
    // Find all valid words for this arrangement
    // Our enhanced validation in pathValidation.ts ensures all words have proper paths
    const validWords = findValidPathWords(dictionary, arrangement);
    const validWordCount = validWords.length;
    
    // Log the current attempt
    console.log(`\nArrangement validation attempt #${attempts}:`);
    console.log(`Center: ${arrangement.center}`);
    console.log(`Inner Ring: ${arrangement.innerRing.join(', ')}`);
    console.log(`Outer Ring: ${arrangement.outerRing.join(', ')}`);
    console.log(`Found ${validWordCount} valid path words:`);
    
    // Group words by length for better readability
    const wordsByLength: { [key: number]: string[] } = {};
    validWords.forEach(word => {
      const len = word.length;
      if (!wordsByLength[len]) wordsByLength[len] = [];
      wordsByLength[len].push(word);
    });
    
    // Print words grouped by length
    Object.keys(wordsByLength)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(length => {
        const words = wordsByLength[Number(length)];
        console.log(`\n${length} letters (${words.length} words):`);
        console.log(words.sort().join(', '));
      });
    
    // Check if this is better than our previous best
    if (validWordCount > maxWordCount) {
      maxWordCount = validWordCount;
      bestArrangement = arrangement;
    }
    
    // Determine minimum word count based on difficulty
    const minWordCount = getMinWordCountForDifficulty(difficulty);
    
    // For easy mode, add extra checks for common patterns
    if (difficulty === Difficulty.EASY) {
      // Count how many common prefixes and suffixes can be formed
      const patternScore = countCommonPatterns(arrangement);
      
      // If we have enough words AND good pattern potential, we've found a winner
      if (validWordCount >= minWordCount && patternScore >= 7) {
        console.log(`\nFound excellent arrangement with ${validWordCount} possible words and ${patternScore} common patterns!`);
        return arrangement;
      }
    } else if (validWordCount >= minWordCount) {
      // For other difficulties, just check the word count
      console.log(`\nFound valid arrangement with ${validWordCount} possible words!`);
      return arrangement;
    }
    
    // Early exit if we found a very good arrangement
    if (validWordCount >= 65) {
      console.log(`\nFound excellent arrangement with ${validWordCount} possible words!`);
      return arrangement;
    }
  }
  
  console.log(`Best arrangement found has ${maxWordCount} words after ${attempts} attempts.`);
  
  // Return the best arrangement we found, or a fall-back if nothing good was found
  return bestArrangement || generateFallbackArrangement();
}

/**
 * Get minimum word count threshold based on difficulty
 */
function getMinWordCountForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case Difficulty.EASY:
      return 50; // Easy puzzles should have at least 50 words
    case Difficulty.MEDIUM:
      return 30; // Medium difficulty
    case Difficulty.HARD:
      return 15; // Hard difficulty can have fewer possible words
    default:
      return 30;
  }
}

/**
 * Generate a strategically optimized letter arrangement
 * with enhanced word formation potential
 */
function generateStrategicCandidate(difficulty: Difficulty): LetterArrangement {
  // 1. Select center letter with strong bias toward high-yield letters
  const centerLetter = selectStrategicCenterLetter(difficulty);
  
  // 2. Generate inner ring (Tier 2) with optimal vowel-consonant ratio
  const innerRing = generateStrategicInnerRing(centerLetter, difficulty);
  
  // 3. Generate outer ring (Tier 3) with complementary letters
  const outerRing = generateStrategicOuterRing(centerLetter, innerRing, difficulty);
  
  // 4. Optimize positions for better adjacency connections
  const optimizedArrangement = optimizeLetterPositions({
    center: centerLetter,
    innerRing,
    outerRing
  });
  
  // Return the complete arrangement
  return optimizedArrangement;
}

/**
 * Select a center letter with strategic weighting
 * based on word formation potential
 */
function selectStrategicCenterLetter(difficulty: Difficulty): string {
  // For easy difficulty, strongly prefer PRIMARY center letters
  if (difficulty === Difficulty.EASY) {
    // 80% chance of using a primary center letter (S, R, T)
    if (Math.random() < 0.8) {
      return PRIMARY_CENTER_LETTERS[Math.floor(Math.random() * PRIMARY_CENTER_LETTERS.length)];
    }
    // 20% chance of using a secondary center letter (A, E, N, L)
    return SECONDARY_CENTER_LETTERS[Math.floor(Math.random() * SECONDARY_CENTER_LETTERS.length)];
  }
  
  // For medium difficulty, use a mix of primary and secondary
  if (difficulty === Difficulty.MEDIUM) {
    // 50% chance of primary, 30% chance of secondary, 20% chance of others
    const rand = Math.random();
    if (rand < 0.5) {
      return PRIMARY_CENTER_LETTERS[Math.floor(Math.random() * PRIMARY_CENTER_LETTERS.length)];
    } else if (rand < 0.8) {
      return SECONDARY_CENTER_LETTERS[Math.floor(Math.random() * SECONDARY_CENTER_LETTERS.length)];
    } else {
      // Use any high or medium frequency consonant not already covered
      const otherOptions = [...HIGH_FREQ_CONSONANTS, ...MED_FREQ_CONSONANTS]
        .filter(c => 
          !PRIMARY_CENTER_LETTERS.includes(c) && 
          !SECONDARY_CENTER_LETTERS.includes(c)
        );
      return otherOptions[Math.floor(Math.random() * otherOptions.length)];
    }
  }
  
  // For hard difficulty, use a wider range of center letters
  // Include some vowels and medium-frequency consonants
  const hardOptions = [
    ...PRIMARY_CENTER_LETTERS,
    ...SECONDARY_CENTER_LETTERS,
    ...MED_FREQ_CONSONANTS,
    'I', 'O' // Add some vowels that aren't already in secondary
  ];
  
  return hardOptions[Math.floor(Math.random() * hardOptions.length)];
}

/**
 * Generate inner ring with strategic vowel-consonant distribution
 * and positioning to enable common word patterns
 */
function generateStrategicInnerRing(centerLetter: string, difficulty: Difficulty): string[] {
  const innerRing: string[] = [];
  
  // Determine if center is a vowel
  const isCenterVowel = VOWELS.includes(centerLetter);
  
  // Target vowel count for inner ring (always 3 for easy mode, decreases with difficulty)
  const targetVowelCount = difficulty === Difficulty.EASY ? 3 : 
                           difficulty === Difficulty.MEDIUM ? 2 : 
                           Math.floor(Math.random() * 2) + 1; // 1-2 for hard
  
  // Available vowels (exclude center if it's a vowel)
  const availableVowels = VOWELS.filter(v => v !== centerLetter);
  
  // Add vowels to inner ring
  for (let i = 0; i < targetVowelCount && availableVowels.length > 0; i++) {
    // For easy mode, prioritize A, E first as they form more words
    if (difficulty === Difficulty.EASY && i < 2 && 
        (availableVowels.includes('A') || availableVowels.includes('E'))) {
      // Prioritize A and E
      const priorityVowels = availableVowels.filter(v => v === 'A' || v === 'E');
      const selectedVowel = priorityVowels[Math.floor(Math.random() * priorityVowels.length)];
      innerRing.push(selectedVowel);
      // Remove the selected vowel from available vowels
      const index = availableVowels.indexOf(selectedVowel);
      availableVowels.splice(index, 1);
    } else {
      // Add a random vowel
      const randomIndex = Math.floor(Math.random() * availableVowels.length);
      innerRing.push(availableVowels[randomIndex]);
      availableVowels.splice(randomIndex, 1);
    }
  }
  
  // For easy mode, ensure we have required consonants for common prefixes/suffixes
  if (difficulty === Difficulty.EASY) {
    // If center is not R, add R to enable RE- prefix and -ER suffix
    if (centerLetter !== 'R' && innerRing.length < 6 && !innerRing.includes('R')) {
      innerRing.push('R');
    }
    
    // If center is not S, add S to enable -S/-ES suffixes
    if (centerLetter !== 'S' && innerRing.length < 6 && !innerRing.includes('S')) {
      innerRing.push('S');
    }
    
    // If center is not T, consider adding T for common patterns
    if (centerLetter !== 'T' && innerRing.length < 6 && !innerRing.includes('T')) {
      innerRing.push('T');
    }
  }
  
  // Fill remaining slots with strategically selected consonants
  const remainingSlots = 6 - innerRing.length;
  
  // Prioritize high-frequency consonants not already included
  const availableHighFreqConsonants = HIGH_FREQ_CONSONANTS
    .filter(c => c !== centerLetter && !innerRing.includes(c));
  
  // Add high-frequency consonants first
  for (let i = 0; i < remainingSlots && i < availableHighFreqConsonants.length; i++) {
    const randomIndex = Math.floor(Math.random() * availableHighFreqConsonants.length);
    innerRing.push(availableHighFreqConsonants[randomIndex]);
    availableHighFreqConsonants.splice(randomIndex, 1);
  }
  
  // If we still need more letters, add medium-frequency consonants
  if (innerRing.length < 6) {
    const availableMedFreqConsonants = MED_FREQ_CONSONANTS
      .filter(c => c !== centerLetter && !innerRing.includes(c));
    
    while (innerRing.length < 6 && availableMedFreqConsonants.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMedFreqConsonants.length);
      innerRing.push(availableMedFreqConsonants[randomIndex]);
      availableMedFreqConsonants.splice(randomIndex, 1);
    }
  }
  
  // In the unlikely case we still need more, add any remaining consonants
  if (innerRing.length < 6) {
    const remainingConsonants = [...LOW_FREQ_CONSONANTS]
      .filter(c => c !== centerLetter && !innerRing.includes(c));
    
    while (innerRing.length < 6 && remainingConsonants.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingConsonants.length);
      innerRing.push(remainingConsonants[randomIndex]);
      remainingConsonants.splice(randomIndex, 1);
    }
  }
  
  // Shuffle inner ring
  return shuffleArray(innerRing);
}

/**
 * Generate outer ring with complementary letters to maximize word formation
 */
function generateStrategicOuterRing(
  centerLetter: string,
  innerRing: string[],
  difficulty: Difficulty
): string[] {
  const outerRing: string[] = [];
  
  // Get all letters currently in use
  const usedLetters = [centerLetter, ...innerRing];
  
  // Count existing vowels
  const existingVowels = usedLetters.filter(l => VOWELS.includes(l));
  
  // For easy mode, aim for a total of 7-8 vowels across all tiers
  // For medium, aim for 6-7, and for hard, aim for 5-6
  const targetTotalVowels = difficulty === Difficulty.EASY ? 
                           Math.random() < 0.5 ? 8 : 7 : 
                           difficulty === Difficulty.MEDIUM ?
                           Math.random() < 0.5 ? 7 : 6 :
                           Math.random() < 0.5 ? 6 : 5;
  
  // Calculate how many more vowels we need in the outer ring
  const targetOuterVowels = Math.max(0, targetTotalVowels - existingVowels.length);
  
  // Available vowels (excluding those already used)
  const availableVowels = VOWELS.filter(v => !usedLetters.includes(v));
  
  // If we need more vowels than unique ones available, we'll need to add duplicates
  const uniqueVowelsToAdd = Math.min(targetOuterVowels, availableVowels.length);
  
  // Add unique vowels first
  for (let i = 0; i < uniqueVowelsToAdd; i++) {
    outerRing.push(availableVowels[i]);
  }
  
  // If we need more vowels, add duplicates of existing vowels
  const duplicateVowelsNeeded = targetOuterVowels - uniqueVowelsToAdd;
  
  for (let i = 0; i < duplicateVowelsNeeded; i++) {
    // Prioritize duplication of A and E as they're most useful
    const vowelsToConsider = existingVowels.filter(v => v === 'A' || v === 'E');
    
    if (vowelsToConsider.length > 0) {
      outerRing.push(vowelsToConsider[Math.floor(Math.random() * vowelsToConsider.length)]);
    } else {
      // If no A or E, just duplicate any existing vowel
      outerRing.push(existingVowels[Math.floor(Math.random() * existingVowels.length)]);
    }
  }
  
  // For easy mode, ensure inclusion of letters needed for common word patterns
  if (difficulty === Difficulty.EASY) {
    // Check if we need to add D for -ED suffix
    if (!usedLetters.includes('D') && !outerRing.includes('D')) {
      outerRing.push('D');
    }
    
    // Check if we need to add N for -ING suffix (I & G checked separately)
    if (!usedLetters.includes('N') && !outerRing.includes('N')) {
      outerRing.push('N');
    }
    
    // Check if we need to add G for -ING suffix
    if (!usedLetters.includes('G') && !outerRing.includes('G')) {
      outerRing.push('G');
    }
  }
  
  // Add high-frequency consonants that aren't already used
  const availableHighFreqConsonants = HIGH_FREQ_CONSONANTS
    .filter(c => !usedLetters.includes(c) && !outerRing.includes(c));
  
  // For easy mode, prioritize adding 4-5 high-frequency consonants
  const highFreqToAdd = difficulty === Difficulty.EASY ? 
                        Math.min(5, availableHighFreqConsonants.length) : 
                        Math.min(3, availableHighFreqConsonants.length);
  
  for (let i = 0; i < highFreqToAdd; i++) {
    outerRing.push(availableHighFreqConsonants[i]);
  }
  
  // Add medium-frequency consonants
  const availableMedFreqConsonants = MED_FREQ_CONSONANTS
    .filter(c => !usedLetters.includes(c) && !outerRing.includes(c));
  
  const medFreqToAdd = difficulty === Difficulty.EASY ? 
                      Math.min(3, availableMedFreqConsonants.length) : 
                      Math.min(4, availableMedFreqConsonants.length);
  
  for (let i = 0; i < medFreqToAdd && outerRing.length < 11; i++) {
    outerRing.push(availableMedFreqConsonants[i]);
  }
  
  // Add low-frequency consonants
  if (outerRing.length < 11) {
    const availableLowFreqConsonants = LOW_FREQ_CONSONANTS
      .filter(c => !usedLetters.includes(c) && !outerRing.includes(c));
    
    // Add 1-2 low-frequency consonants
    const lowFreqToAdd = Math.min(2, availableLowFreqConsonants.length);
    
    for (let i = 0; i < lowFreqToAdd && outerRing.length < 11; i++) {
      outerRing.push(availableLowFreqConsonants[i]);
    }
  }
  
  // For harder difficulties, consider adding a rare consonant
  const shouldAddRareConsonant = difficulty === Difficulty.HARD ? 
                              Math.random() < 0.7 : // 70% chance for hard
                              difficulty === Difficulty.MEDIUM ? 
                              Math.random() < 0.4 : // 40% chance for medium
                              Math.random() < 0.1;  // 10% chance for easy
  
  if (shouldAddRareConsonant && outerRing.length < 12) {
    const availableRareConsonants = RARE_CONSONANTS
      .filter(c => !usedLetters.includes(c) && !outerRing.includes(c));
    
    if (availableRareConsonants.length > 0) {
      const rareIndex = Math.floor(Math.random() * availableRareConsonants.length);
      outerRing.push(availableRareConsonants[rareIndex]);
    }
  }
  
  // Fill any remaining slots with duplicates of high-value consonants
  while (outerRing.length < 12) {
    // Prioritize duplicating high-frequency consonants that form common patterns
    const consonantsToConsider = [...usedLetters, ...outerRing]
      .filter(c => HIGH_FREQ_CONSONANTS.includes(c));
    
    if (consonantsToConsider.length > 0) {
      outerRing.push(consonantsToConsider[Math.floor(Math.random() * consonantsToConsider.length)]);
    } else {
      // Fall back to any consonant from high/medium frequency lists
      const fallbackConsonant = HIGH_FREQ_CONSONANTS[Math.floor(Math.random() * HIGH_FREQ_CONSONANTS.length)];
      outerRing.push(fallbackConsonant);
    }
  }
  
  // Shuffle the outer ring
  return shuffleArray(outerRing);
}

/**
 * Optimize letter positions for better adjacency and word formation
 */
function optimizeLetterPositions(arrangement: LetterArrangement): LetterArrangement {
  const { center, innerRing, outerRing } = arrangement;
  
  // Create optimized inner ring
  const optimizedInnerRing = [...innerRing];
  
  // If center is R, place E in the first position of inner ring for RE- prefix
  if (center === 'R' && innerRing.includes('E')) {
    const eIndex = optimizedInnerRing.indexOf('E');
    [optimizedInnerRing[0], optimizedInnerRing[eIndex]] = 
      [optimizedInnerRing[eIndex], optimizedInnerRing[0]];
  }
  
  // If center is E, place R in the first position of inner ring for -ER suffix
  if (center === 'E' && innerRing.includes('R')) {
    const rIndex = optimizedInnerRing.indexOf('R');
    [optimizedInnerRing[0], optimizedInnerRing[rIndex]] = 
      [optimizedInnerRing[rIndex], optimizedInnerRing[0]];
  }
  
  // Try to position common digraph pairs next to each other in the inner ring
  for (const digraph of PRODUCTIVE_DIGRAPHS) {
    const firstLetter = digraph[0];
    const secondLetter = digraph[1];
    
    // Check if both letters of the digraph are in the inner ring
    if (optimizedInnerRing.includes(firstLetter) && optimizedInnerRing.includes(secondLetter)) {
      const firstIndex = optimizedInnerRing.indexOf(firstLetter);
      const secondIndex = optimizedInnerRing.indexOf(secondLetter);
      
      // If they're not already adjacent, try to make them adjacent
      if (Math.abs(firstIndex - secondIndex) > 1 && 
          Math.abs(firstIndex - secondIndex) !== optimizedInnerRing.length - 1) {
        // Move the second letter next to the first
        const temp = optimizedInnerRing[secondIndex];
        optimizedInnerRing.splice(secondIndex, 1);
        
        // Insert after the first letter
        const targetIndex = firstIndex < optimizedInnerRing.length - 1 ? 
                          firstIndex + 1 : 0;
        optimizedInnerRing.splice(targetIndex, 0, temp);
        
        // Only make one adjustment per pass to avoid over-optimizing
        break;
      }
    }
  }
  
  // For optimized outer ring, we'll keep the original shuffled order
  // as the adjacency is determined by the flower layout
  return {
    center,
    innerRing: optimizedInnerRing,
    outerRing
  };
}

/**
 * Count how many common word-forming patterns are possible
 * with a given letter arrangement
 */
function countCommonPatterns(arrangement: LetterArrangement): number {
  // Get all letters in the arrangement
  const allLetters = [
    arrangement.center, 
    ...arrangement.innerRing, 
    ...arrangement.outerRing
  ].map(letter => letter.toUpperCase());
  
  const letterSet = new Set(allLetters);
  
  let patternCount = 0;
  
  // Check prefixes
  for (const prefix of PRODUCTIVE_PREFIXES) {
    let canForm = true;
    for (const letter of prefix) {
      if (!letterSet.has(letter)) {
        canForm = false;
        break;
      }
    }
    if (canForm) patternCount++;
  }
  
  // Check suffixes
  for (const suffix of PRODUCTIVE_SUFFIXES) {
    let canForm = true;
    for (const letter of suffix) {
      if (!letterSet.has(letter)) {
        canForm = false;
        break;
      }
    }
    if (canForm) patternCount++;
  }
  
  // Check digraphs
  for (const digraph of PRODUCTIVE_DIGRAPHS) {
    if (letterSet.has(digraph[0]) && letterSet.has(digraph[1])) {
      patternCount++;
    }
  }
  
  return patternCount;
}

/**
 * Generate a fallback arrangement guaranteed to have good letter distribution
 */
function generateFallbackArrangement(): LetterArrangement {
  // Use one of the proven high-performance arrangements from the logs
  const preMadeArrangements = [
    {
      center: 'R',
      innerRing: ['U', 'E', 'T', 'O', 'A', 'D'],
      outerRing: ['F', 'I', 'K', 'T', 'Y', 'N', 'M', 'D', 'L', 'C', 'W', 'S']
    },
    {
      center: 'S',
      innerRing: ['A', 'U', 'L', 'E', 'R', 'O'],
      outerRing: ['T', 'P', 'M', 'N', 'W', 'V', 'I', 'C', 'G', 'K', 'D', 'R']
    },
    {
      center: 'R',
      innerRing: ['N', 'L', 'I', 'E', 'O', 'A'],
      outerRing: ['S', 'B', 'F', 'D', 'U', 'T', 'H', 'G', 'W', 'V', 'S', 'Y']
    }
  ];
  
  // Select a random pre-made arrangement
  return preMadeArrangements[Math.floor(Math.random() * preMadeArrangements.length)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 