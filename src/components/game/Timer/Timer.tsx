import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

interface TimerProps {
  totalTime: number;
}

const TimerContainer = styled.div<{ $isLowTime: boolean }>`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.$isLowTime ? '#e74c3c' : '#333'};
  transition: color 0.3s ease;
`;

const Timer: React.FC<TimerProps> = ({ totalTime }) => {
  const { state } = useGameContext();
  const { timeRemaining, gameStatus } = state;
  
  const isLowTime = timeRemaining <= 30; // Last 30 seconds
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <TimerContainer $isLowTime={isLowTime}>
      Time: {formatTime(timeRemaining)}
    </TimerContainer>
  );
};

export default Timer; 