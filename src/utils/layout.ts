import { Position } from '../models/Petal';
import { LetterArrangement } from '../models/LetterArrangement';

/**
 * Calculate the positions of all petals in the hexagonal flower layout
 * Improved version with clearer tier distinction and better spacing
 */
export function calculateFlowerLayout(
  containerWidth: number, 
  containerHeight: number, 
  letterArrangement: LetterArrangement
): { positions: Position[], connections: [number, number][] } {
  // Calculate center in percentages
  const centerX = 50; // 50%
  const centerY = 50; // 50%
  
  const positions: Position[] = [];
  const connections: [number, number][] = [];
  
  // Center hexagon (index 0) - Tier 1
  positions.push({ x: centerX, y: centerY, z: 0 });
  
  // Inner ring hexagons (Tier 2) with improved spacing
  const innerRingRadius = 20; // Increased radius for better spacing
  const innerCount = letterArrangement.innerRing.length; // Should be 6
  
  const innerIndices: number[] = [];
  
  // Start from top and distribute evenly in a regular hexagon
  for (let i = 0; i < innerCount; i++) {
    // Starting at top (-π/2) and distribute evenly around a circle
    const angle = -Math.PI/2 + (i * (2 * Math.PI / innerCount));
    const x = centerX + innerRingRadius * Math.cos(angle);
    const y = centerY + innerRingRadius * Math.sin(angle);
    
    positions.push({ x, y, z: 0 });
    
    // Center to inner ring connections
    connections.push([0, i + 1]);
    
    innerIndices.push(i + 1);
  }
  
  // Connect inner ring hexagons to each other (adjacent connections)
  for (let i = 0; i < innerCount; i++) {
    const nextIndex = (i + 1) % innerCount;
    connections.push([innerIndices[i], innerIndices[nextIndex]]);
  }
  
  // Verify we have exactly 12 letters in the outer ring
  if (letterArrangement.outerRing.length !== 12) {
    console.error(`ERROR: Outer ring should have exactly 12 letters but has ${letterArrangement.outerRing.length}`);
  }
  
  // Create positions for the outer ring (12 hexagons) - Tier 3
  const outerCount = 12; // 12 hexagons in outer ring
  const outerIndices: number[] = [];
  
  // Calculate evenly spaced positions for ALL outer hexagons - improved positioning
  const outerRingRadius = 31; // Reduced from 36 to create a tighter composition
  
  for (let i = 0; i < outerCount; i++) {
    // Distribute at 30-degree intervals but with slight radial variation
    const angle = -Math.PI/2 + (i * (2 * Math.PI / outerCount));
    
    // Vary the radius slightly based on position - move slightly toward parent
    const closestInnerIndex = Math.round((i / outerCount) * innerCount) % innerCount;
    const innerAngle = -Math.PI/2 + (closestInnerIndex * (2 * Math.PI / innerCount));
    
    // Calculate the angular difference between the outer petal and its parent
    const angleDiff = Math.abs(angle - innerAngle);
    
    // Determine if this is a tier 3 petal with only one parent
    // When angleDiff is very small, the petal is directly aligned with its parent (has only one parent)
    const hasSingleParent = angleDiff < 0.1 || Math.abs(angleDiff - 2 * Math.PI) < 0.1;
    
    let adjustedRadius = outerRingRadius;
    
    if (hasSingleParent) {
      // For petals with only one parent, PUSH OUTWARD to create a clear gap
      adjustedRadius = outerRingRadius + 3; // Add 3 units of outward push
    } else {
      // For other petals, apply the normal pull toward parent
      const radiusAdjustment = 2 * Math.cos(angle - innerAngle);
      adjustedRadius = outerRingRadius - radiusAdjustment;
    }
    
    const x = centerX + adjustedRadius * Math.cos(angle);
    const y = centerY + adjustedRadius * Math.sin(angle);
    
    positions.push({ x, y, z: 0 });
    const outerPetalIndex = positions.length - 1;
    outerIndices.push(outerPetalIndex);
    
    // Find the closest inner ring petal to connect to
    // This maps each outer petal to its most logical inner petal based on angle
    connections.push([innerIndices[closestInnerIndex], outerPetalIndex]);
  }
  
  // Connect outer ring hexagons to adjacent siblings (forming a complete ring)
  for (let i = 0; i < outerCount; i++) {
    const nextIndex = (i + 1) % outerCount;
    connections.push([outerIndices[i], outerIndices[nextIndex]]);
  }
  
  console.log(`Created ${positions.length} positions (expected ${1 + innerCount + outerCount})`);
  console.log(`Created ${outerIndices.length} outer hexagons`);
  
  return { positions, connections };
}