import { PetalState, PetalTier } from '../models/Petal';
import { LetterArrangement } from '../models/LetterArrangement';

/**
 * Check if two hexagons are adjacent to each other
 */
export function arePetalsAdjacent(
  petal1: PetalState, 
  petal2: PetalState, 
  letterArrangement: LetterArrangement
): boolean {
  const tier1 = petal1.tier;
  const index1 = petal1.index;
  const tier2 = petal2.tier;
  const index2 = petal2.index;
  
  // Prevent selecting the exact same petal
  if (tier1 === tier2 && index1 === index2) {
    return false; // Same petal
  }
  
  // Center (Tier 1) is adjacent to all inner ring petals (Tier 2)
  if ((tier1 === 1 && tier2 === 2) || (tier1 === 2 && tier2 === 1)) {
    return true;
  }
  
  // Center (Tier 1) is NOT adjacent to outer ring petals (Tier 3)
  if ((tier1 === 1 && tier2 === 3) || (tier1 === 3 && tier2 === 1)) {
    return false;
  }
  
  // Tier 2 (inner ring) connections to each other
  if (tier1 === 2 && tier2 === 2) {
    const ringSize = letterArrangement.innerRing.length;
    const diff = Math.abs(index1 - index2);
    return diff === 1 || diff === ringSize - 1; // Adjacent or wrap around
  }
  
  // Tier 3 (outer ring) connections to each other
  if (tier1 === 3 && tier2 === 3) {
    const ringSize = letterArrangement.outerRing.length;
    const diff = Math.abs(index1 - index2);
    
    // First, check if they're adjacent in the outer ring
    const areAdjacent = diff === 1 || diff === ringSize - 1;
    
    // But that's not enough! We also need to check if they share a common Tier 2 parent
    // or have adjacent Tier 2 parents
    if (areAdjacent) {
      const innerRingSize = letterArrangement.innerRing.length;
      const outerRingSize = letterArrangement.outerRing.length;
      
      // Calculate the expected parent index in Tier 2 for each Tier 3 petal
      const parent1 = Math.round((index1 / outerRingSize) * innerRingSize) % innerRingSize;
      const parent2 = Math.round((index2 / outerRingSize) * innerRingSize) % innerRingSize;
      
      // Check if they share the same parent
      if (parent1 === parent2) {
        return true;
      }
      
      // Check if their parents are adjacent in the inner ring
      const parentDiff = Math.abs(parent1 - parent2);
      return parentDiff === 1 || parentDiff === innerRingSize - 1;
    }
    
    return false;
  }
  
  // Connection between Tier 2 (inner) and Tier 3 (outer)
  if ((tier1 === 2 && tier2 === 3) || (tier1 === 3 && tier2 === 2)) {
    const innerIndex = tier1 === 2 ? index1 : index2;
    const outerIndex = tier1 === 3 ? index1 : index2;
    
    // With our new evenly distributed layout, each Tier 3 petal connects to the closest Tier 2 petal
    const innerRingSize = letterArrangement.innerRing.length;
    const outerRingSize = letterArrangement.outerRing.length;
    
    // Calculate which inner ring petal this outer petal should connect to
    // This maps each Tier 3 petal to its closest Tier 2 petal based on angle
    const expectedInnerIndex = Math.round((outerIndex / outerRingSize) * innerRingSize) % innerRingSize;
    
    // Also allow connections to the next adjacent inner petal (for petals that sit between two inner petals)
    const nextInnerIndex = (expectedInnerIndex + 1) % innerRingSize;
    const prevInnerIndex = (expectedInnerIndex - 1 + innerRingSize) % innerRingSize;
    
    return innerIndex === expectedInnerIndex || 
           innerIndex === nextInnerIndex || 
           innerIndex === prevInnerIndex;
  }
  
  return false;
}

/**
 * Get the number of petals in a tier
 */
function getTierSize(tier: PetalTier, letterArrangement: LetterArrangement): number {
  switch (tier) {
    case 1:
      return 1; // Center is always just 1 petal
    case 2:
      return letterArrangement.innerRing.length;
    case 3:
      return letterArrangement.outerRing.length;
    default:
      return 0;
  }
}

/**
 * Find all neighbors of a given petal
 */
export function findNeighbors(
  petal: PetalState, 
  allPetals: PetalState[], 
  letterArrangement: LetterArrangement
): PetalState[] {
  return allPetals.filter(p => 
    p !== petal && arePetalsAdjacent(petal, p, letterArrangement)
  );
}