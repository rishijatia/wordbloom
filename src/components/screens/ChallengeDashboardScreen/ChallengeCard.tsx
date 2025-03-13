import React from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { isChallengeExpired } from '../../../services/challengeService';

const TagContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1;
`;

const Tag = styled.div<{$type: 'popular' | 'expiring'}>`
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: ${props => props.$type === 'popular' ? '#4f46e5' : '#ef4444'};
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 12px;
  white-space: nowrap;
  
  @media (min-width: 768px) {
    font-size: 14px;
    padding: 4px 10px;
  }
`;

const Card = styled.div<{$popular?: boolean; $expiringSoon?: boolean}>`
  display: flex;
  flex-direction: column;
  background-color: ${props => {
    if (props.$popular && props.$expiringSoon) return '#fff5f5';
    if (props.$popular) return '#f9f7ff';
    if (props.$expiringSoon) return '#fff8f0';
    return 'white';
  }};
  border-radius: 12px;
  box-shadow: ${props => {
    if (props.$popular && props.$expiringSoon) return '0 4px 20px rgba(239, 68, 68, 0.15), 0 4px 20px rgba(79, 70, 229, 0.15)';
    if (props.$popular) return '0 4px 20px rgba(79, 70, 229, 0.2)';
    if (props.$expiringSoon) return '0 4px 20px rgba(239, 68, 68, 0.15)';
    return '0 4px 6px rgba(0, 0, 0, 0.1)';
  }};
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%; /* Ensure card doesn't overflow container */

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => {
      if (props.$popular && props.$expiringSoon) return '0 10px 25px rgba(239, 68, 68, 0.2), 0 10px 25px rgba(79, 70, 229, 0.2)';
      if (props.$popular) return '0 10px 25px rgba(79, 70, 229, 0.3)';
      if (props.$expiringSoon) return '0 10px 25px rgba(239, 68, 68, 0.2)';
      return '0 10px 15px rgba(0, 0, 0, 0.1)';
    }};
  }
`;

const CardHeader = styled.div`
  padding: 16px;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const CreatorName = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: #4f46e5;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: "👤";
    font-size: 16px;
  }
  
  @media (min-width: 768px) {
    font-size: 20px;
    
    &::before {
      font-size: 18px;
    }
  }
`;

const ChallengeCode = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 1px;
  margin-top: 4px;
`;

const CardBody = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @media (min-width: 768px) {
    padding: 20px;
    gap: 16px;
  }
`;

const CreationDate = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const PlayerCount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExpiryTimer = styled.div<{$isExpiring?: boolean}>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$isExpiring ? '#ef4444' : '#6b7280'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardFooter = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  
  @media (min-width: 768px) {
    padding: 20px;
    gap: 12px;
  }
`;

const Button = styled.button<{$primary?: boolean}>`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.$primary ? '#4f46e5' : '#f3f4f6'};
  color: ${props => props.$primary ? 'white' : '#4b5563'};
  border: ${props => props.$primary ? 'none' : '1px solid #d1d5db'};
  
  &:hover {
    background-color: ${props => props.$primary ? '#4338ca' : '#e5e7eb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (min-width: 768px) {
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
  }
`;

interface ChallengeCardProps {
  challenge: Challenge;
  onViewDetails: () => void;
  onPlay: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onViewDetails, onPlay }) => {
  const isExpired = isChallengeExpired(challenge);
  
  // Calculate time remaining until expiration
  const getTimeRemaining = () => {
    const now = Date.now();
    const timeRemaining = challenge.expiresAt - now;
    
    if (timeRemaining <= 0) {
      return 'Expired';
    }
    
    // Convert to hours and minutes
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m remaining`;
    } else {
      return `${minutesRemaining}m remaining`;
    }
  };
  
  // Format the creation date
  const formattedDate = new Date(challenge.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determine if the challenge is expiring soon (less than 3 hours)
  const isExpiringSoon = !isExpired && (challenge.expiresAt - Date.now()) < (3 * 60 * 60 * 1000);

  // Ensure we have a valid creator name (fallback to "Anonymous" if missing)
  const creatorName = challenge.createdByName || "Anonymous";
  
  // Determine if this is a popular challenge (3 or more players)
  const isPopular = challenge.playerCount >= 3;

  return (
    <Card $popular={isPopular} $expiringSoon={isExpiringSoon}>
      {(isPopular || isExpiringSoon) && (
        <TagContainer>
          {isPopular && (
            <Tag $type="popular">🔥 Popular</Tag>
          )}
          {isExpiringSoon && (
            <Tag $type="expiring">⏰ Ending Soon</Tag>
          )}
        </TagContainer>
      )}
      
      <CardHeader>
        <CreatorName>{creatorName}</CreatorName>
        <ChallengeCode>CODE: {challenge.code}</ChallengeCode>
      </CardHeader>
      
      <CardBody>
        <CreationDate>
          Created on {formattedDate}
        </CreationDate>
        
        <PlayerCount>
          <span role="img" aria-label="players">👥</span>
          {challenge.playerCount} / {challenge.maxPlayers} players
        </PlayerCount>
        
        <ExpiryTimer $isExpiring={isExpiringSoon}>
          <span role="img" aria-label="time">⏱️</span>
          {getTimeRemaining()}
        </ExpiryTimer>
      </CardBody>
      
      <CardFooter>
        <Button 
          onClick={onPlay} 
          $primary 
          disabled={isExpired}
        >
          {isExpired ? 'Expired' : 'Play'}
        </Button>
        <Button onClick={onViewDetails}>Details</Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;