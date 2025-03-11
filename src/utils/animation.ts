import { PetalState } from '../models/Petal';

/**
 * Animation utilities for petal interactions
 */

/**
 * Calculate the angle between two petals (for connection drawing)
 */
export function calculateAngle(petal1: PetalState, petal2: PetalState): number {
  const dx = petal2.position.x - petal1.position.x;
  const dy = petal2.position.y - petal1.position.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

/**
 * Calculate the distance between two petals
 */
export function calculateDistance(petal1: PetalState, petal2: PetalState): number {
  const dx = petal2.position.x - petal1.position.x;
  const dy = petal2.position.y - petal1.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Create a bouncing animation sequence for a word submission
 * This would be implemented with a proper animation library in production
 */
export function createWordSubmissionAnimation(
  petals: PetalState[],
  score: number,
  onComplete: () => void
): void {
  // Timeout simulating an animation sequence
  setTimeout(onComplete, 500);
} 