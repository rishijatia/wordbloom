/**
 * Dictionary processing script
 * 
 * Usage: node scripts/process-dictionary.js <input-file> <output-file>
 * Example: node scripts/process-dictionary.js ./dictionary.txt ./public/assets/dictionaries/sowpods.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Settings
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 9;

// Get command line args
const args = process.argv.slice(2);
const inputFile = args[0];
const outputFile = args[1] || './public/assets/dictionaries/sowpods.json';

if (!inputFile) {
  console.error('Error: No input file specified');
  console.log('Usage: node scripts/process-dictionary.js <input-file> <output-file>');
  console.log('Example: node scripts/process-dictionary.js ./dictionary.txt ./public/assets/dictionaries/sowpods.json');
  process.exit(1);
}

// Process the dictionary
console.log(`Processing dictionary from ${inputFile}...`);

try {
  // Read input file
  const rawContent = fs.readFileSync(inputFile, 'utf8');
  
  // Split into words and process
  const words = rawContent
    .split(/\r?\n/)
    .map(word => word.trim().toUpperCase())
    .filter(word => 
      word.length >= MIN_WORD_LENGTH && 
      word.length <= MAX_WORD_LENGTH && 
      /^[A-Z]+$/.test(word)
    )
    .filter(Boolean); // Remove empty strings
  
  // Remove duplicates
  const uniqueWords = [...new Set(words)];
  
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write processed dictionary
  fs.writeFileSync(outputFile, JSON.stringify(uniqueWords));
  
  // Log statistics
  console.log(`Processed ${uniqueWords.length} words (${MIN_WORD_LENGTH}-${MAX_WORD_LENGTH} letters)`);
  console.log(`Dictionary saved to ${outputFile}`);
  
  // Word length distribution
  const lengthDistribution = {};
  for (let i = MIN_WORD_LENGTH; i <= MAX_WORD_LENGTH; i++) {
    lengthDistribution[i] = uniqueWords.filter(word => word.length === i).length;
  }
  console.log('Word length distribution:');
  for (let i = MIN_WORD_LENGTH; i <= MAX_WORD_LENGTH; i++) {
    console.log(`  ${i} letters: ${lengthDistribution[i]} words (${(lengthDistribution[i] / uniqueWords.length * 100).toFixed(1)}%)`);
  }
  
} catch (error) {
  console.error('Error processing dictionary:', error);
  process.exit(1);
}
