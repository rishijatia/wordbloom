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

// Background color based on tier and position
const getColorByTier = (tier: PetalTier, index: number, theme: any): string => {
  switch (tier) {
    case 1: return theme.colors.centerPetal; // Golden yellow for center (Tier 1)
    case 2: return theme.colors.innerPetal; // Teal mint for inner ring (Tier 2)
    case 3: return theme.colors.outerPetal; // Soft purple for outer ring (Tier 3)
    default: return '#ffffff';
  }
};

// Selected color by tier - more vibrant versions for better visual distinction
const getSelectedColorByTier = (tier: PetalTier, index: number, theme: any): string => {
  switch (tier) {
    case 1: return theme.colors.selectedCenterPetal; // Brighter golden for center
    case 2: return theme.colors.selectedInnerPetal; // Brighter teal for inner ring
    case 3: return theme.colors.selectedOuterPetal; // Brighter purple for outer ring
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
    ? getSelectedColorByTier(props.$tier, props.$index, props.theme)
    : getColorByTier(props.$tier, props.$index, props.theme)};
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  font-weight: bold;
  font-size: ${props => getFontSizeByTier(props.$tier, props.$index)};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  user-select: none;
  box-shadow: ${props => props.$isSelected 
    ? props.theme.shadows.medium
    : props.theme.shadows.small};
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  z-index: ${props => props.$isSelected 
    ? 10
    : props.$tier + 2};
  
  /* Position the hexagon */
  left: calc(${props => props.$x}% - ${props => getSizeByTier(props.$tier, props.$index)}/2);
  top: calc(${props => props.$y}% - ${props => getSizeByTier(props.$tier, props.$index)} * 0.433); /* Hexagon height/2 */
  
  /* Visual effects based on state */
  transform: ${props => props.$isSelected 
    ? 'scale(1.08)' 
    : props.$isHighlighted
      ? 'scale(1.04)'
      : 'scale(1)'};
  
  /* Highlight for selected state - solid color instead of border */
  border: none;
  
  /* Next typing candidate styling - subtle glow */
  ${props => props.$isNextTypingCandidate && `
    box-shadow: 0 0 10px ${props.theme.colors.accent};
  `}
  outline: none;
  
  /* Neighbor styling */
  ${props => props.$isNeighbor && !props.$isSelected && `
    background-color: ${getColorByTier(props.$tier, props.$index, props.theme)}; 
    box-shadow: 0 0 8px ${props.theme.colors.activeConnection};
  `}
  
  /* Add subtle pulse animation on hover */
  &:hover {
    transform: ${props => props.$isSelected ? 'scale(1.08)' : 'scale(1.04)'};
    box-shadow: ${props => props.$isSelected 
      ? `0 0 12px ${props.theme.colors.shadow}`
      : `0 0 8px ${props.theme.colors.shadow}`};
  }
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