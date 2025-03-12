import React, { useEffect, useState } from 'react';
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

const popupAppearAnimation = keyframes`
  0% { opacity: 0; transform: translate(-50%, -20px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
`;

const popupDisappearAnimation = keyframes`
  0% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
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

const InvalidWordPopup = styled.div<{ $disappearing: boolean }>`
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  white-space: nowrap;
  font-size: 20px;
  animation: ${props => props.$disappearing ? popupDisappearAnimation : popupAppearAnimation} 0.3s ease forwards;
  pointer-events: none;
`;

const WordDisplay: React.FC = () => {
  const { state, clearInvalidWordState, resetSelection } = useGameContext();
  const { currentWord, invalidWordAttempt } = state;
  const [showPopup, setShowPopup] = useState(false);
  const [disappearing, setDisappearing] = useState(false);
  const [invalidReason, setInvalidReason] = useState('');

  // Handle invalid word attempt
  useEffect(() => {
    if (invalidWordAttempt) {
      // Determine reason
      let reason = '';
      if (currentWord.length < 3) {
        reason = 'Too short';
      } else if (!currentWord.includes(state.letterArrangement.center.toUpperCase())) {
        reason = 'Must use center letter';
      } else if (state.foundWords.includes(currentWord)) {
        reason = 'Already found';
      } else {
        reason = 'Word not found';
      }
      
      console.log('Invalid word detected in WordDisplay:', currentWord, 'Reason:', reason);
      setInvalidReason(reason);
      
      // Immediately show the popup
      setShowPopup(true);
      setDisappearing(false);
      
      // Start disappearing animation after a delay
      const disappearTimer = setTimeout(() => {
        console.log('Starting disappear animation');
        setDisappearing(true);
      }, 1500);
      
      // Clear error state and reset selection after animations complete
      const clearTimer = setTimeout(() => {
        console.log('Error state cleared, resetting word');
        clearInvalidWordState();
        resetSelection();
        setShowPopup(false);
      }, 1800);
      
      return () => {
        clearTimeout(disappearTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [invalidWordAttempt, clearInvalidWordState, resetSelection, currentWord, state.letterArrangement.center, state.foundWords]);

  // Log when the popup visibility changes
  useEffect(() => {
    console.log('Popup visibility changed:', showPopup ? 'showing' : 'hidden');
  }, [showPopup]);

  return (
    <>
      <DisplayContainer $invalid={invalidWordAttempt} id="word-display-container">
        {currentWord || ''}
      </DisplayContainer>
      
      {showPopup && (
        <InvalidWordPopup $disappearing={disappearing}>
          {invalidReason}
        </InvalidWordPopup>
      )}
    </>
  );
};

export default WordDisplay; 