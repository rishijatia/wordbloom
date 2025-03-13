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

// Update these color functions in Petal.tsx
const getColorByTier = (tier: PetalTier, index: number, theme: any): string => {
  switch (tier) {
    case 1: return theme.colors.centerPetal;      // Amber for center
    case 2: return theme.colors.innerPetal;       // Teal for inner ring
    case 3: return theme.colors.outerPetal;       // Lavender for outer ring
    default: return '#ffffff';
  }
};

const getSelectedColorByTier = (tier: PetalTier, index: number, theme: any): string => {
  switch (tier) {
    case 1: return theme.colors.selectedCenterPetal;  // Bright amber
    case 2: return theme.colors.selectedInnerPetal;   // Bright teal
    case 3: return theme.colors.selectedOuterPetal;   // Bright lavender
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
  height: calc(${props => getSizeByTier(props.$tier, props.$index)} * 0.866);
  background-color: ${props => props.$isSelected 
    ? getSelectedColorByTier(props.$tier, props.$index, props.theme)
    : getColorByTier(props.$tier, props.$index, props.theme)};
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  font-weight: bold;
  font-size: ${props => getFontSizeByTier(props.$tier, props.$index)};
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
  box-shadow: ${props => props.$isSelected 
    ? `0 4px 12px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.4)`
    : `0 2px 6px rgba(0, 0, 0, 0.15), inset 0 0 6px rgba(255, 255, 255, 0.3)`};
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  z-index: ${props => props.$isSelected 
    ? 10
    : props.$tier + 2};
  
  /* Position the hexagon */
  left: calc(${props => props.$x}% - ${props => getSizeByTier(props.$tier, props.$index)}/2);
  top: calc(${props => props.$y}% - ${props => getSizeByTier(props.$tier, props.$index)} * 0.433);
  
  /* Visual effects based on state */
  transform: ${props => {
    if (props.$isSelected) return 'scale(1.12) translateZ(0)';
    if (props.$isHighlighted) return 'scale(1.06) translateZ(0)';
    return 'scale(1) translateZ(0)';
  }};
  
  /* Add gradient overlay for 3D effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.4) 0%, 
      rgba(255, 255, 255, 0.1) 50%, 
      rgba(0, 0, 0, 0.05) 100%
    );
    pointer-events: none;
    opacity: ${props => props.$isSelected ? 0.9 : 0.6};
  }
  
  /* Next typing candidate styling - subtle glow */
  ${props => props.$isNextTypingCandidate && !props.$isSelected && `
    animation: glowPulse 1.5s infinite;
  `}
  
  /* Neighbor styling */
  ${props => props.$isNeighbor && !props.$isSelected && `
    box-shadow: 0 0 12px ${getSelectedColorByTier(props.$tier, props.$index, props.theme)}80;
  `}
  
  /* Add subtle hover effect */
  &:hover {
    transform: ${props => props.$isSelected ? 'scale(1.12) translateZ(0)' : 'scale(1.06) translateZ(0)'};
    box-shadow: ${props => props.$isSelected 
      ? `0 6px 16px rgba(0, 0, 0, 0.25), inset 0 0 12px rgba(255, 255, 255, 0.5)`
      : `0 4px 12px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.4)`};
  }
  
  /* Add active press effect */
  &:active {
    transform: scale(0.95) translateZ(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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