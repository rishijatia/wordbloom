import React from 'react';
import styled from 'styled-components';
import { PetalTier } from '../../../models/Petal';

interface PetalProps {
  letter: string;
  tier: PetalTier;
  index: number;
  x: number;
  y: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isNeighbor: boolean;
  isNextTypingCandidate?: boolean;
  onClick: (letter: string, tier: PetalTier, index: number) => void;
  onMouseEnter: (tier: PetalTier, index: number) => void;
  onMouseLeave: () => void;
}

// Dynamic sizing based on tier with clearer hierarchy
const getSizeByTier = (tier: PetalTier, index: number): string => {
  switch (tier) {
    case 1: return '22%'; // Largest for center (Tier 1)
    case 2: return '16%'; // Medium for inner ring (Tier 2)
    case 3: return '14%'; // Increased from 12% for better visual balance
    default: return '14%';
  }
};

// Background color based on tier and position - using our new color scheme
const getColorByTier = (tier: PetalTier, index: number): string => {
  switch (tier) {
    case 1: return '#ffcc29'; // Bright yellow for center (Tier 1)
    case 2: return '#4ecdc4'; // Light teal for inner ring (Tier 2)
    case 3: return '#a893db'; // Light lavender for outer ring (Tier 3)
    default: return '#ffffff';
  }
};

// Selected color by tier - brighter versions of our color scheme
const getSelectedColorByTier = (tier: PetalTier, index: number): string => {
  switch (tier) {
    case 1: return '#ffdd55'; // Brighter yellow for center
    case 2: return '#60ede4'; // Brighter teal for inner ring
    case 3: return '#bda8f0'; // Brighter lavender for outer ring
    default: return '#ffffff';
  }
};

// Font size based on tier - increased size differential
const getFontSizeByTier = (tier: PetalTier, index: number): string => {
  switch (tier) {
    case 1: return '2.2rem'; // Largest font for center
    case 2: return '1.4rem'; // Medium font for inner ring
    case 3: return '1.1rem'; // Smallest font for outer ring
    default: return '1.3rem';
  }
};

const HexagonalPetal = styled.div<{
  $tier: PetalTier;
  $index: number;
  $x: number;
  $y: number;
  $isSelected: boolean;
  $isHighlighted: boolean;
  $isNeighbor: boolean;
  $isNextTypingCandidate?: boolean;
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => getSizeByTier(props.$tier, props.$index)};
  height: calc(${props => getSizeByTier(props.$tier, props.$index)} * 0.866); /* Hexagon height ratio */
  background-color: ${props => props.$isSelected 
    ? getSelectedColorByTier(props.$tier, props.$index)
    : getColorByTier(props.$tier, props.$index)};
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  font-weight: bold;
  font-size: ${props => getFontSizeByTier(props.$tier, props.$index)};
  color: #333;
  cursor: pointer;
  user-select: none;
  box-shadow: ${props => props.$isSelected 
    ? '0 0 8px rgba(0, 0, 0, 0.4)' 
    : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  z-index: ${props => props.$isSelected 
    ? 10
    : props.$tier + 2};
  
  /* Position the hexagon */
  left: calc(${props => props.$x}% - ${props => getSizeByTier(props.$tier, props.$index)}/2);
  top: calc(${props => props.$y}% - ${props => getSizeByTier(props.$tier, props.$index)} * 0.433); /* Hexagon height/2 */
  
  /* Visual effects based on state */
  transform: ${props => props.$isSelected 
    ? 'scale(1.05)' 
    : props.$isHighlighted
      ? 'scale(1.02)'
      : 'scale(1)'};
  
  /* Border for selected state */
  border: ${props => props.$isSelected ? '2px solid #333' : 'none'};
  
  /* Next typing candidate styling */
  outline: ${props => props.$isNextTypingCandidate ? '2px dashed #333' : 'none'};
  
  /* Neighbor styling */
  ${props => props.$isNeighbor && !props.$isSelected && `
    background-color: ${getColorByTier(props.$tier, props.$index)}; 
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
  `}
`;

const Petal: React.FC<PetalProps> = ({
  letter,
  tier,
  index,
  x,
  y,
  isSelected,
  isHighlighted,
  isNeighbor,
  isNextTypingCandidate = false,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const handleMouseEnter = () => {
    onMouseEnter(tier, index);
  };
  
  const handleClick = () => {
    onClick(letter, tier, index);
  };
  
  return (
    <HexagonalPetal
      $tier={tier}
      $index={index}
      $x={x}
      $y={y}
      $isSelected={isSelected}
      $isHighlighted={isHighlighted}
      $isNeighbor={isNeighbor}
      $isNextTypingCandidate={isNextTypingCandidate}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {letter}
    </HexagonalPetal>
  );
};

export default Petal;