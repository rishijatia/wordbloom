import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IoArrowBack } from 'react-icons/io5';
import { 
  getPlayerName, 
  savePlayerName, 
  getChallengeByCode,
  joinChallenge,
  parseUrlForChallengeCode
} from '../../../services/challengeService';
import { Challenge } from '../../../models/Challenge';
import WordleStyleGrid from '../../WordleStyleGrid';

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
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 15px;
  left: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
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

const PlayButton = styled(Button)`
  padding: 16px 32px;
  font-size: 1.4rem;
  margin-top: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const InstructionsSection = styled.div`
  width: 100%;
  text-align: center;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const RulesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const RulesTitle = styled.h2`
  font-size: 1.4rem;
  color: #333;
  margin: 0;
`;

const RulesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const Rule = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
  font-size: 1.1rem;

  &::before {
    content: "•";
    color: #5ac476;
  }
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
`;

const ControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const ColumnTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const ControlsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const Control = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;

  &::before {
    content: "•";
    color: #5ac476;
  }
`;

const ChallengeInfo = styled.div`
  text-align: center;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid #d1e3ff;
  
  p {
    margin: 5px 0;
    font-size: 1.1rem;
    &:first-child {
      font-weight: bold;
      color: #4f46e5;
    }
  }
`;

const WordleStyleGridContainer = styled.div`
  margin: 20px 0;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e6e6;
`;

const GameRulesSection = styled.div`
  width: 100%;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const RulesHeader = styled.h3`
  font-size: 1.4rem;
  color: #333;
  margin: 0 0 15px 0;
  text-align: center;
`;

// Style definitions for rule items in the game rules section 
const RuleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const RuleIcon = styled.div`
  font-size: 1.5rem;
`;

// Define RuleText for consistency with existing component names
const RuleText = styled.div`
  font-size: 1.1rem;
  color: #495057;
`;

interface ChallengeEntryScreenProps {
  challenge?: Challenge; // Now optional, as it can be provided or searched
  onCancel: () => void;
  onJoinChallenge: (challenge: Challenge) => void;
}

const ChallengeEntryScreen: React.FC<ChallengeEntryScreenProps> = ({
  challenge,
  onCancel,
  onJoinChallenge
}) => {
  const [playerName, setPlayerName] = useState(getPlayerName());
  const [challengeCode, setChallengeCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeFound, setChallengeFound] = useState<Challenge | null>(null);
  const [isShareableLink, setIsShareableLink] = useState(false);
  
  // Check URL for challenge code on mount
  useEffect(() => {
    const urlChallengeCode = parseUrlForChallengeCode();
    if (urlChallengeCode) {
      setChallengeCode(urlChallengeCode);
      handleCheckChallenge(urlChallengeCode);
      setIsShareableLink(true);
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
    // Get the challenge to join - either from the found challenge or direct prop
    const challengeToJoin = challenge || challengeFound;
    
    if (!challengeToJoin) {
      console.error('No challenge available to join');
      setError('No challenge found to join');
      return;
    }
    
    setLoading(true);
    
    try {
      // Always save the player name for future use
      savePlayerName(playerName);
      
      // Special handling for direct challenge mode (from shareable link)
      if (challenge) {
        console.log("Handling direct challenge from props:", challenge.code);
        
        // Start immediate join for better user experience
        onJoinChallenge(challenge);
        
        // Still update the player count in the background
        joinChallenge(challenge.code, playerName)
          .then(result => {
            if (result.error) {
              console.error("Background join error:", result.error);
            }
          })
          .catch(err => {
            console.error("Background join error:", err);
          });
        
        return; // Exit early, we've already started the game
      }
      
      // Normal flow for challenge code entry
      console.log("Joining challenge via API:", challengeToJoin.code);
      const result = await joinChallenge(challengeToJoin.code, playerName);
      
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
  
  // Simplified view when accessed from a shareable link
  if ((isShareableLink && challengeFound) || challenge) {
    const displayChallenge = challenge || challengeFound;
    
    if (!displayChallenge) return null; // Safeguard against undefined challenge
    
    // Debug info to help diagnose the issue
    console.log("Displaying challenge:", {
      hasDirectChallenge: !!challenge,
      hasFoundChallenge: !!challengeFound,
      displayChallengeCode: displayChallenge.code
    });
    
    return (
      <EntryContainer>
        <BackButton onClick={onCancel}>
          <IoArrowBack />
        </BackButton>
        
        <Title>WordBloom Challenge</Title>
        <Subtitle>You've been invited to play!</Subtitle>
        
        {/* Add Wordle-style grid visualization */}
        <WordleStyleGridContainer>
          <WordleStyleGrid letterArrangement={displayChallenge.letterArrangement} />
        </WordleStyleGridContainer>
        
        <ChallengeInfo>
          <p>Challenge by: {displayChallenge.createdByName}</p>
          <p>Players: {displayChallenge.playerCount}/{displayChallenge.maxPlayers}</p>
          <p>Code: {displayChallenge.code}</p>
        </ChallengeInfo>
        
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
        
        <GameRulesSection>
          <RulesHeader>How to Play WordBloom</RulesHeader>
          <RulesContainer>
            <RuleItem>
              <RuleIcon>🌸</RuleIcon>
              <RuleText>Form words using connected letters</RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>⭐</RuleIcon>
              <RuleText>Center letter must be used in every word</RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>📏</RuleIcon>
              <RuleText>Words must be 3-9 letters long</RuleText>
            </RuleItem>
            <RuleItem>
              <RuleIcon>⏱️</RuleIcon>
              <RuleText>You have 2 minutes to find as many words as possible</RuleText>
            </RuleItem>
          </RulesContainer>
        </GameRulesSection>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {loading && <LoadingMessage>Joining challenge...</LoadingMessage>}
        
        <PlayButton 
          $primary 
          disabled={loading} 
          onClick={(e) => {
            console.log("Play button clicked", e);
            handleJoin();
          }}
        >
          Play Challenge Now
        </PlayButton>
        
        <Button onClick={onCancel}>Not Now</Button>
      </EntryContainer>
    );
  }
  
  // Standard view for manual code entry
  return (
    <EntryContainer>
      <BackButton onClick={onCancel}>
        ← Back
      </BackButton>
      
      <Title>Join Challenge</Title>
      <Subtitle>Enter a challenge code to play</Subtitle>
      
      <InstructionsSection>
        <RulesContainer>
          <RulesTitle>Game Rules</RulesTitle>
          <RulesList>
            <Rule>Must use center letter</Rule>
            <Rule>Words must be 3-9 letters</Rule>
            <Rule>Use only connected letters</Rule>
          </RulesList>
        </RulesContainer>

        <ControlsGrid>
          <ControlsColumn>
            <ColumnTitle>PC Controls</ColumnTitle>
            <ControlsList>
              <Control>Type letters to select</Control>
              <Control>Enter to submit</Control>
              <Control>Backspace to clear</Control>
            </ControlsList>
          </ControlsColumn>

          <ControlsColumn>
            <ColumnTitle>Mobile Controls</ColumnTitle>
            <ControlsList>
              <Control>Drag to select letters</Control>
              <Control>Release to submit</Control>
            </ControlsList>
          </ControlsColumn>
        </ControlsGrid>
      </InstructionsSection>
      
      {loading && <LoadingMessage>Checking challenge code...</LoadingMessage>}
      
      {challengeFound && (
        <div>
          <p>Challenge by: {challengeFound.createdByName}</p>
          <p>Players: {challengeFound.playerCount}/{challengeFound.maxPlayers}</p>
        </div>
      )}
      
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