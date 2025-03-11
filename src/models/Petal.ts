export type PetalTier = 1 | 2 | 3;

export interface Position {
  x: number;
  y: number;
  z?: number; // For future Three.js implementation
}

export interface PetalState {
  letter: string;
  tier: PetalTier;
  index: number;
  position: Position;
  isSelected: boolean;
  isHighlighted: boolean;
  isNeighbor: boolean;
} 