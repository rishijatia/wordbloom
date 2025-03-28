import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';
import Flower from '../../game/Flower/Flower';
import { useGameState } from '../../../hooks/useGameState';
import { Score } from '../../game/Score/Score';

// Main container with gradient background
const GameContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.backgroundGradient};
  overflow: hidden;

  /* Add subtle pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657l1.415 1.414L13.857 0H11.03zm32.284 0L39.9 3.414 42.28 0h1.032zm-9.9 0L35.6 1.414 40.57 0h-7.14zM16.686 0L10.743 5.943 13.57 0h3.116zM36.157 0L32 4.157 36.157 0z' fill='%2390a29c' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.sm};
  }
`;

// Glass effect header
const GameHeader = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  z-index: 10;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.medium};
  margin: 0 auto;
  margin-bottom: ${props => props.theme.spacing.md};

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.sm};
    gap: ${props => props.theme.spacing.xs};
  }
`;

// Main content area with improved responsive layout
const GameContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  height: auto;
  min-height: calc(100vh - 200px);
  position: relative;
  z-index: 5;
  margin: 0 auto;
  padding: 0;
  gap: ${props => props.theme.spacing.lg};
  overflow: visible;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    overflow: visible;
  }
  
  @media (max-width: 768px) {
    gap: ${props => props.theme.spacing.sm};
    min-height: auto;
  }
`;

// Enhanced flower section
const FlowerSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: auto;
  min-height: 550px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow: visible;
  transform-origin: center center;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${props => props.theme.shadows.medium};
  padding: ${props => props.theme.spacing.md};

  @media (max-width: 1024px) {
    flex: 2;
    min-height: 450px;
    transform: none;
  }

  @media (max-width: 768px) {
    min-height: 350px;
    margin-bottom: 0;
    padding: ${props => props.theme.spacing.sm};
  }
`;

// Sidebar for the found words and stats (desktop only)
const SidebarSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.panel};
  border-radius: ${props => props.theme.borderRadius.medium};
  box-shadow: ${props => props.theme.shadows.medium};
  overflow-y: auto;
  height: 100%;
  max-height: 650px;
  min-width: 280px;

  @media (max-width: 1024px) {
    flex: 1;
    margin-left: 0;
    padding: ${props => props.theme.spacing.md};
    max-height: 250px;
    width: 100%;
    max-width: 600px;
  }

  @media (max-width: 768px) {
    display: none; // Hide on mobile, will show in mobile-specific component
  }
`;

// Mobile-specific found words section that appears at the bottom
const MobileFoundWords = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: ${props => props.theme.spacing.md};
    background: ${props => props.theme.colors.panel};
    border-radius: ${props => props.theme.borderRadius.medium};
    margin-top: ${props => props.theme.spacing.sm};
    box-shadow: ${props => props.theme.shadows.medium};
    max-height: 180px;
    overflow-y: auto;
  }
`;

// Enhanced word display
const CurrentWordDisplay = styled.div`
  font-size: ${props => props.theme.fontSizes.xxxlarge};
  font-weight: bold;
  min-height: 2.75rem;
  min-width: 150px;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.medium};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  text-align: center;
  margin-top: ${props => props.theme.spacing.sm};

  /* Add glow when word is being formed */
  ${props => {
    if (props.children && props.children !== '···') {
      return `
        box-shadow: ${props.theme.shadows.glow};
        animation: glowPulse 2s infinite;
      `;
    }
    return '';
  }}

  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.xxlarge};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
    margin: ${props => props.theme.spacing.xs} 0;
    width: 100%;
  }
`;

// Improved found words section
const FoundWordsHeader = styled.h3`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.medium};
    margin-bottom: ${props => props.theme.spacing.xs};
  }
`;

const FoundWordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
    gap: ${props => props.theme.spacing.xs};
  }
`;

const WordChip = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => `${props.theme.colors.background}40`};
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: ${props => props.theme.fontSizes.small};
  color: ${props => props.theme.colors.text};
  box-shadow: ${props => props.theme.shadows.small};
  text-align: center;
  text-transform: uppercase;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSizes.xs};
    border-radius: ${props => props.theme.borderRadius.small};
  }
`;

// Stats section
const StatsSection = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.small};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  span:first-child {
    color: ${props => props.theme.colors.lightText};
  }
  
  span:last-child {
    font-weight: 600;
  }
`;

// Circular progress timer with improved visibility - Now used as backup
const CircularTimer = styled.div<{ $progress: number }>`
  display: none; /* Hide by default, we'll use the header gradient instead */
`;

// Timer Component
const TimerContainer = styled.div`
  position: relative;
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: bold;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.panel};
  box-shadow: ${props => props.theme.shadows.small};
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 80px;
  overflow: hidden;
  color: ${props => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.medium};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    min-width: 70px;
  }
`;

const TimerProgress = styled.div<{ $progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$progress}%;
  background-color: ${props => {
    if (props.$progress > 50) return props.theme.colors.timerBg;
    if (props.$progress > 25) return props.theme.colors.warning;
    return props.theme.colors.danger;
  }};
  opacity: 0.2;
  z-index: 0;
  transition: width 1s linear, background-color 1s ease;
`;

const TimerText = styled.div`
  position: relative;
  z-index: 1;
`;

// Timer Component
const Timer: React.FC<{ timeRemaining: number; totalTime: number }> = ({ 
  timeRemaining, 
  totalTime 
}) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = (timeRemaining / totalTime) * 100;
  
  return (
    <TimerContainer>
      <TimerProgress $progress={progress} />
      <TimerText>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </TimerText>
    </TimerContainer>
  );
};

// Score Display
const ScoreDisplay = styled.div`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: bold;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.panel};
  box-shadow: ${props => props.theme.shadows.small};
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 120px;
  color: ${props => props.theme.colors.text};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.medium};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    min-width: 100px;
  }
`;

// Header controls container
const HeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

// Challenge mode badge
const ChallengeBadge = styled.div`
  background-color: #4a90e2;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-block;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
`;

// Title with challenge badge container
const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

// Challenge top score indicator
const TopScoreIndicator = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
`;

// Player counter
const PlayerCounter = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
`;

// Game Screen Component
const GameScreen: React.FC = () => {
  const { state } = useGameContext();
  const { 
    timeRemaining, 
    totalTime, 
    score, 
    foundWords = [], 
    currentWord = '',
    gameMode,
    activeChallenge,
    topChallengeScore
  } = useGameState();
  
  // Calculate some stats
  const averageWordLength = foundWords.length 
    ? foundWords.reduce((sum: number, word: string) => sum + word.length, 0) / foundWords.length 
    : 0;
  
  const longestWord = foundWords.length 
    ? foundWords.reduce((longest: string, word: string) => word.length > longest.length ? word : longest, '') 
    : '';
  
  const isChallenge = gameMode === 'challenge';
  
  return (
    <GameContainer>
      <GameHeader>
        {isChallenge && (
          <TitleContainer>
            <ChallengeBadge>Challenge Mode</ChallengeBadge>
            {activeChallenge && (
              <PlayerCounter>
                Players: {activeChallenge.playerCount}/{activeChallenge.maxPlayers}
              </PlayerCounter>
            )}
          </TitleContainer>
        )}
        <HeaderControls>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ScoreDisplay>
              Score: {score}
            </ScoreDisplay>
            {isChallenge && topChallengeScore !== undefined && topChallengeScore > 0 && (
              <TopScoreIndicator>Beat: {topChallengeScore} pts</TopScoreIndicator>
            )}
          </div>
          <Timer timeRemaining={timeRemaining} totalTime={totalTime} />
        </HeaderControls>
        <CurrentWordDisplay>
          {currentWord || '···'}
        </CurrentWordDisplay>
      </GameHeader>
      
      <GameContent>
        <FlowerSection>
          <Flower />
        </FlowerSection>
        
        <SidebarSection>
          <FoundWordsHeader>Found Words</FoundWordsHeader>
          <FoundWordsGrid>
            {foundWords.length > 0 ? (
              foundWords.map((word: string, index: number) => (
                <WordChip key={`sidebar-${word}-${index}`}>{word}</WordChip>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', gridColumn: '1 / -1' }}>
                Words you find will appear here
              </div>
            )}
          </FoundWordsGrid>
          
          <StatsSection>
            <FoundWordsHeader>Statistics</FoundWordsHeader>
            <StatItem>
              <span>Words Found:</span>
              <span>{foundWords.length}</span>
            </StatItem>
            <StatItem>
              <span>Longest Word:</span>
              <span>{longestWord || '—'}</span>
            </StatItem>
            <StatItem>
              <span>Avg Word Length:</span>
              <span>{foundWords.length ? averageWordLength.toFixed(1) : '—'}</span>
            </StatItem>
            {isChallenge && (
              <StatItem>
                <span>Challenge Code:</span>
                <span>{activeChallenge?.code || '—'}</span>
              </StatItem>
            )}
          </StatsSection>
        </SidebarSection>
        
        <MobileFoundWords>
          <FoundWordsHeader>Found Words</FoundWordsHeader>
          <FoundWordsGrid>
            {foundWords.length > 0 ? (
              foundWords.map((word: string, index: number) => (
                <WordChip key={`mobile-${word}-${index}`}>{word}</WordChip>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', color: '#aaa', gridColumn: '1 / -1' }}>
                Words you find will appear here
              </div>
            )}
          </FoundWordsGrid>
        </MobileFoundWords>
      </GameContent>
    </GameContainer>
  );
};

export default GameScreen; 