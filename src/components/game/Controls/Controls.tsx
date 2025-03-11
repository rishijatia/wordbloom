import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

const ControlsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button<{ $variant: 'primary' | 'danger' }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props => 
    props.$variant === 'primary' ? '#2ecc71' : '#e74c3c'};
  color: white;
  
  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: ${props => 
      props.$variant === 'primary' ? '#27ae60' : '#c0392b'};
  }
`;

const Controls: React.FC = () => {
  const { state, submitWord, resetSelection } = useGameContext();
  const { currentWord, gameStatus } = state;
  
  const isDisabled = currentWord.length < 3 || gameStatus !== 'playing';
  
  return (
    <ControlsContainer>
      <Button 
        $variant="primary" 
        onClick={submitWord} 
        disabled={isDisabled}
      >
        Submit
      </Button>
      <Button 
        $variant="danger" 
        onClick={resetSelection}
        disabled={gameStatus !== 'playing'}
      >
        Reset
      </Button>
    </ControlsContainer>
  );
};

export default Controls; 