import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  getPlayerName, 
  savePlayerName, 
  getChallengeByCode,
  joinChallenge,
  parseUrlForChallengeCode
} from '../../../services/challengeService';
import { Challenge } from '../../../models/Challenge';

const EntryContainer = styled.div`
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
  margin-top: 20px;
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
  
  &:disabled {
    background-color: #cccccc;
    color: #888888;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 1rem;
  margin-top: 5px;
`;

const LoadingMessage = styled.div`
  color: #555;
  font-size: 1.1rem;
  margin: 20px 0;
`;

interface ChallengeEntryScreenProps {
  onCancel: () => void;
  onJoinChallenge: (challenge: Challenge) => void;
}

const ChallengeEntryScreen: React.FC<ChallengeEntryScreenProps> = ({
  onCancel,
  onJoinChallenge
}) => {
  const [playerName, setPlayerName] = useState(getPlayerName());
  const [challengeCode, setChallengeCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeFound, setChallengeFound] = useState<Challenge | null>(null);
  
  // Check URL for challenge code on mount
  useEffect(() => {
    const urlChallengeCode = parseUrlForChallengeCode();
    if (urlChallengeCode) {
      setChallengeCode(urlChallengeCode);
      handleCheckChallenge(urlChallengeCode);
    }
  }, []);
  
  const handleCheckChallenge = async (code: string) => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character challenge code');
      setChallengeFound(null);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const challenge = await getChallengeByCode(code.toUpperCase());
      
      if (!challenge) {
        setError('Challenge not found. Please check the code and try again.');
        setChallengeFound(null);
      } else if (challenge.status === 'full') {
        setError('This challenge is full (10/10 players). Please join another challenge or create your own.');
        setChallengeFound(null);
      } else {
        setChallengeFound(challenge);
      }
    } catch (err) {
      console.error('Error checking challenge:', err);
      setError('An error occurred when checking the challenge');
      setChallengeFound(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoin = async () => {
    if (!challengeFound) return;
    
    setLoading(true);
    
    try {
      savePlayerName(playerName);
      
      // Update player count in the challenge
      const result = await joinChallenge(challengeFound.code, playerName);
      
      if (result.error) {
        setError(result.error);
      } else if (result.challenge) {
        onJoinChallenge(result.challenge);
      } else {
        setError('Failed to join challenge. Please try again.');
      }
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError('An error occurred when joining the challenge');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <EntryContainer>
      <Title>Join Challenge</Title>
      <Subtitle>Enter a challenge code to play</Subtitle>
      
      <FormGroup>
        <Label htmlFor="challengeCode">Challenge Code</Label>
        <Input
          id="challengeCode"
          type="text"
          value={challengeCode}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setChallengeCode(value);
            if (value.length === 6) {
              handleCheckChallenge(value);
            } else {
              setChallengeFound(null);
            }
          }}
          placeholder="Enter 6-character code"
          maxLength={6}
          style={{ textTransform: 'uppercase' }}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FormGroup>
      
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
      
      {loading && <LoadingMessage>Checking challenge code...</LoadingMessage>}
      
      {challengeFound && (
        <div>
          <p>Challenge by: {challengeFound.createdByName}</p>
          <p>Players: {challengeFound.playerCount}/{challengeFound.maxPlayers}</p>
        </div>
      )}
      
      <ButtonGroup>
        <Button onClick={onCancel}>Cancel</Button>
        <Button 
          $primary 
          disabled={!challengeFound || loading} 
          onClick={handleJoin}
        >
          Join Challenge
        </Button>
      </ButtonGroup>
    </EntryContainer>
  );
};

export default ChallengeEntryScreen;