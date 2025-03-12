import React, { useState } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';
import { getPlayerName, savePlayerName } from '../../../services/challengeService';

const ChallengeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
  gap: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0;
  text-align: center;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #555;
  margin: 0;
  text-align: center;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 1.1rem;
  color: #555;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  
  &:focus {
    border-color: #5ac476;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 10px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: ${props => props.$primary ? '#5ac476' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$primary ? '#4aa366' : '#e0e0e0'};
  }
`;

const LetterDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
`;

const LetterRow = styled.div`
  display: flex;
  gap: 8px;
`;

const LetterTile = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

const CenterLetterTile = styled(LetterTile)`
  background-color: #5ac476;
  color: white;
`;

interface ChallengeCreationScreenProps {
  onCancel: () => void;
  onCreateChallenge: (playerName: string) => void;
}

const ChallengeCreationScreen: React.FC<ChallengeCreationScreenProps> = ({ 
  onCancel, 
  onCreateChallenge 
}) => {
  const { state } = useGameContext();
  const [playerName, setPlayerName] = useState(getPlayerName());
  
  const handleCreate = () => {
    savePlayerName(playerName);
    onCreateChallenge(playerName);
  };
  
  // Display a simplified version of the letter arrangement
  const centerLetter = state.letterArrangement.center.toUpperCase();
  const innerRing = [...state.letterArrangement.innerRing].map(l => l.toUpperCase());
  const outerRing = [...state.letterArrangement.outerRing].map(l => l.toUpperCase());
  
  // Just show a few letters from each ring to give a hint about the challenge
  const innerPreview = innerRing.slice(0, 3);
  const outerPreview = outerRing.slice(0, 4);
  
  return (
    <ChallengeContainer>
      <Title>Create Challenge</Title>
      <Subtitle>Share your game with friends!</Subtitle>
      
      <LetterDisplay>
        <LetterRow>
          {outerPreview.map((letter, index) => (
            <LetterTile key={`outer-${index}`}>{letter}</LetterTile>
          ))}
        </LetterRow>
        <LetterRow>
          {innerPreview.map((letter, index) => (
            <LetterTile key={`inner-${index}`}>{letter}</LetterTile>
          ))}
        </LetterRow>
        <LetterRow>
          <CenterLetterTile>{centerLetter}</CenterLetterTile>
        </LetterRow>
      </LetterDisplay>
      
      <FormGroup>
        <Label htmlFor="playerName">Your Name</Label>
        <Input 
          id="playerName"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
        />
      </FormGroup>
      
      <ButtonGroup>
        <Button onClick={onCancel}>Cancel</Button>
        <Button $primary onClick={handleCreate}>Create Challenge</Button>
      </ButtonGroup>
    </ChallengeContainer>
  );
};

export default ChallengeCreationScreen;