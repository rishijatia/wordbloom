import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

interface TimerProps {
  totalTime: number;
  timeRemaining: number;
}

const TimerContainer = styled.div<{ $isLowTime: boolean; timeRemaining: number; totalTime: number; }>`
  font-size: 1.2rem;
  font-weight: bold;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.small};
  color: ${props => props.$isLowTime ? props.theme.colors.danger : props.theme.colors.text};
  transition: color 0.3s ease;
  position: relative;
  overflow: hidden;
  
  /* Add timer progress background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => (props.timeRemaining / props.totalTime) * 100}%;
    background: ${props => props.$isLowTime 
      ? 'rgba(224, 93, 85, 0.15)' 
      : 'rgba(90, 172, 110, 0.15)'};
    transition: width 1s linear, background 0.5s ease;
    z-index: 0;
  }
  
  /* Position text above the progress bar */
  & > * {
    position: relative;
    z-index: 1;
  }
  
  /* Pulsing animation for low time */
  ${props => props.$isLowTime && `
    animation: glowPulse 1.5s infinite;
  `}
`;

const Timer: React.FC<TimerProps> = ({ totalTime, timeRemaining }) => {
  const isLowTime = timeRemaining <= 30; // Last 30 seconds
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <TimerContainer 
      $isLowTime={isLowTime} 
      timeRemaining={timeRemaining} 
      totalTime={totalTime}
    >
      <span>Time: {formatTime(timeRemaining)}</span>
    </TimerContainer>
  );
};

export default Timer; 