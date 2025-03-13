import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

const ScoreContainer = styled.div`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.small};
  position: relative;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 120px;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.medium};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    min-width: 100px;
  }
`;

const PointsAnimation = styled.div<{ $points: number }>`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${props => {
    if (props.$points > 30) return props.theme.colors.accent;
    if (props.$points > 20) return props.theme.colors.secondary;
    return props.theme.colors.success;
  }};
  font-weight: bold;
  font-size: ${props => {
    if (props.$points > 30) return '2.4rem';
    if (props.$points > 20) return '2.2rem';
    return '1.8rem';
  }};
  animation: scoreFloat 1.5s ease-out forwards;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
  z-index: 1000;
  white-space: nowrap;
  pointer-events: none;
`;

interface ScoreProps {
  score: number;
}

export const Score: React.FC<ScoreProps> = ({ score }) => {
  const { state } = useGameContext();
  const [lastScore, setLastScore] = useState(0);
  const [pointsGained, setPointsGained] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Track score changes to trigger animation
  useEffect(() => {
    // Only show animation for valid words that earn points
    if (state.lastWordScore && state.lastWordScore > 0) {
      setPointsGained(state.lastWordScore);
      setShowAnimation(true);
      
      // Hide animation after it completes
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [state.lastWordScore]);
  
  return (
    <ScoreContainer>
      Score: {score}
      {showAnimation && (
        <PointsAnimation $points={pointsGained}>
          +{pointsGained}
        </PointsAnimation>
      )}
    </ScoreContainer>
  );
}; 