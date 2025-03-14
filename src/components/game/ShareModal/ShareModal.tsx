import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { 
  generateChallengeShareText, 
  getChallengeShareUrl, 
  shareChallenge 
} from '../../../services/challengeService';
import { generateChallengeQRCode } from '../../../utils/qrcode';
// We're not using this directly, but keeping the import for reference
// import { downloadChallengePreview } from '../../../utils/challenge';
import WordleStyleGrid from '../../WordleStyleGrid';

interface ShareModalProps {
  challenge: Challenge;
  playerScore?: number;
  onClose: () => void;
  isOpen: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  challenge, 
  playerScore, 
  onClose,
  isOpen
}) => {
  // Add debug logging for onClose function
  console.log("ShareModal received onClose function:", !!onClose);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Generate QR code when challenge changes
  useEffect(() => {
    if (challenge && isOpen) {
      generateChallengeQRCode(challenge)
        .then(url => setQrCodeUrl(url))
        .catch(error => console.error('Failed to generate QR code:', error));
    }
  }, [challenge, isOpen]);

  const handleCopyLink = () => {
    const shareUrl = getChallengeShareUrl(challenge);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      // Reset "Copied" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyText = () => {
    const shareText = generateChallengeShareText(challenge, playerScore);
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      // Reset "Copied" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareWhatsApp = () => {
    const shareUrl = getChallengeShareUrl(challenge);
    const shareText = generateChallengeShareText(challenge, playerScore);
    const encodedText = encodeURIComponent(shareText);
    
    // Open WhatsApp share URL
    window.open(`https://wa.me/?text=${encodedText}%20${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const shareUrl = getChallengeShareUrl(challenge);
    const tweetText = playerScore 
      ? `I scored ${playerScore} points in WordBloom! Can you beat my score?` 
      : `Join me for a game of WordBloom!`;
    
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareInstagram = () => {
    // Instagram doesn't have a web share API, so we'll copy the link and prompt the user
    const shareUrl = getChallengeShareUrl(challenge);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      
      if (window.addNotification) {
        window.addNotification('Link copied! Now paste it on Instagram', 'info', 3000);
      }
      
      // Reset "Copied" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadImage = async () => {
    try {
      setPreviewLoading(true);
      // Import the enhanced download function that includes QR code
      const { downloadChallengeImageWithQRCode } = await import('../../../utils/qrcode');
      await downloadChallengeImageWithQRCode(challenge, playerScore);
      
      if (window.addNotification) {
        window.addNotification('Challenge image downloaded!', 'success', 2000);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      if (window.addNotification) {
        window.addNotification('Failed to download image', 'error', 2000);
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleShareNative = () => {
    shareChallenge(challenge, playerScore);
  };

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Create a wrapped onClose function with debugging
  const handleClose = () => {
    console.log("Close button clicked, calling onClose");
    onClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>&times;</CloseButton>
        
        <Title>Share Challenge</Title>
        <CodeDisplay>Code: {challenge.code}</CodeDisplay>
        
        {/* Move QR code to the top */}
        {qrCodeUrl && (
          <QRCodeContainer>
            <QRCodeImage src={qrCodeUrl} alt="QR Code" />
            <QRCodeTitle>Scan to Play</QRCodeTitle>
          </QRCodeContainer>
        )}
        
        {/* Show challenge link */}
        <ChallengeLink>
          {getChallengeShareUrl(challenge)}
        </ChallengeLink>
        
        <PreviewSection>
          <PreviewTitle>Challenge Preview</PreviewTitle>
          <PreviewContainer ref={previewRef}>
            <ChallengeHeader>WordBloom Challenge</ChallengeHeader>
            <ChallengeCode>{challenge.code}</ChallengeCode>
            <CreatorInfo>Created by {challenge.createdByName}</CreatorInfo>
            
            {/* Wordle-Style Grid Display */}
            <WordleStyleGridContainer>
              <WordleStyleGrid letterArrangement={challenge.letterArrangement} />
            </WordleStyleGridContainer>
            <ChallengeStats>
              {challenge.playerCount}/{challenge.maxPlayers} players
            </ChallengeStats>
            {playerScore !== undefined ? (
              <>
                <ScoreInfo>{playerScore} points</ScoreInfo>
                <CallToAction>Can you beat my score?</CallToAction>
              </>
            ) : (
              <CallToAction>Join this word challenge!</CallToAction>
            )}
          </PreviewContainer>
        </PreviewSection>
        
        {/* Social sharing buttons */}
        <ShareOptions>
          <ShareTitle>Share Options</ShareTitle>
          
          <ButtonGrid>
            <ShareButton onClick={handleCopyLink}>
              <ButtonIcon>📋</ButtonIcon>
              Copy Link
            </ShareButton>
            
            <ShareButton onClick={handleCopyText}>
              <ButtonIcon>📝</ButtonIcon>
              Copy Text
            </ShareButton>
            
            <ShareButton onClick={handleShareWhatsApp}>
              <ButtonIcon>📱</ButtonIcon>
              WhatsApp
            </ShareButton>
            
            <ShareButton onClick={handleShareTwitter}>
              <ButtonIcon>🐦</ButtonIcon>
              Twitter
            </ShareButton>
            
            <ShareButton onClick={handleShareInstagram}>
              <ButtonIcon>📷</ButtonIcon>
              Instagram
            </ShareButton>
            
            <ShareButton 
              onClick={handleDownloadImage}
              disabled={previewLoading}
            >
              <ButtonIcon>🖼️</ButtonIcon>
              {previewLoading ? 'Generating...' : 'Download Image'}
            </ShareButton>
            
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <ShareButton onClick={handleShareNative} primary>
                <ButtonIcon>↗️</ButtonIcon>
                Share
              </ShareButton>
            )}
          </ButtonGrid>
          
          {copied && <CopiedMessage>Copied to clipboard!</CopiedMessage>}
        </ShareOptions>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 28px 24px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(222, 226, 230, 0.8);
  animation: modalAppear 0.3s ease-out;
  
  @keyframes modalAppear {
    from { 
      opacity: 0; 
      transform: translateY(20px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }
  
  /* Subtle gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #e77c8d, #9f7bea, #6aadcb);
    border-radius: 16px 16px 0 0;
    pointer-events: none; /* Make sure it doesn't block clicks */
    z-index: 1; /* Lower than the close button */
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  font-size: 24px;
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(222, 226, 230, 0.5);
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 2000; /* Ensure it's above other elements */
  
  &:hover {
    color: #000;
    background-color: #f0f2f5;
    transform: rotate(90deg);
  }
  
  &:active {
    background-color: #e9ecef;
    transform: rotate(90deg) scale(0.95);
  }
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  text-align: center;
  color: #007bff;
  font-size: 28px;
  font-weight: 700;
  position: relative;
  
  /* Decorative elements */
  &::before, &::after {
    content: '•';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #9f7bea;
    font-size: 24px;
  }
  
  &::before {
    left: 30%;
  }
  
  &::after {
    right: 30%;
  }
`;

const CodeDisplay = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 28px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(106, 173, 203, 0.1) 0%, rgba(159, 123, 234, 0.1) 100%);
  border-radius: 8px;
  border: 1px dashed rgba(222, 226, 230, 0.8);
  letter-spacing: 1px;
  position: relative;
  
  /* Subtle diagonal background pattern */
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.5) 10px,
    rgba(255, 255, 255, 0.5) 20px
  );
  
  /* Highlight effect on hover */
  &:hover {
    box-shadow: 0 0 10px rgba(159, 123, 234, 0.2);
  }
`;

const PreviewSection = styled.div`
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  
  /* Subtle divider lines */
  &::before, &::after {
    content: '';
    position: absolute;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(222, 226, 230, 0.5), transparent);
  }
  
  &::before {
    top: -10px;
  }
  
  &::after {
    bottom: -10px;
  }
`;

const PreviewTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  text-align: center;
  color: #495057;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Decorative elements */
  &::before, &::after {
    content: '';
    display: block;
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, #9f7bea, #6aadcb);
    margin: 0 12px;
  }
`;

const PreviewContainer = styled.div`
  width: 100%;
  padding: 24px;
  /* Enhanced gradient background */
  background: linear-gradient(135deg, #fcfcfd 0%, #f8f9fa 50%, #f0f2f5 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const ChallengeHeader = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
  position: relative;
  
  /* Decorative flourish */
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #007bff, transparent);
  }
`;

const ChallengeCode = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin: 12px 0;
  padding: 4px 12px;
  background-color: rgba(0, 123, 255, 0.1);
  border-radius: 6px;
  color: #0056b3;
  letter-spacing: 1px;
`;

const WordleStyleGridContainer = styled.div`
  margin: 20px 0;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6e6e6;
`;

const CreatorInfo = styled.div`
  font-size: 15px;
  color: #666;
  margin-bottom: 16px;
  font-style: italic;
`;

const ChallengeLink = styled.div`
  font-size: 14px;
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  word-break: break-all;
  text-align: center;
  margin: 15px 0;
  color: #555;
`;

const ChallengeStats = styled.div`
  font-size: 15px;
  color: #555;
  margin-top: 12px;
  padding: 4px 12px;
  background-color: rgba(108, 117, 125, 0.1);
  border-radius: 20px;
  display: inline-block;
`;

const ScoreInfo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #28a745;
  margin-top: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CallToAction = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #007bff;
  margin-top: 12px;
  padding: 6px 0;
  position: relative;
  
  /* Subtle underline animation */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0, 123, 255, 0.5), transparent);
    animation: shimmer 3s infinite;
    
    @keyframes shimmer {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
  }
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  padding: 15px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  width: 80%;
  max-width: 300px;
`;

const QRCodeTitle = styled.div`
  font-size: 16px;
  color: #555;
  font-weight: 500;
`;

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  border: none;
  padding: 10px;
  background-color: white;
  margin-bottom: 10px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ShareOptions = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const ShareTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #e77c8d, #9f7bea, #6aadcb);
    border-radius: 3px;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ShareButton = styled.button<{ primary?: boolean }>`
  padding: 16px 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.primary ? '#007bff' : '#dee2e6'};
  background-color: ${props => props.primary ? '#007bff' : 'white'};
  color: ${props => props.primary ? 'white' : '#212529'};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  
  &:hover:not(:disabled) {
    background-color: ${props => props.primary ? '#0069d9' : '#f8f9fa'};
    border-color: ${props => props.primary ? '#0062cc' : '#c6c8ca'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonIcon = styled.div`
  font-size: 30px;
  margin-bottom: 10px;
  transition: transform 0.3s ease;
  
  ${ShareButton}:hover & {
    transform: scale(1.1);
  }
`;

const CopiedMessage = styled.div`
  text-align: center;
  color: #28a745;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 0;
  animation: bounceIn 0.4s;
  position: relative;
  
  /* Add subtle highlight effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 100%;
    background-color: rgba(40, 167, 69, 0.1);
    border-radius: 20px;
    z-index: -1;
  }
  
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

export default ShareModal;