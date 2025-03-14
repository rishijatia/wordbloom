import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { 
  generateChallengeShareText, 
  getChallengeShareUrl
} from '../../../services/challengeService';
import { generateChallengeQRCode } from '../../../utils/qrcode';
import WordleStyleGrid from '../../WordleStyleGrid';

interface ChallengeShareScreenProps {
  challenge: Challenge;
  playerScore?: number;
  onBack: () => void;
}

const ChallengeShareScreen: React.FC<ChallengeShareScreenProps> = ({ 
  challenge, 
  playerScore, 
  onBack
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>('');
  
  // Generate QR code when challenge changes
  useEffect(() => {
    if (challenge) {
      generateChallengeQRCode(challenge)
        .then(url => setQrCodeUrl(url))
        .catch(error => console.error('Failed to generate QR code:', error));
      
      setShareLink(getChallengeShareUrl(challenge));
    }
  }, [challenge]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      // Reset "Copied" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      if (window.addNotification) {
        window.addNotification('Challenge link copied!', 'success', 2000);
      }
    });
  };

  const handleShareNative = () => {
    const shareText = generateChallengeShareText(challenge, playerScore);
    
    if (navigator.share) {
      navigator.share({
        title: 'WordBloom Challenge',
        text: shareText,
        url: shareLink
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback to copy if share API not available
      handleCopyLink();
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          <span>×</span>
        </BackButton>
        <Title>Share Challenge</Title>
      </Header>
      
      <Content>
        <CodeDisplay>Code: {challenge.code}</CodeDisplay>

        {/* QR Code Section */}
        {qrCodeUrl && (
          <QRCodeContainer>
            <QRCodeImage src={qrCodeUrl} alt="QR Code" />
            <QRCodeCaption>Scan to Play</QRCodeCaption>
          </QRCodeContainer>
        )}
        
        {/* Link Section */}
        <LinkContainer>
          <LinkText>{shareLink}</LinkText>
          <CopyButton onClick={handleCopyLink}>
            <CopyIcon>📋</CopyIcon>
          </CopyButton>
        </LinkContainer>
        
        {/* Challenge Preview Section */}
        <PreviewSection>
          <DividerLine>
            <DividerText>Challenge Preview</DividerText>
          </DividerLine>
          
          <PreviewCard>
            <ChallengeTitle>WordBloom Challenge</ChallengeTitle>
            <ChallengeCode>{challenge.code}</ChallengeCode>
            <CreatorInfo>Created by {challenge.createdByName}</CreatorInfo>
            
            {/* Wordle-Style Grid Display */}
            <GridContainer>
              <WordleStyleGrid letterArrangement={challenge.letterArrangement} />
            </GridContainer>
            
            <PlayerCount>{challenge.playerCount}/{challenge.maxPlayers} players</PlayerCount>
            
            {playerScore !== undefined && (
              <ScoreDisplay>{playerScore} points</ScoreDisplay>
            )}
            
            <ChallengePrompt>Can you beat my score?</ChallengePrompt>
          </PreviewCard>
        </PreviewSection>
        
        {/* Share Options - Limited to just the Native Share button */}
        <ShareOptions>
          <DividerLine>
            <DividerText>Share Options</DividerText>
          </DividerLine>
          
          <ShareButtonContainer>
            <ShareButton onClick={handleShareNative}>
              <ShareIcon>📱</ShareIcon>
              <ShareText>Share</ShareText>
            </ShareButton>
          </ShareButtonContainer>
        </ShareOptions>
      </Content>
      
      {copied && <CopiedIndicator>Copied to clipboard!</CopiedIndicator>}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #007bff;
  margin: 0;
  text-align: center;
`;

const BackButton = styled.button`
  position: absolute;
  left: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  
  span {
    font-size: 28px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const CodeDisplay = styled.div`
  font-size: 18px;
  font-weight: bold;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
`;

const QRCodeImage = styled.img`
  width: 220px;
  height: 220px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const QRCodeCaption = styled.div`
  margin-top: 10px;
  font-size: 16px;
  color: #555;
`;

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 16px;
  width: 100%;
  max-width: 500px;
`;

const LinkText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: 8px;
`;

const CopyIcon = styled.div`
  font-size: 20px;
`;

const DividerLine = styled.div`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  line-height: 0.1em;
  margin: 20px 0;
`;

const DividerText = styled.span`
  background: white;
  padding: 0 10px;
  font-size: 16px;
  color: #777;
`;

const PreviewSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PreviewCard = styled.div`
  width: 100%;
  max-width: 380px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChallengeTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
`;

const ChallengeCode = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin: 5px 0;
`;

const CreatorInfo = styled.div`
  font-size: 14px;
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
`;

const GridContainer = styled.div`
  margin: 10px 0;
`;

const PlayerCount = styled.div`
  font-size: 14px;
  color: #555;
  margin: 10px 0;
  padding: 4px 12px;
  background-color: #f8f9fa;
  border-radius: 20px;
`;

const ScoreDisplay = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #28a745;
  margin: 5px 0;
`;

const ChallengePrompt = styled.div`
  font-size: 16px;
  color: #007bff;
  margin-top: 5px;
`;

const ShareOptions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ShareButtonContainer = styled.div`
  margin: 10px 0 20px 0;
`;

const ShareButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 40px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ShareIcon = styled.div`
  font-size: 30px;
  margin-bottom: 8px;
`;

const ShareText = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const CopiedIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(40, 167, 69, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

export default ChallengeShareScreen;