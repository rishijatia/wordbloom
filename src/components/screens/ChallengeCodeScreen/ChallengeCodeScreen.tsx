import React from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { shareChallenge, generateChallengeShareText } from '../../../services/challengeService';

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

const CodeDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
`;

const CodeBox = styled.div`
  padding: 20px 40px;
  background-color: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 12px;
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 5px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ShareInstructions = styled.p`
  font-size: 1.1rem;
  color: #555;
  text-align: center;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
`;

const Button = styled.button<{ $primary?: boolean; $secondary?: boolean }>`
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: ${props => {
    if (props.$primary) return '#5ac476';
    if (props.$secondary) return '#4a90e2';
    return '#f0f0f0';
  }};
  color: ${props => (props.$primary || props.$secondary) ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover {
    background-color: ${props => {
      if (props.$primary) return '#4aa366';
      if (props.$secondary) return '#3a80d2';
      return '#e0e0e0';
    }};
  }
`;

const ParticipantsInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const ParticipantsCount = styled.div`
  font-size: 1.1rem;
  color: #555;
`;

interface ChallengeCodeScreenProps {
  challenge: Challenge;
  score?: number;
  onBack: () => void;
  onPlayChallenge: () => void;
  onDone: () => void;
}

const ChallengeCodeScreen: React.FC<ChallengeCodeScreenProps> = ({
  challenge,
  score,
  onBack,
  onPlayChallenge,
  onDone
}) => {
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(challenge.code);
      if (window.addNotification) {
        window.addNotification('Challenge code copied to clipboard!', 'success', 2000);
      }
    } catch (err) {
      console.error('Failed to copy code:', err);
      if (window.addNotification) {
        window.addNotification('Failed to copy code to clipboard', 'error', 2000);
      }
    }
  };
  
  const handleShare = async () => {
    try {
      await shareChallenge(challenge, score);
      if (window.addNotification) {
        window.addNotification('Challenge shared!', 'success', 2000);
      }
    } catch (err) {
      console.error('Failed to share challenge:', err);
      if (window.addNotification) {
        window.addNotification('Failed to share challenge', 'error', 2000);
      }
      
      // Fallback - copy to clipboard
      const shareText = generateChallengeShareText(challenge, score);
      await navigator.clipboard.writeText(shareText);
      if (window.addNotification) {
        window.addNotification('Challenge link copied to clipboard!', 'success', 2000);
      }
    }
  };
  
  return (
    <ChallengeContainer>
      <Title>Challenge Created!</Title>
      <Subtitle>Share the code with friends</Subtitle>
      
      <CodeDisplay>
        <CodeBox onClick={handleCopyCode}>{challenge.code}</CodeBox>
        <ShareInstructions>
          Click the code to copy it, or use the share button below
        </ShareInstructions>
      </CodeDisplay>
      
      {challenge.playerCount > 0 && (
        <ParticipantsInfo>
          <ParticipantsCount>
            {challenge.playerCount} / {challenge.maxPlayers} players joined
          </ParticipantsCount>
        </ParticipantsInfo>
      )}
      
      <ButtonGroup>
        <Button $secondary onClick={handleShare}>
          <span>Share Challenge</span>
        </Button>
        <Button $primary onClick={onPlayChallenge}>
          <span>Play this Challenge</span>
        </Button>
        <Button onClick={onDone}>
          <span>Done</span>
        </Button>
      </ButtonGroup>
    </ChallengeContainer>
  );
};

export default ChallengeCodeScreen;