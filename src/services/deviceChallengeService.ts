import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from './firebase';
import { getDeviceId } from './challengeService';
import gameConfig from '../config/gameConfig.json';

// Collection name for device challenge data
const DEVICE_CHALLENGES_COLLECTION = 'device_challenges';

export interface ParticipatedChallenge {
  challengeId: string;
  role: 'creator' | 'participant';
  joinedAt: number;
  lastPlayed: number;
  bestScore: number;
}

export interface DeviceChallenges {
  deviceId: string;
  challengesCreated: number;
  participatedChallenges: ParticipatedChallenge[];
}

// Initialize device challenge tracking for a new device
export async function initializeDeviceChallenges(): Promise<DeviceChallenges> {
  const deviceId = getDeviceId();
  const deviceChallengesRef = doc(db, DEVICE_CHALLENGES_COLLECTION, deviceId);
  
  // Check if doc already exists
  const docSnap = await getDoc(deviceChallengesRef);
  
  if (!docSnap.exists()) {
    // Create new document for this device
    const newDeviceChallenges: DeviceChallenges = {
      deviceId,
      challengesCreated: 0,
      participatedChallenges: []
    };
    
    await setDoc(deviceChallengesRef, newDeviceChallenges);
    console.log('Initialized device challenges for', deviceId);
    console.log('New device challenges:', newDeviceChallenges);
    return newDeviceChallenges;
  }
  
  return docSnap.data() as DeviceChallenges;
}

// Increment challenge creation counter for a device
export async function incrementChallengesCreated(): Promise<number> {
  const deviceId = getDeviceId();
  const deviceChallengesRef = doc(db, DEVICE_CHALLENGES_COLLECTION, deviceId);
  
  // Check if doc exists
  const docSnap = await getDoc(deviceChallengesRef);
  
  if (!docSnap.exists()) {
    // Initialize first
    await initializeDeviceChallenges();
    // Set count to 1
    await setDoc(deviceChallengesRef, { challengesCreated: 1 }, { merge: true });
    return 1;
  }
  
  // Increment counter
  await updateDoc(deviceChallengesRef, {
    challengesCreated: increment(1)
  });
  
  const updatedDoc = await getDoc(deviceChallengesRef);
  return (updatedDoc.data() as DeviceChallenges).challengesCreated;
}

// Check if device has reached maximum challenge creation limit
export async function hasReachedChallengeLimit(): Promise<boolean> {
  const deviceId = getDeviceId();
  const deviceChallengesRef = doc(db, DEVICE_CHALLENGES_COLLECTION, deviceId);
  
  // Get current count
  const docSnap = await getDoc(deviceChallengesRef);
  
  if (!docSnap.exists()) {
    return false; // No document means no challenges created yet
  }
  
  const { challengesCreated } = docSnap.data() as DeviceChallenges;
  return challengesCreated >= gameConfig.maxChallengesPerDevice;
}

// Record a challenge participation
export async function recordChallengeParticipation(
  challengeId: string,
  score: number,
  role: 'creator' | 'participant' = 'participant'
): Promise<void> {
  const deviceId = getDeviceId();
  const deviceChallengesRef = doc(db, DEVICE_CHALLENGES_COLLECTION, deviceId);
  
  // Check if doc exists
  const docSnap = await getDoc(deviceChallengesRef);
  
  if (!docSnap.exists()) {
    // Initialize first
    await initializeDeviceChallenges();
  }
  
  const now = Date.now();
  
  // Check if this challenge is already in participated list
  const data = docSnap.exists() ? docSnap.data() as DeviceChallenges : null;
  const participated = data?.participatedChallenges || [];
  const existingIndex = participated.findIndex(p => p.challengeId === challengeId);
  
  if (existingIndex >= 0) {
    // Challenge already in list, update if score is better
    const existing = participated[existingIndex];
    if (score > existing.bestScore) {
      // Create updated array
      participated[existingIndex] = {
        ...existing,
        lastPlayed: now,
        bestScore: score
      };
      
      // Update the entire array
      await updateDoc(deviceChallengesRef, {
        participatedChallenges: participated
      });
    } else {
      // Just update the lastPlayed timestamp
      participated[existingIndex] = {
        ...existing,
        lastPlayed: now
      };
      
      await updateDoc(deviceChallengesRef, {
        participatedChallenges: participated
      });
    }
  } else {
    // Add new participation
    await updateDoc(deviceChallengesRef, {
      participatedChallenges: arrayUnion({
        challengeId,
        role,
        joinedAt: now,
        lastPlayed: now,
        bestScore: score
      })
    });
  }
}

// Get all challenges participated in
export async function getParticipatedChallenges(): Promise<ParticipatedChallenge[]> {
  await initializeDeviceChallenges(); // Ensure we have a document
  
  const deviceId = getDeviceId();
  const deviceChallengesRef = doc(db, DEVICE_CHALLENGES_COLLECTION, deviceId);
  
  const docSnap = await getDoc(deviceChallengesRef);
  
  if (!docSnap.exists()) {
    return [];
  }
  
  const { participatedChallenges } = docSnap.data() as DeviceChallenges;
  return participatedChallenges || [];
}