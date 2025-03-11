export interface DictionaryWord {
  word: string;
  definition?: string; // Optional for future enhancement
  score?: number; // Precalculated or dynamically calculated
}

// Traditional Dictionary format grouped by first letter
export type Dictionary = Record<string, DictionaryWord[]>;

// Enhanced dictionary structure for optimized lookups
export interface ProcessedDictionary {
  // Set for O(1) word validation
  allWords: Set<string>;
  
  // Words grouped by length for quick access
  byLength: Record<number, string[]>;
  
  // Words grouped by first letter (original format kept for compatibility)
  byFirstLetter: Record<string, string[]>;
  
  // Words containing specific letters (for center letter lookup)
  // This is critical for finding all possible words containing the center letter
  centerLetterIndex: Record<string, string[]>;
  
  // Meta information
  meta: {
    wordCount: number;
    sourceType: 'sowpods' | 'twl' | 'custom';
    minLength: number;
    maxLength: number;
  };
}
