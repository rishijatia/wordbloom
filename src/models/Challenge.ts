import { LetterArrangement } from './LetterArrangement';

export interface ChallengePlayer {
  id: string;          // Unique identifier (device ID)
  name: string;        // Player-chosen display name
  score: number;       // Player's highest score
  attempts: number;    // Number of attempts
  bestWords: string[]; // Top scoring words
  lastPlayedAt: number; // Last attempt timestamp
}

export interface Challenge {
  id: string;                   // Firebase document ID
  code: string;                 // 6-character unique code
  letterArrangement: LetterArrangement;
  createdBy: string;            // Player ID or device ID
  createdByName: string;        // Creator's display name
  createdAt: number;            // Creation timestamp
  expiresAt: number;            // Expiration timestamp (24 hours after creation)
  playerCount: number;          // Current player count (0-10)
  maxPlayers: number;           // Set to 10
  status: 'active' | 'full' | 'expired';  // Challenge status
  totalWordsFound?: number;     // Aggregated count of all words found
}

export interface ChallengeScore {
  id: string;                   // Auto-generated ID
  challengeId: string;          // Reference to the challenge
  playerId: string;             // Unique player identifier
  playerName: string;           // Player's display name
  score: number;                // Player's score
  foundWords: string[];         // Words the player found
  bestWord: string;             // Player's highest scoring word
  playedAt: number;             // Timestamp of the attempt
  deviceId: string;             // Device identifier
}