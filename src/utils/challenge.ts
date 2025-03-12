// src/utils/challenge.ts
import { LetterArrangement } from '../models/LetterArrangement';
import { app, db, auth, analytics } from '../services/firebase';
import { Challenge } from '../models/Challenge';

/**
 * Generates a shareable challenge link containing the challenge code
 */
export function generateChallengeLink(code: string, score: number = 0): string {
  try {
    // Handle score parameter
    const scoreParam = score > 0 ? `&score=${score}` : '';
    
    // Build the challenge URL with the challenge code
    return `${window.location.origin}?c=${code}${scoreParam}`;
  } catch (error) {
    console.error('Error generating challenge link:', error);
    return window.location.origin;
  }
}

/**
 * Create a new challenge with the given letter arrangement
 */
export async function createNewChallenge(
  letterArrangement: LetterArrangement
): Promise<{ challengeId: string, code: string }> {
  try {
    // Using challengeService instead of direct firebase reference
    // This will need to be imported and implemented properly
    const { id, code } = await import('../services/challengeService')
      .then(module => module.createChallenge(letterArrangement, 'Player'));
    return { challengeId: id, code };
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw new Error('Failed to create challenge');
  }
}

// Chain functionality has been removed

/**
 * Submit a score for a challenge
 */
export async function submitScore(
  challengeId: string,
  score: number,
  playerName?: string
): Promise<string> {
  try {
    // Using challengeService instead of direct firebase reference
    const { submitChallengeScore } = await import('../services/challengeService');
    // Submit score with empty foundWords array as placeholder
    await submitChallengeScore(challengeId, playerName || 'Player', score, []);
    return "Score submitted successfully";
  } catch (error) {
    console.error('Error submitting score:', error);
    throw new Error('Failed to submit score');
  }
}

/**
 * Detects if the current URL contains a challenge and parses it
 */
export async function detectChallenge(): Promise<{
  challenge: Challenge | null;
  challengerScore: number | null;
}> {
  console.log('Starting challenge detection...');
  const params = new URLSearchParams(window.location.search);
  const challengeCode = params.get('c');
  const challengerScoreStr = params.get('score');
  
  // Parse score as integer, ensuring it's a valid number
  let challengerScore: number | null = null;
  if (challengerScoreStr) {
    const parsedScore = parseInt(challengerScoreStr, 10);
    if (!isNaN(parsedScore) && parsedScore >= 0) {
      challengerScore = parsedScore;
    }
  }
  
  // Log the URL parameters for debugging
  console.log('Challenge detection parameters:', {
    challengeCode,
    rawScoreParam: challengerScoreStr,
    parsedScore: challengerScore,
    fullUrl: window.location.href,
    searchParams: window.location.search,
    allParams: Object.fromEntries(params.entries())
  });
  
  if (!challengeCode) {
    console.log('No challenge code found in URL');
    return { challenge: null, challengerScore: null };
  }
  
  try {
    console.log(`Looking up challenge with code: ${challengeCode}`);
    // Get the challenge by its code using challengeService
    const { getChallengeByCode } = await import('../services/challengeService');
    const challenge = await getChallengeByCode(challengeCode);
    
    if (!challenge) {
      console.log(`No challenge found for code: ${challengeCode}`);
      return { challenge: null, challengerScore: null };
    }
    
    console.log('Challenge found:', {
      id: challenge.id,
      code: challenge.code
    });
    
    return { 
      challenge, 
      challengerScore
    };
  } catch (error) {
    console.error('Error detecting challenge:', error);
    return { challenge: null, challengerScore: null };
  }
}