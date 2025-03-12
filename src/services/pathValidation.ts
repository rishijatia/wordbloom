import { LetterArrangement } from '../models/LetterArrangement';
import { PetalState, PetalTier } from '../models/Petal';
import { ProcessedDictionary } from '../models/Dictionary';
import { arePetalsAdjacent as utilsArePetalsAdjacent } from '../utils/adjacency';

/**
 * Validates the integrity of a complete path to ensure all consecutive petals are truly adjacent
 * This helps catch edge cases where invalid paths might be reported as valid
 */
function validatePathIntegrity(path: PetalState[], arrangement: LetterArrangement): boolean {
  // A path with 0 or 1 petals is trivially valid
  if (path.length <= 1) return true;
  
  // Check each consecutive pair of petals in the path
  for (let i = 0; i < path.length - 1; i++) {
    const currentPetal = path[i];
    const nextPetal = path[i + 1];
    
    // Verify strict adjacency between consecutive petals
    if (!utilsArePetalsAdjacent(currentPetal, nextPetal, arrangement)) {
      // Found an invalid transition - the path is broken
      return false;
    }
  }
  
  // Ensure the path contains the center letter when required
  const centerPetal = path.find(p => p.tier === 1);
  if (!centerPetal) {
    return false;
  }
  
  // All transitions are valid, path is intact
  return true;
}

/**
 * Enhanced validation specifically for longer words (> 6 letters)
 * Enforces stricter path rules to avoid issues with complex paths
 */
function validateLongWordPath(path: PetalState[], arrangement: LetterArrangement): boolean {
  // For longer words, we need more rigorous validation
  // A path with 0 or 1 petals is trivially valid
  if (path.length <= 1) return true;
  
  // Ensure path contains the center petal
  const centerIndex = path.findIndex(p => p.tier === 1);
  if (centerIndex === -1) {
    return false;
  }
  
  // Check each consecutive pair of petals in the path
  for (let i = 0; i < path.length - 1; i++) {
    const currentPetal = path[i];
    const nextPetal = path[i + 1];
    
    // Verify strict adjacency between consecutive petals
    // This now uses our improved adjacency function that properly handles Tier 3 to Tier 3 connections
    if (!utilsArePetalsAdjacent(currentPetal, nextPetal, arrangement)) {
      return false;
    }
  }
  
  // Verify transitions around the center letter
  if (centerIndex > 0 && centerIndex < path.length - 1) {
    const beforeCenter = path[centerIndex - 1];
    const afterCenter = path[centerIndex + 1];
    
    // Both petals adjacent to center must be in Tier 2 (inner ring)
    if (beforeCenter.tier !== 2 || afterCenter.tier !== 2) {
      return false;
    }
  }
  
  return true;
}

/**
 * Create a simplified petal state for pathfinding
 */
function createPetalState(
  letter: string,
  tier: PetalTier,
  index: number
): PetalState {
  return {
    letter,
    tier,
    index,
    position: { x: 0, y: 0 }, // Position isn't needed for path validation
    isSelected: false,
    isHighlighted: false,
    isNeighbor: false
  };
}

/**
 * Convert a letter arrangement to array of petal states
 */
function arrangementToPetals(arrangement: LetterArrangement): PetalState[] {
  const petals: PetalState[] = [];
  
  // Center petal (Tier 1)
  petals.push(createPetalState(arrangement.center, 1, 0));
  
  // Inner ring petals (Tier 2)
  arrangement.innerRing.forEach((letter, index) => {
    petals.push(createPetalState(letter, 2, index));
  });
  
  // Outer ring petals (Tier 3)
  arrangement.outerRing.forEach((letter, index) => {
    petals.push(createPetalState(letter, 3, index));
  });
  
  return petals;
}

// Note: We're now using the utilsArePetalsAdjacent function imported from ../utils/adjacency.ts

/**
 * Find all valid paths that spell a given word
 * Returns array of paths, where each path is an array of petal indices
 * Now includes enhanced strict path validation
 */
function findValidPaths(
  word: string,
  petals: PetalState[],
  letterArrangement: LetterArrangement,
  mustIncludeCenter: boolean = true
): PetalState[][] {
  word = word.toUpperCase();
  const validPaths: PetalState[][] = [];
  
  // Check if center letter is required and present in the word
  if (mustIncludeCenter) {
    const centerPetal = petals.find(p => p.tier === 1);
    if (!centerPetal || !word.includes(centerPetal.letter.toUpperCase())) {
      return [];
    }
  }
  
  // Filter petals that match the first letter
  const firstLetter = word[0];
  const startPetals = petals.filter(petal => 
    petal.letter.toUpperCase() === firstLetter
  );
  
  // Try each starting petal
  for (const startPetal of startPetals) {
    const path: PetalState[] = [startPetal];
    findPathDFS(word, 1, path, petals, validPaths, letterArrangement);
  }
  
  return validPaths;
}

/**
 * Depth-first search to find all valid paths, with enhanced path validation
 */
function findPathDFS(
  word: string,
  position: number,
  currentPath: PetalState[],
  allPetals: PetalState[],
  validPaths: PetalState[][],
  letterArrangement: LetterArrangement
): void {
  // If we've used all letters in the word, we found a valid path
  if (position >= word.length) {
    validPaths.push([...currentPath]);
    return;
  }
  
  // Get the current letter we're looking for
  const currentLetter = word[position].toUpperCase();
  
  // Get the last petal in our current path
  const lastPetal = currentPath[currentPath.length - 1];
  
  // Find all adjacent petals with the current letter
  for (const petal of allPetals) {
    // Skip if already in path or not adjacent to last petal
    if (
      currentPath.includes(petal) ||
      !utilsArePetalsAdjacent(lastPetal, petal, letterArrangement) ||
      petal.letter.toUpperCase() !== currentLetter
    ) {
      continue;
    }
    
    // Add to path and continue search
    currentPath.push(petal);
    findPathDFS(word, position + 1, currentPath, allPetals, validPaths, letterArrangement);
    currentPath.pop(); // Backtrack
  }
}

/**
 * Check if a word can be formed with valid connected paths
 */
export function canFormWordWithValidPath(
  word: string,
  arrangement: LetterArrangement,
  mustIncludeCenter: boolean = true
): boolean {
  // Convert to uppercase for case-insensitive comparison
  word = word.toUpperCase();
  
  // Quick invalid check by length
  if (word.length < 3 || word.length > 9) {
    return false;
  }
  
  // Convert arrangement to petals
  const petals = arrangementToPetals(arrangement);
  
  // Find all valid paths for this word
  const validPaths = findValidPaths(word, petals, arrangement, mustIncludeCenter);
  
  // Ensure we have at least one valid path
  if (validPaths.length === 0) {
    return false;
  }
  
  // Additional integrity check to ensure the path is fully valid
  // For long words, we verify each path step carefully
  if (word.length > 6) {
    // Use more strict validation for longer words
    return validateLongWordPath(validPaths[0], arrangement);
  }
  
  // For shorter words, standard validation is sufficient
  return validatePathIntegrity(validPaths[0], arrangement);
}

/**
 * Find all words from dictionary that can be formed with valid paths
 */
export function findValidPathWords(
  dictionary: ProcessedDictionary,
  arrangement: LetterArrangement
): string[] {
  // Get all words containing the center letter from dictionary
  const centerLetterWords = dictionary.centerLetterIndex[arrangement.center.toUpperCase()] || [];
  
  // Get all available letters in the arrangement
  const allLetters = [
    arrangement.center,
    ...arrangement.innerRing,
    ...arrangement.outerRing
  ].map(letter => letter.toUpperCase());
  
  // Create letter frequency map
  const letterCounts: Record<string, number> = {};
  for (const letter of allLetters) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }
  
  // First, filter words that can potentially be formed with available letters
  const potentialWords = centerLetterWords.filter(word => {
    // Skip words that are too long or too short
    if (word.length < 3 || word.length > 9) {
      return false;
    }
    
    // Check if we have all letters needed to form the word
    const wordLetterCounts: Record<string, number> = {};
    for (const letter of word) {
      wordLetterCounts[letter] = (wordLetterCounts[letter] || 0) + 1;
    }
    
    // Make sure we have enough of each letter
    for (const letter in wordLetterCounts) {
      if (!letterCounts[letter] || letterCounts[letter] < wordLetterCounts[letter]) {
        return false;
      }
    }
    
    return true;
  });
  
  // Convert arrangement to petals for path finding
  const petals = arrangementToPetals(arrangement);
  
  // For each potential word, check if it can be formed with a valid path
  const validWords: string[] = [];
  
  for (const word of potentialWords) {
    // First find valid paths for this word
    const validPaths = findValidPaths(word, petals, arrangement, true);
    
    // Only consider words where we found at least one valid path
    if (validPaths.length > 0) {
      // Apply additional validation for longer words
      let isValidPath = true;
      
      if (word.length > 6) {
        // Stricter validation for longer words
        isValidPath = validateLongWordPath(validPaths[0], arrangement);
      } else {
        // Standard validation for shorter words
        isValidPath = validatePathIntegrity(validPaths[0], arrangement);
      }
      
      if (isValidPath) {
        validWords.push(word);
      }
    }
  }
  
  return validWords;
}

/**
 * Count the number of words that can be formed with valid paths
 */
export function countValidPathWords(
  dictionary: ProcessedDictionary,
  arrangement: LetterArrangement
): number {
  return findValidPathWords(dictionary, arrangement).length;
}

/**
 * Enhanced version of the original letter arrangement validation
 * that takes into account the connectivity constraints
 */
export function validateArrangement(
  arrangement: LetterArrangement,
  dictionary: ProcessedDictionary,
  minWordCount: number = 25
): boolean {
  const validWordCount = countValidPathWords(dictionary, arrangement);
  return validWordCount >= minWordCount;
} 