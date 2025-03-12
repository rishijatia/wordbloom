import React from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { shareChallenge, generateChallengeShareText, getChallengeShareUrl } from '../../../services/challengeService';

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
  width: 100%;
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

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  width: 100%;
  max-width: 500px;
`;

const ChallengeLink = styled.div`
  font-size: 1rem;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  white-space: nowrap;
  
  &:hover {
    background-color: #e0e0e0;
  }
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

const SocialShareContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 15px;
  width: 100%;
`;

const SocialButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const FacebookButton = styled(SocialButton)`
  background-color: #3b5998;
  color: white;
`;

const TwitterButton = styled(SocialButton)`
  background-color: #1da1f2;
  color: white;
`;

const WhatsAppButton = styled(SocialButton)`
  background-color: #25d366;
  color: white;
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
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (window.addNotification) {
        window.addNotification('Challenge link copied to clipboard!', 'success', 2000);
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
      if (window.addNotification) {
        window.addNotification('Failed to copy link to clipboard', 'error', 2000);
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
  
  const shareUrl = getChallengeShareUrl(challenge);
  const shareText = encodeURIComponent(generateChallengeShareText(challenge, score));
  
  // Social media share URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`;

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  return (
    <ChallengeContainer>
      <Title>Challenge Created!</Title>
      <Subtitle>Share the code with friends</Subtitle>
      
      <CodeDisplay>
        <CodeBox onClick={handleCopyCode}>{challenge.code}</CodeBox>
        <ShareInstructions>
          Click the code to copy it, or copy the link below
        </ShareInstructions>
        <LinkContainer>
          <ChallengeLink onClick={handleCopyLink}>{shareUrl}</ChallengeLink>
          <CopyButton onClick={handleCopyLink}>Copy</CopyButton>
        </LinkContainer>
      </CodeDisplay>
      
      <ParticipantsInfo>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          color: '#4a90e2', 
          fontSize: '1.3rem',
          fontWeight: 'bold'
        }}>
          Challenge your Friends
        </h3>
        <ParticipantsCount>
          {challenge.playerCount} / {challenge.maxPlayers} players joined
        </ParticipantsCount>
      </ParticipantsInfo>
      
      <ButtonGroup>
        <Button $secondary onClick={handleShare}>
          <span>Share Challenge</span>
        </Button>
        
        <SocialShareContainer>
          <FacebookButton 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleSocialShare(facebookShareUrl); }}
            aria-label="Share on Facebook"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
            </svg>
          </FacebookButton>
          
          <TwitterButton 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleSocialShare(twitterShareUrl); }}
            aria-label="Share on Twitter"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
            </svg>
          </TwitterButton>
          
          <WhatsAppButton 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleSocialShare(whatsappShareUrl); }}
            aria-label="Share on WhatsApp"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </WhatsAppButton>
        </SocialShareContainer>
        
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