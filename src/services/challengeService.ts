import { Challenge, ChallengeScore, ChallengePlayer } from '../models/Challenge';
import { LetterArrangement } from '../models/LetterArrangement';
import { db } from './firebase';
import gameConfig from '../config/gameConfig.json';
import { incrementChallengesCreated, hasReachedChallengeLimit, recordChallengeParticipation, getParticipatedChallenges } from './deviceChallengeService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot,
  startAfter,
  DocumentReference,
  DocumentData,
  CollectionReference,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';

// Local storage keys for user-specific data
const DEVICE_ID_KEY = 'wordbloom_device_id';
const PLAYER_NAME_KEY = 'wordbloom_player_name';

// Firestore collection names
const CHALLENGES_COLLECTION = 'challenges';
const CHALLENGE_SCORES_COLLECTION = 'challenge_scores';
const CHALLENGE_CODES_COLLECTION = 'challenge_codes';

// Helper function to generate a unique device ID if not already exists
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Helper function to get/set player name
export function getPlayerName(): string {
  const name = localStorage.getItem(PLAYER_NAME_KEY);
  return name || 'Player';
}

export function savePlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
}

// Generate a unique 6-character code for a challenge
async function generateChallengeCode(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Check if code already exists in Firestore
  const codeRef = doc(db, CHALLENGE_CODES_COLLECTION, code);
  const codeDoc = await getDoc(codeRef);
  
  if (codeDoc.exists()) {
    // Code already exists, generate a new one recursively
    return generateChallengeCode();
  }
  
  return code;
}

// Create a new challenge
export async function createChallenge(
  letterArrangement: LetterArrangement,
  playerName: string
): Promise<Challenge | { error: string }> {
  try {
    // Check if device has reached challenge creation limit
    const hasReachedLimit = await hasReachedChallengeLimit();
    if (hasReachedLimit) {
      return { error: `You've reached the limit of ${gameConfig.maxChallengesPerDevice} created challenges.` };
    }
    
    const deviceId = getDeviceId();
    const code = await generateChallengeCode();
    const createdAt = Date.now();
    // Set expiration to 24 hours after creation using config value
    const expiresAt = createdAt + gameConfig.challengeDurationMs;
    
    // Create challenge document
    const challengeData: Omit<Challenge, 'id'> = {
      code,
      letterArrangement,
      createdBy: deviceId,
      createdByName: playerName,
      createdAt,
      expiresAt,
      playerCount: 1, // Start with 1 because the creator counts as the first player
      maxPlayers: gameConfig.maxPlayers,
      status: 'active',
      totalWordsFound: 0
    };
    
    // Add to challenges collection
    const challengeRef = await addDoc(collection(db, CHALLENGES_COLLECTION), challengeData);
    const challengeId = challengeRef.id;
    
    // Save the code mapping for fast lookup
    await setDoc(doc(db, CHALLENGE_CODES_COLLECTION, code), {
      challengeId,
      createdAt: Date.now()
    });
    
    // Increment the challenge count for this device
    await incrementChallengesCreated();
    
    // Record participation as creator (with a score of 0 initially)
    await recordChallengeParticipation(challengeId, 0, 'creator');
    
    // Return the complete challenge object with the ID
    const challenge: Challenge = {
      id: challengeId,
      ...challengeData
    };
    
    return challenge;
  } catch (error) {
    console.error('Error creating challenge:', error);
    return { error: 'Failed to create challenge. Please try again.' };
  }
}

// Get a challenge by its code
export async function getChallengeByCode(code: string): Promise<Challenge | null> {
  try {
    // Lookup challenge ID from the code mapping
    const codeRef = doc(db, CHALLENGE_CODES_COLLECTION, code.toUpperCase());
    const codeDoc = await getDoc(codeRef);
    
    if (!codeDoc.exists()) {
      return null;
    }
    
    const { challengeId } = codeDoc.data();
    
    // Get the challenge document
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (!challengeDoc.exists()) {
      return null;
    }
    
    // Combine document data with ID
    const challenge: Challenge = {
      id: challengeDoc.id,
      ...challengeDoc.data() as Omit<Challenge, 'id'>
    };
    
    return challenge;
  } catch (error) {
    console.error('Error getting challenge by code:', error);
    return null;
  }
}

// Get a challenge by its ID
export async function getChallengeById(id: string): Promise<Challenge | null> {
  try {
    const challengeRef = doc(db, CHALLENGES_COLLECTION, id);
    const challengeDoc = await getDoc(challengeRef);
    
    if (!challengeDoc.exists()) {
      return null;
    }
    
    // Combine document data with ID
    const challenge: Challenge = {
      id: challengeDoc.id,
      ...challengeDoc.data() as Omit<Challenge, 'id'>
    };
    
    return challenge;
  } catch (error) {
    console.error('Error getting challenge by ID:', error);
    return null;
  }
}

// Store joined challenges in localStorage
const JOINED_CHALLENGES_KEY = 'wordbloom_joined_challenges';

// Get previously joined challenges
function getJoinedChallenges(): string[] {
  const joined = localStorage.getItem(JOINED_CHALLENGES_KEY);
  return joined ? JSON.parse(joined) : [];
}

// Add a challenge to joined list
function addJoinedChallenge(challengeId: string): void {
  const joined = getJoinedChallenges();
  if (!joined.includes(challengeId)) {
    joined.push(challengeId);
    localStorage.setItem(JOINED_CHALLENGES_KEY, JSON.stringify(joined));
  }
}

// Check if a challenge has been joined before
export function hasJoinedChallenge(challengeId: string): boolean {
  const joined = getJoinedChallenges();
  return joined.includes(challengeId);
}

// Join a challenge (update player count)
export async function joinChallenge(code: string, playerName: string): Promise<{ challenge: Challenge | null; error?: string }> {
  try {
    console.log(`Joining challenge with code: ${code} as player: ${playerName}`);
    const challenge = await getChallengeByCode(code);
    
    if (!challenge) {
      console.log('Challenge not found');
      return { challenge: null, error: 'Challenge not found' };
    }
    
    // Check if challenge is full
    if (challenge.status === 'full') {
      console.log('Challenge is full');
      return { challenge, error: 'This challenge is full (10/10 players)' };
    }
    
    const deviceId = getDeviceId();
    
    // Check if this device has already joined this challenge
    if (hasJoinedChallenge(challenge.id) && challenge.createdBy !== deviceId) {
      console.log('Device has already joined this challenge');
      return { 
        challenge, 
        error: 'You have already joined this challenge from this device' 
      };
    }
    
    // Check if this player is the creator, to avoid counting them twice
    if (challenge.createdBy === deviceId) {
      console.log('Player is the creator, not incrementing player count');
      return { challenge }; // Just return the challenge without incrementing
    }
    
    // Update player count
    console.log('Updating player count');
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challenge.id);
    
    // Using Firestore atomic operations
    await updateDoc(challengeRef, {
      playerCount: increment(1)
    });
    
    // Add this challenge to the joined list
    addJoinedChallenge(challenge.id);
    
    // Get the updated challenge
    const updatedChallenge = await getChallengeById(challenge.id);
    
    if (!updatedChallenge) {
      return { challenge: null, error: 'Error updating challenge' };
    }
    
    // If player count has reached max, update status
    if (updatedChallenge.playerCount >= updatedChallenge.maxPlayers) {
      await updateDoc(challengeRef, {
        status: 'full'
      });
      
      // Update local object
      updatedChallenge.status = 'full';
    }
    
    return { challenge: updatedChallenge };
  } catch (error) {
    console.error('Error joining challenge:', error);
    return { challenge: null, error: 'An error occurred when joining the challenge' };
  }
}

// Submit a score for a challenge
export async function submitChallengeScore(
  challengeId: string,
  playerName: string,
  score: number,
  foundWords: string[]
): Promise<{ leaderboard: ChallengeScore[]; playerRank: number } | { error: string }> {
  try {
    console.log(`Submitting score for challenge ${challengeId}`, { 
      playerName, 
      score, 
      wordsCount: foundWords.length 
    });
    
    if (!challengeId) {
      console.error("No challenge ID provided");
      return { error: "Challenge ID is required", leaderboard: [], playerRank: -1 };
    }

    const deviceId = getDeviceId();
    
    // Find the best word (highest score first, then longest)
    const bestWord = foundWords.length > 0 ? 
      foundWords.reduce((best, current) => 
        (current.length > best.length ? current : best), foundWords[0]) : '';
    
    // Create a new score entry document
    const scoreData: Omit<ChallengeScore, 'id'> = {
      challengeId,
      playerId: `${deviceId}_${Date.now()}`,
      playerName,
      score,
      foundWords: foundWords.slice(0, 20), // Limit to 20 words to avoid large documents
      bestWord,
      playedAt: Date.now(),
      deviceId
    };
    
    // First check if player already has a score for this challenge
    console.log(`Checking for existing score for device ${deviceId}`);
    const scoresCollection = collection(db, CHALLENGE_SCORES_COLLECTION);
    let docToAdd: DocumentReference;
    
    try {
      const existingScoreQuery = query(
        scoresCollection,
        where('challengeId', '==', challengeId),
        where('deviceId', '==', deviceId)
      );
      
      const existingScoreSnapshot = await getDocs(existingScoreQuery);
      
      if (!existingScoreSnapshot.empty) {
        // Player already has a score, update if new score is higher
        const existingScoreDoc = existingScoreSnapshot.docs[0];
        const existingScore = existingScoreDoc.data() as ChallengeScore;
        
        console.log(`Found existing score: ${existingScore.score}`);
        
        if (score > existingScore.score) {
          // Update the score
          console.log(`Updating score from ${existingScore.score} to ${score}`);
          docToAdd = doc(db, CHALLENGE_SCORES_COLLECTION, existingScoreDoc.id);
          await updateDoc(docToAdd, {
            score,
            foundWords: scoreData.foundWords,
            bestWord,
            playedAt: Date.now(),
            playerName // Update name in case it changed
          });
        } else {
          console.log(`New score ${score} not higher than existing ${existingScore.score}, not updating`);
          // Still using the existing doc reference for rank calculation
          docToAdd = doc(db, CHALLENGE_SCORES_COLLECTION, existingScoreDoc.id);
        }
      } else {
        // No existing score, create new
        console.log('No existing score found, creating new');
        docToAdd = await addDoc(collection(db, CHALLENGE_SCORES_COLLECTION), scoreData);
      }
    } catch (queryError) {
      console.error('Error checking for existing score:', queryError);
      // If there's an error with the query (e.g., missing index), just add a new score
      console.log('Falling back to adding new score');
      docToAdd = await addDoc(collection(db, CHALLENGE_SCORES_COLLECTION), scoreData);
    }
    
    console.log('Score submitted successfully, getting leaderboard');
    
    // Record this challenge participation for the device
    await recordChallengeParticipation(challengeId, score, 'participant');
    
    // Get updated leaderboard
    const leaderboard = await getChallengeLeaderboard(challengeId);
    
    // Calculate player rank by finding their deviceId in the leaderboard
    const playerScoreIndex = leaderboard.findIndex(s => s.deviceId === deviceId);
    const playerRank = playerScoreIndex !== -1 ? playerScoreIndex + 1 : -1;
    
    console.log(`Player rank: ${playerRank}`);
    
    return { leaderboard, playerRank };
  } catch (error) {
    console.error('Error submitting challenge score:', error);
    throw error;
  }
}

// Get the leaderboard for a challenge
export async function getChallengeLeaderboard(challengeId: string): Promise<ChallengeScore[]> {
  try {
    const scoresCollection = collection(db, CHALLENGE_SCORES_COLLECTION);
    
    // First try with the index (where + orderBy)
    try {
      const leaderboardQuery = query(
        scoresCollection,
        where('challengeId', '==', challengeId),
        orderBy('score', 'desc'),
        limit(10)
      );
      
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      const allScores: ChallengeScore[] = [];
      
      leaderboardSnapshot.forEach(doc => {
        allScores.push({
          id: doc.id,
          ...doc.data() as Omit<ChallengeScore, 'id'>
        });
      });
      
      // Deduplicate scores by deviceId (keep only the highest score per user)
      const uniqueUserScores = allScores.reduce((unique, score) => {
        // If we already have a score for this device, keep the higher one
        const existingIndex = unique.findIndex(s => s.deviceId === score.deviceId);
        if (existingIndex >= 0) {
          if (score.score > unique[existingIndex].score) {
            unique[existingIndex] = score;
          }
        } else {
          unique.push(score);
        }
        return unique;
      }, [] as ChallengeScore[]);
      
      // Resort after deduplication 
      return uniqueUserScores.sort((a, b) => b.score - a.score);
    } catch (indexError) {
      console.warn('Index error, falling back to simple query:', indexError);
      
      // Fallback if index is missing: get all scores for the challenge, then sort in memory
      const simpleQuery = query(
        scoresCollection,
        where('challengeId', '==', challengeId)
      );
      
      const simpleSnapshot = await getDocs(simpleQuery);
      const allScores: ChallengeScore[] = [];
      
      simpleSnapshot.forEach(doc => {
        allScores.push({
          id: doc.id,
          ...doc.data() as Omit<ChallengeScore, 'id'>
        });
      });
      
      // Deduplicate scores by deviceId (keep only the highest score per user)
      const uniqueUserScores = allScores.reduce((unique, score) => {
        // If we already have a score for this device, keep the higher one
        const existingIndex = unique.findIndex(s => s.deviceId === score.deviceId);
        if (existingIndex >= 0) {
          if (score.score > unique[existingIndex].score) {
            unique[existingIndex] = score;
          }
        } else {
          unique.push(score);
        }
        return unique;
      }, [] as ChallengeScore[]);
      
      // Sort in memory and limit to 10
      return uniqueUserScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }
  } catch (error) {
    console.error('Error getting challenge leaderboard:', error);
    return [];
  }
}

// Set up a real-time listener for leaderboard updates
export function subscribeToLeaderboard(
  challengeId: string,
  callback: (leaderboard: ChallengeScore[]) => void
): Unsubscribe {
  console.log(`Setting up real-time listener for challenge ${challengeId}`);
  const scoresCollection = collection(db, CHALLENGE_SCORES_COLLECTION);
  
  // Try with simple query first (no orderBy) to avoid index issues
  const simpleQuery = query(
    scoresCollection,
    where('challengeId', '==', challengeId)
  );
  
  const unsubscribe = onSnapshot(simpleQuery, (snapshot) => {
    try {
      const allScores: ChallengeScore[] = [];
      
      // Check if snapshot is empty
      if (snapshot.empty) {
        console.log(`No scores found for challenge ${challengeId}`);
        callback([]);
        return;
      }
      
      console.log(`Received ${snapshot.docs.length} scores for challenge ${challengeId}`);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Score entry: ${data.playerName} - ${data.score}`);
        
        allScores.push({
          id: doc.id,
          ...data as Omit<ChallengeScore, 'id'>
        });
      });
      
      // Deduplicate scores by deviceId (keep only the highest score per user)
      const uniqueUserScores = allScores.reduce((unique, score) => {
        // If we already have a score for this device, keep the higher one
        const existingIndex = unique.findIndex(s => s.deviceId === score.deviceId);
        if (existingIndex >= 0) {
          if (score.score > unique[existingIndex].score) {
            unique[existingIndex] = score;
          }
        } else {
          unique.push(score);
        }
        return unique;
      }, [] as ChallengeScore[]);
      
      // Sort in memory - show up to 20 scores to ensure we have plenty
      const leaderboard = uniqueUserScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
      
      console.log(`Processed leaderboard with ${leaderboard.length} entries`);
      
      // Added a small timeout to ensure UI updates correctly
      setTimeout(() => {
        callback(leaderboard);
      }, 100);
    } catch (error) {
      console.error('Error processing leaderboard data:', error);
    }
  }, (error) => {
    console.error('Error in leaderboard subscription:', error);
  });
  
  return unsubscribe;
}

// Subscribe to a single challenge for real-time updates
export function subscribeToChallenge(
  challengeId: string,
  callback: (challenge: Challenge | null) => void
): Unsubscribe {
  const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
  
  const unsubscribe = onSnapshot(challengeRef, (snapshot) => {
    if (snapshot.exists()) {
      const challenge: Challenge = {
        id: snapshot.id,
        ...snapshot.data() as Omit<Challenge, 'id'>
      };
      callback(challenge);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in challenge subscription:', error);
    callback(null);
  });
  
  return unsubscribe;
}

// Share a challenge (generates a shareable text)
export function generateChallengeShareText(challenge: Challenge, score?: number): string {
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}?c=${challenge.code}`;
  
  let shareText = `Join my WordBloom challenge with code: ${challenge.code}`;
  
  if (score !== undefined) {
    shareText = `I scored ${score} points in WordBloom! Can you beat me? ${shareText}`;
  }
  
  return shareText;
}

// Get challenge share URL
export function getChallengeShareUrl(challenge: Challenge): string {
  return `${window.location.origin}?c=${challenge.code}`;
}

// Share a challenge using Web Share API if available
export function shareChallenge(challenge: Challenge, score?: number): Promise<void> {
  const shareText = generateChallengeShareText(challenge, score);
  const shareUrl = getChallengeShareUrl(challenge);
  
  const shareData = {
    title: 'WordBloom Challenge',
    text: shareText,
    url: shareUrl
  };
  
  if (navigator.share) {
    return navigator.share(shareData);
  } else {
    // Fallback - copy to clipboard
    navigator.clipboard.writeText(shareText);
    return Promise.resolve();
  }
}

// Parse URL for challenge code
export function parseUrlForChallengeCode(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const challengeCode = urlParams.get('c');
  return challengeCode;
}

// Check if a challenge is expired (client-side check only)
export function isChallengeExpired(challenge: Challenge): boolean {
  return Date.now() > challenge.expiresAt || challenge.status === 'expired';
}

// Get the top score for a challenge
export async function getTopChallengeScore(challengeId: string): Promise<number> {
  try {
    const leaderboard = await getChallengeLeaderboard(challengeId);
    return leaderboard.length > 0 ? leaderboard[0].score : 0;
  } catch (error) {
    console.error('Error getting top challenge score:', error);
    return 0;
  }
}

// Interface for paginated results
export interface PaginatedChallenges {
  challenges: Challenge[];
  lastVisible: any; // Last document for pagination cursor
  totalCount?: number; // Optional total count info
  hasMore: boolean; // Whether there are more records to fetch
}

// Get active challenges (challenges that haven't expired) with pagination
export async function getActiveChallenges(
  lastVisible: any = null, 
  pageSize: number = 20
): Promise<PaginatedChallenges> {
  try {
    const now = Date.now();
    const challengesCollection = collection(db, CHALLENGES_COLLECTION);
    
    // Base query for active challenges
    let activeQuery = query(
      challengesCollection,
      where('status', '==', 'active'),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'asc'), // Sort by expiration time ascending (soonest first)
      limit(pageSize + 1) // Request one extra to check if there are more
    );
    
    // Apply cursor if we're paginating
    if (lastVisible) {
      activeQuery = query(activeQuery, startAfter(lastVisible));
    }
    
    const challengesSnapshot = await getDocs(activeQuery);
    const challenges: Challenge[] = [];
    
    // Process all but potentially the last document (which we use to check for more)
    const hasMore = challengesSnapshot.docs.length > pageSize;
    const docsToProcess = hasMore ? challengesSnapshot.docs.slice(0, pageSize) : challengesSnapshot.docs;
    
    docsToProcess.forEach(doc => {
      challenges.push({
        id: doc.id,
        ...doc.data() as Omit<Challenge, 'id'>
      });
    });
    
    // Get the last visible document for next pagination
    const newLastVisible = docsToProcess.length > 0 ? docsToProcess[docsToProcess.length - 1] : null;
    
    return {
      challenges,
      lastVisible: newLastVisible,
      hasMore
    };
  } catch (error) {
    console.error('Error getting active challenges:', error);
    return {
      challenges: [],
      lastVisible: null,
      hasMore: false
    };
  }
}

// Get challenges created by the current device with pagination
export async function getCreatedChallenges(
  lastVisible: any = null,
  pageSize: number = 20
): Promise<PaginatedChallenges> {
  try {
    const deviceId = getDeviceId();
    const challengesCollection = collection(db, CHALLENGES_COLLECTION);
    
    // Base query for challenges created by this device
    let createdQuery = query(
      challengesCollection,
      where('createdBy', '==', deviceId),
      orderBy('createdAt', 'desc'), // Sort by creation time descending (newest first)
      limit(pageSize + 1) // Request one extra to check if there are more
    );
    
    // Apply cursor if we're paginating
    if (lastVisible) {
      createdQuery = query(createdQuery, startAfter(lastVisible));
    }
    
    const challengesSnapshot = await getDocs(createdQuery);
    const challenges: Challenge[] = [];
    
    // Process all but potentially the last document (which we use to check for more)
    const hasMore = challengesSnapshot.docs.length > pageSize;
    const docsToProcess = hasMore ? challengesSnapshot.docs.slice(0, pageSize) : challengesSnapshot.docs;
    
    docsToProcess.forEach(doc => {
      challenges.push({
        id: doc.id,
        ...doc.data() as Omit<Challenge, 'id'>
      });
    });
    
    // Get the last visible document for next pagination
    const newLastVisible = docsToProcess.length > 0 ? docsToProcess[docsToProcess.length - 1] : null;
    
    return {
      challenges,
      lastVisible: newLastVisible,
      hasMore
    };
  } catch (error) {
    console.error('Error getting created challenges:', error);
    return {
      challenges: [],
      lastVisible: null,
      hasMore: false
    };
  }
}

// Get all of the current user's challenges (both created and participated in)
// Only active challenges are returned
export async function getYourChallenges(
  lastVisible: any = null,
  pageSize: number = 20
): Promise<PaginatedChallenges> {
  try {
    // Get list of all challenge IDs user has participated in
    const participatedList = await getParticipatedChallenges();
    
    if (participatedList.length === 0) {
      return {
        challenges: [],
        lastVisible: null,
        hasMore: false
      };
    }
    
    // Get IDs of the challenges
    const challengeIds = participatedList.map(p => p.challengeId);
    
    // Firestore has a limit of 10 values for 'in' queries
    // We need to fetch in batches and combine
    const now = Date.now();
    const allChallenges: Challenge[] = [];
    
    // Process in batches of 10
    for (let i = 0; i < challengeIds.length; i += 10) {
      const batchIds = challengeIds.slice(i, i + 10);
      
      if (batchIds.length === 0) continue;
      
      // We can only use one inequality filter in Firestore, so we'll fetch by ID
      // and do additional filtering in memory
      const challengesCollection = collection(db, CHALLENGES_COLLECTION);
      const batchQuery = query(
        challengesCollection,
        where('__name__', 'in', batchIds)
      );
      
      const batchSnapshot = await getDocs(batchQuery);
      
      batchSnapshot.forEach(doc => {
        const challenge = {
          id: doc.id,
          ...doc.data() as Omit<Challenge, 'id'>
        };
        // Apply the filters in memory that we removed from the query
        if (challenge.status === 'active' && challenge.expiresAt > now) {
          allChallenges.push(challenge);
        }
      });
    }
    
    // Sort by last played time
    allChallenges.sort((a, b) => {
      const aParticipation = participatedList.find(p => p.challengeId === a.id);
      const bParticipation = participatedList.find(p => p.challengeId === b.id);
      
      if (aParticipation && bParticipation) {
        // Sort by lastPlayed timestamp, most recent first
        return bParticipation.lastPlayed - aParticipation.lastPlayed;
      }
      
      return 0;
    });
    
    // Apply pagination manually since we're not querying directly
    let startIndex = 0;
    if (lastVisible !== null) {
      const lastVisibleIndex = allChallenges.findIndex(c => c.id === lastVisible.id);
      if (lastVisibleIndex !== -1) {
        startIndex = lastVisibleIndex + 1;
      }
    }
    
    // Slice the page we need
    const endIndex = Math.min(startIndex + pageSize, allChallenges.length);
    const pagedChallenges = allChallenges.slice(startIndex, endIndex);
    const hasMore = endIndex < allChallenges.length;
    
    // Get the last visible document for next pagination
    const newLastVisible = pagedChallenges.length > 0 ? pagedChallenges[pagedChallenges.length - 1] : null;
    
    return {
      challenges: pagedChallenges,
      lastVisible: newLastVisible,
      totalCount: allChallenges.length,
      hasMore
    };
  } catch (error) {
    console.error('Error getting your challenges:', error);
    return {
      challenges: [],
      lastVisible: null,
      hasMore: false
    };
  }
}

// Get challenges the current device has participated in
// With 7-day history filter and pagination support
export async function getParticipatedChallengeDetails(
  lastVisible: any = null,
  pageSize: number = 20
): Promise<PaginatedChallenges> {
  try {
    // Get list of participated challenge IDs from device_challenges
    const participatedList = await getParticipatedChallenges();
    
    if (participatedList.length === 0) {
      return {
        challenges: [],
        lastVisible: null,
        hasMore: false
      };
    }
    
    // Calculate date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoTimestamp = oneWeekAgo.getTime();
    
    // Get challenge details for each ID
    const allChallenges: Challenge[] = [];
    
    // Batch into groups of 10 to avoid query limits
    const batchSize = 10;
    for (let i = 0; i < participatedList.length; i += batchSize) {
      const batch = participatedList.slice(i, i + batchSize);
      const batchIds = batch.map(p => p.challengeId);
      
      const challengesCollection = collection(db, CHALLENGES_COLLECTION);
      // Simple query with just the document IDs to avoid Firestore query constraints
      const batchQuery = query(
        challengesCollection,
        where('__name__', 'in', batchIds),
        limit(batchSize)
      );
      
      const batchSnapshot = await getDocs(batchQuery);
      
      batchSnapshot.forEach(doc => {
        allChallenges.push({
          id: doc.id,
          ...doc.data() as Omit<Challenge, 'id'>
        });
      });
    }
    
    // Filter to get only expired challenges from the last 7 days
    const expiredRecentChallenges = allChallenges.filter(challenge => {
      // Must be expired
      const isExpired = isChallengeExpired(challenge);
      // Expiration must be within last 7 days
      const isRecent = challenge.expiresAt >= oneWeekAgoTimestamp;
      
      return isExpired && isRecent;
    });
    
    // Sort by expiration date (most recently expired first)
    expiredRecentChallenges.sort((a, b) => b.expiresAt - a.expiresAt);
    
    // Apply pagination manually since we're not querying directly
    let startIndex = 0;
    if (lastVisible !== null) {
      const lastVisibleIndex = expiredRecentChallenges.findIndex(c => c.id === lastVisible.id);
      if (lastVisibleIndex !== -1) {
        startIndex = lastVisibleIndex + 1;
      }
    }
    
    // Slice the page we need
    const endIndex = Math.min(startIndex + pageSize, expiredRecentChallenges.length);
    const pagedChallenges = expiredRecentChallenges.slice(startIndex, endIndex);
    const hasMore = endIndex < expiredRecentChallenges.length;
    
    // Get the last visible document for next pagination
    const newLastVisible = pagedChallenges.length > 0 ? pagedChallenges[pagedChallenges.length - 1] : null;
    
    return {
      challenges: pagedChallenges,
      lastVisible: newLastVisible,
      totalCount: expiredRecentChallenges.length,
      hasMore
    };
  } catch (error) {
    console.error('Error getting participated challenges:', error);
    return {
      challenges: [],
      lastVisible: null,
      hasMore: false
    };
  }
}