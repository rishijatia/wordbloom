// REVISED IMPLEMENTATION PLAN FOR SHARE CHALLENGE SCREEN

// ================= SHARE CHALLENGE SCREEN =================

/**
 * Based on the screenshot and requirements:
 * 1. Full page (not modal)
 * 2. Simple header "Share Challenge"
 * 3. QR code prominently displayed
 * 4. Link with copy icon below
 * 5. Native Share button for mobile
 * 6. No other buttons - keep it simple
 */

// First, let's create a new ChallengeShareScreen component:

// src/components/screens/ChallengeShareScreen/ChallengeShareScreen.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { 
  generateChallengeShareText, 
  getChallengeShareUrl, 
  generateChallengeQRCode 
} from '../../../services/challengeService';
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

// ================= INTEGRATION PLAN =================

/**
 * Now we need to integrate this full-page share screen into the app.
 * This includes:
 * 1. Modifying App.tsx to include the new screen
 * 2. Adding a route/navigation to show this screen
 * 3. Replacing the ShareModal usage with ChallengeShareScreen
 */

// App.tsx changes:
// Add a new screen type:
type AppScreen = 'game' | 'dashboard' | 'detail' | 'loading' | 'error' | 'share';

// Add state to track the score for sharing:
const [sharedScore, setSharedScore] = useState<number | undefined>(undefined);

// Add a new handler for navigating to share screen:
const handleNavigateToShare = (challenge: Challenge, score?: number) => {
  setSelectedChallenge(challenge);
  setSharedScore(score);
  setCurrentScreen('share');
};

// Add rendering for the share screen:
if (currentScreen === 'share' && selectedChallenge) {
  return (
    <ChallengeShareScreen
      challenge={selectedChallenge}
      playerScore={sharedScore}
      onBack={() => {
        // Navigate back based on context
        if (state.gameStatus === 'gameOver') {
          setCurrentScreen('game');
        } else {
          setCurrentScreen('detail');
        }
      }}
    />
  );
}

// ================= REPLACE MODAL USAGE =================

/**
 * Now we need to replace the usage of ShareModal with navigation to our new screen
 */

// In GameOverScreen.tsx, update the handleShareChallenge function:
const handleShareChallenge = () => {
  if (activeChallenge && onViewChallengeDetails) {
    // This assumes we'll pass the onNavigateToShare function via props
    onNavigateToShare(activeChallenge, score);
  }
};

// Remove the ShareModal from GameOverScreen:
{/* Remove this
  {activeChallenge && (
    <ShareModal
      challenge={activeChallenge}
      playerScore={score}
      isOpen={isShareModalOpen}
      onClose={() => setIsShareModalOpen(false)}
    />
  )}
*/}

// Update the GameOverScreen props interface:
interface GameOverScreenProps {
  onViewChallenges?: () => void;
  onViewChallengeDetails?: (challenge: Challenge) => void;
  onNavigateToShare?: (challenge: Challenge, score: number) => void;
}

// Pass the handler from GameContent to GameOverScreen:
<GameOverScreen 
  onViewChallenges={handleNavigateToDashboard}
  onViewChallengeDetails={handleNavigateToDetail}
  onNavigateToShare={handleNavigateToShare}
/>

// Similarly in ChallengeDetailScreen.tsx, update the handleShareChallenge function:
const handleShareChallenge = () => {
  if (challenge) {
    // This assumes we'll pass the onNavigateToShare function via props
    onNavigateToShare(challenge, playerScore);
  }
};

// Update the ChallengeDetailScreen props interface:
interface ChallengeDetailScreenProps {
  challengeId: string;
  onBack: () => void;
  onPlay: (challenge: Challenge) => void;
  onNavigateToShare: (challenge: Challenge, score?: number) => void;
}

// Pass the handler from GameContent to ChallengeDetailScreen:
<ChallengeDetailScreen
  challengeId={selectedChallenge.id}
  onBack={handleBackNavigation}
  onPlay={(challenge) => handlePlayChallenge(challenge || selectedChallenge)}
  onNavigateToShare={handleNavigateToShare}
/>