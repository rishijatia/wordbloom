import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { 
  generateChallengeShareText, 
  getChallengeShareUrl, 
  shareChallenge 
} from '../../../services/challengeService';
import { generateChallengeQRCode } from '../../../utils/qrcode';
import { downloadChallengePreview } from '../../../utils/challenge';

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

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <Title>Share Challenge</Title>
        <CodeDisplay>Code: {challenge.code}</CodeDisplay>
        
        <PreviewSection>
          <PreviewTitle>Challenge Preview</PreviewTitle>
          <PreviewContainer ref={previewRef}>
            <ChallengeHeader>WordBloom Challenge</ChallengeHeader>
            <ChallengeCode>{challenge.code}</ChallengeCode>
            <CreatorInfo>Created by {challenge.createdByName}</CreatorInfo>
            <FlowerPreview>
              <CenterHex>{challenge.letterArrangement.center}</CenterHex>
              <InnerRing>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Hex key={index}>{index % 2 === 0 ? '#' : ''}</Hex>
                ))}
              </InnerRing>
              <OuterRing>
                {[0, 1, 2, 3].map((index) => (
                  <OuterHex key={index} />
                ))}
              </OuterRing>
              <ConnectingLines />
            </FlowerPreview>
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
          
          {qrCodeUrl && (
            <QRCodeContainer>
              <QRCodeTitle>Scan to Play</QRCodeTitle>
              <QRCodeImage src={qrCodeUrl} alt="QR Code" />
            </QRCodeContainer>
          )}
        </PreviewSection>
        
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
  
  &:hover {
    color: #000;
    background-color: #f0f2f5;
    transform: rotate(90deg);
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

const FlowerPreview = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
  margin: 20px 0;
  /* Add subtle hexagonal background pattern */
  background-image: radial-gradient(
    circle at center,
    rgba(231, 124, 141, 0.05) 0%,
    rgba(159, 123, 234, 0.03) 50%,
    rgba(106, 173, 203, 0.02) 100%
  );
  border-radius: 50%;
`;

const CenterHex = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 74px;
  /* Enhanced gradient background */
  background: linear-gradient(135deg, #ff8a9e 0%, #e77c8d 50%, #db6981 100%);
  border: 3px solid #e05971;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 28px;
  z-index: 3;
  /* Improved shadow for 3D effect */
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.15),
    0 0 15px rgba(231, 124, 141, 0.4);
  /* Add subtle pulsing animation */
  animation: pulse 3s infinite ease-in-out;
  
  @keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.05); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
`;

const InnerRing = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const OuterRing = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Hex = styled.div`
  position: absolute;
  width: 44px;
  height: 50px;
  /* Enhanced gradient background */
  background: linear-gradient(135deg, #b292f7 0%, #9f7bea 50%, #8d6adb 100%);
  border: 2px solid #8652e5;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  /* Improved shadow for subtle 3D effect */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  /* Add subtle floating animation with different delays */
  animation: float 5s infinite ease-in-out;
  
  &:nth-child(1) { 
    top: 20%; left: 50%; transform: translate(-50%, 0); 
    animation-delay: 0.0s;
  }
  &:nth-child(2) { 
    top: 35%; left: 76%; transform: translate(-50%, 0); 
    animation-delay: 0.8s;
  }
  &:nth-child(3) { 
    top: 65%; left: 76%; transform: translate(-50%, 0); 
    animation-delay: 1.6s;
  }
  &:nth-child(4) { 
    top: 80%; left: 50%; transform: translate(-50%, 0); 
    animation-delay: 2.4s;
  }
  &:nth-child(5) { 
    top: 65%; left: 24%; transform: translate(-50%, 0); 
    animation-delay: 3.2s;
  }
  &:nth-child(6) { 
    top: 35%; left: 24%; transform: translate(-50%, 0); 
    animation-delay: 4.0s;
  }
  
  @keyframes float {
    0% { transform: translate(-50%, 0) translateY(0px); }
    50% { transform: translate(-50%, 0) translateY(-3px); }
    100% { transform: translate(-50%, 0) translateY(0px); }
  }
`;

const OuterHex = styled.div`
  position: absolute;
  width: 34px;
  height: 40px;
  background-color: transparent;
  /* Improved outline style */
  border: 2px solid rgba(106, 173, 203, 0.7);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  opacity: 0.6;
  /* Add subtle fade in/out animation */
  animation: fade 8s infinite ease-in-out;
  
  &:nth-child(1) { 
    top: 10%; left: 50%; transform: translate(-50%, 0); 
    animation-delay: 0.5s;
  }
  &:nth-child(2) { 
    top: 31%; left: 83%; transform: translate(-50%, 0); 
    animation-delay: 2.5s;
  }
  &:nth-child(3) { 
    top: 69%; left: 17%; transform: translate(-50%, 0); 
    animation-delay: 4.5s;
  }
  &:nth-child(4) { 
    top: 90%; left: 50%; transform: translate(-50%, 0); 
    animation-delay: 6.5s;
  }
  
  @keyframes fade {
    0% { opacity: 0.3; }
    50% { opacity: 0.6; }
    100% { opacity: 0.3; }
  }
`;

const ConnectingLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${() => {
      // Create a data URL for the connecting lines
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create gradient for lines
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(231, 124, 141, 0.15)');
        gradient.addColorStop(0.5, 'rgba(159, 123, 234, 0.15)');
        gradient.addColorStop(1, 'rgba(106, 173, 203, 0.15)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        
        // Draw lines from center to edges
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 6 lines radiating from center
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 / 6) * i;
          const endX = centerX + Math.cos(angle) * 100;
          const endY = centerY + Math.sin(angle) * 100;
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        
        // Add some connecting arcs between points
        ctx.strokeStyle = 'rgba(159, 123, 234, 0.08)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 6; i++) {
          const angle1 = (Math.PI * 2 / 6) * i;
          const angle2 = (Math.PI * 2 / 6) * ((i + 1) % 6);
          
          const x1 = centerX + Math.cos(angle1) * 80;
          const y1 = centerY + Math.sin(angle1) * 80;
          
          const x2 = centerX + Math.cos(angle2) * 80;
          const y2 = centerY + Math.sin(angle2) * 80;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(centerX, centerY, x2, y2);
          ctx.stroke();
        }
      }
      
      return `url(${canvas.toDataURL()})`;
    }};
    background-repeat: no-repeat;
    background-position: center;
  }
`;

const CreatorInfo = styled.div`
  font-size: 15px;
  color: #666;
  margin-bottom: 16px;
  font-style: italic;
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
  margin: 8px 0 20px;
`;

const QRCodeTitle = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
  color: #555;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &::before, &::after {
    content: '〉';
    margin: 0 8px;
    color: #6aadcb;
    font-size: 14px;
  }
  
  &::after {
    content: '〈';
  }
`;

const QRCodeImage = styled.img`
  width: 160px;
  height: 160px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  background-color: white;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
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