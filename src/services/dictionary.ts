import { Dictionary, DictionaryWord, ProcessedDictionary } from '../models/Dictionary';

// Cache for processed dictionary
let processedDictionaryCache: ProcessedDictionary | null = null;
let dictionaryLoadPromise: Promise<ProcessedDictionary> | null = null;

/**
 * Load the dictionary and process it for efficient lookups
 */
export async function loadDictionary(type: 'sowpods' | 'twl' = 'sowpods'): Promise<ProcessedDictionary> {
  // Return cached dictionary if available
  if (processedDictionaryCache) {
    return processedDictionaryCache;
  }
  
  // Return existing promise if already loading
  if (dictionaryLoadPromise) {
    return dictionaryLoadPromise;
  }
  
  // Create a new loading promise
  dictionaryLoadPromise = new Promise<ProcessedDictionary>(async (resolve, reject) => {
    try {
      const startTime = performance.now();
      
      // Fetch the dictionary file
      const response = await fetch(`/assets/dictionaries/${type}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`);
      }
      
      const wordList: string[] = await response.json();
      console.log(`Loaded ${wordList.length} words from ${type} dictionary`);
      
      // Process the dictionary
      const processedDict = processDictionary(wordList, type);
      processedDictionaryCache = processedDict;
      
      const endTime = performance.now();
      console.log(`Dictionary load: ${endTime - startTime} ms`);
      
      resolve(processedDict);
    } catch (error) {
      console.error('Error loading dictionary:', error);
      
      // Fallback to a minimal dictionary
      const emergencyDict = createEmergencyDictionary();
      processedDictionaryCache = emergencyDict;
      
      resolve(emergencyDict);
    } finally {
      // Clear the loading promise
      dictionaryLoadPromise = null;
    }
  });
  
  return dictionaryLoadPromise;
}

/**
 * Process a list of words into optimized dictionary structures
 */
function processDictionary(wordList: string[], sourceType: 'sowpods' | 'twl' | 'custom'): ProcessedDictionary {
  // Create Set for O(1) word lookups
  const allWords = new Set<string>(wordList);
  
  // Group words by length
  const byLength: Record<number, string[]> = {};
  
  // Group words by first letter
  const byFirstLetter: Record<string, string[]> = {};
  
  // Index words by contained letters (for center letter lookup)
  const centerLetterIndex: Record<string, string[]> = {};
  
  // Track min/max word length
  let minLength = Infinity;
  let maxLength = 0;
  
  // Process each word
  for (const word of wordList) {
    const upperWord = word.toUpperCase();
    const length = upperWord.length;
    const firstLetter = upperWord[0];
    
    // Update min/max
    minLength = Math.min(minLength, length);
    maxLength = Math.max(maxLength, length);
    
    // Group by length
    if (!byLength[length]) {
      byLength[length] = [];
    }
    byLength[length].push(upperWord);
    
    // Group by first letter
    if (!byFirstLetter[firstLetter]) {
      byFirstLetter[firstLetter] = [];
    }
    byFirstLetter[firstLetter].push(upperWord);
    
    // Index by each letter (for center letter lookups)
    for (const char of new Set(upperWord.split(''))) {
      if (!centerLetterIndex[char]) {
        centerLetterIndex[char] = [];
      }
      
      centerLetterIndex[char].push(upperWord);
    }
  }
  
  return {
    allWords,
    byLength,
    byFirstLetter,
    centerLetterIndex,
    meta: {
      wordCount: wordList.length,
      sourceType,
      minLength,
      maxLength
    }
  };
}

/**
 * Create a minimal emergency dictionary if loading fails
 */
function createEmergencyDictionary(): ProcessedDictionary {
  const minimalWordList = [
    'ART', 'STAR', 'START', 'TAP', 'TARDY', 'ARTIST', 'TRAY', 'RAYS', 'ARTS',
    'THE', 'AND', 'THAT', 'HAVE', 'FOR', 'NOT', 'WITH', 'YOU', 'THIS', 'BUT'
  ];
  
  return processDictionary(minimalWordList, 'custom');
}

/**
 * Check if a word is valid according to our dictionary
 */
export function isValidWord(word: string): boolean {
  if (!processedDictionaryCache) {
    throw new Error('Dictionary not loaded. Call loadDictionary() first.');
  }
  
  return processedDictionaryCache.allWords.has(word.toUpperCase());
}

/**
 * Find all possible words that can be formed with a given set of letters
 * and must include the centerLetter
 */
export function findPossibleWords(letters: string[], centerLetter: string): string[] {
  if (!processedDictionaryCache) {
    throw new Error('Dictionary not loaded. Call loadDictionary() first.');
  }
  
  // Get all words containing the center letter
  const centerLetterWords = processedDictionaryCache.centerLetterIndex[centerLetter.toUpperCase()] || [];
  
  // Create a letter frequency map
  const letterCounts: Record<string, number> = {};
  for (const letter of letters) {
    const upperLetter = letter.toUpperCase();
    letterCounts[upperLetter] = (letterCounts[upperLetter] || 0) + 1;
  }
  
  // Filter words that can be formed with the available letters
  // and are not longer than 9 letters
  return centerLetterWords.filter(word => {
    // Skip words longer than 9 letters
    if (word.length > 9) {
      return false;
    }
    
    // Create a copy of the letter counts
    const availableLetters = { ...letterCounts };
    
    // Check if each letter in the word is available
    for (const char of word) {
      if (!availableLetters[char] || availableLetters[char] <= 0) {
        return false;
      }
      availableLetters[char]--;
    }
    
    return true;
  });
}

/**
 * Count the number of words that can be formed with given letters
 */
export function countPossibleWords(letters: string[], centerLetter: string): number {
  return findPossibleWords(letters, centerLetter).length;
}

/**
 * Get dictionary statistics
 */
export function getDictionaryStats(): { wordCount: number, source: string, loaded: boolean } {
  if (!processedDictionaryCache) {
    return { wordCount: 0, source: 'none', loaded: false };
  }
  
  return {
    wordCount: processedDictionaryCache.meta.wordCount,
    source: processedDictionaryCache.meta.sourceType,
    loaded: true
  };
}
