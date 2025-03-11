import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  10% { transform: translateX(-10px); }
  20% { transform: translateX(10px); }
  30% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  50% { transform: translateX(-5px); }
  60% { transform: translateX(5px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const DisplayContainer = styled.div<{ $invalid: boolean }>`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.$invalid ? '#e74c3c' : '#2c3e50'};
  animation: ${props => props.$invalid ? shakeAnimation : 'none'} 0.5s ease;
  position: relative;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 100%;
  font-size: 1rem;
  color: #e74c3c;
  opacity: 0.9;
  animation: ${fadeIn} 0.3s ease;
`;

const WordDisplay: React.FC = () => {
  const { state, clearInvalidWordState } = useGameContext();
  const { currentWord, invalidWordAttempt } = state;

  // Clear invalid state after animation
  useEffect(() => {
    if (invalidWordAttempt) {
      const timer = setTimeout(() => {
        clearInvalidWordState();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [invalidWordAttempt, clearInvalidWordState]);

  return (
    <DisplayContainer $invalid={invalidWordAttempt}>
      {currentWord || (invalidWordAttempt ? 'Invalid Word!' : '')}
      {invalidWordAttempt && (
        <ErrorMessage>
          {currentWord.length < 3 ? 'Too short!' : 'Not in dictionary or already found'}
        </ErrorMessage>
      )}
    </DisplayContainer>
  );
};

export default WordDisplay; 