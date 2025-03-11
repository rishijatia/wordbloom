import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';
import Flower from '../../game/Flower/Flower';
import { useGameState } from '../../../hooks/useGameState';
import { Score } from '../../game/Score/Score';

// Improved responsive container - eliminating modal-like styling on desktop
const GameContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #e0f7fa 0%, #f0f8ff 100%);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

// Improved header with better organization of components
const GameHeader = styled.div`
  width: 100%;
  max-width: 1440px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 20px;
  z-index: 10;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 8px 12px;
    margin-bottom: 5px;
    gap: 5px;
  }
`;

// Main content area with improved responsive sizing
const GameContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1440px;
  height: auto;
  min-height: calc(100vh - 180px);
  position: relative;
  z-index: 5;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
  overflow: visible;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 10px;
    overflow: visible;
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    gap: 10px;
    min-height: auto;
  }
`;

// Responsive flower container that scales properly on all screens
const FlowerSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: auto;
  min-height: 500px;
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  overflow: visible;
  transform-origin: center center;

  @media (max-width: 1024px) {
    flex: 2;
    min-height: 400px;
    transform: none;
  }

  @media (max-width: 768px) {
    min-height: 300px;
    margin-bottom: 0;
  }
`;

// Sidebar for the found words and stats (desktop only)
const SidebarSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  height: 100%;
  max-height: 600px;

  @media (max-width: 1024px) {
    flex: 1;
    margin-left: 0;
    padding: 15px;
    max-height: 200px;
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
    padding: 10px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(5px);
    border-radius: 12px;
    margin-top: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-height: 150px;
    overflow-y: auto;
  }
`;

// Current word display with better visibility
const CurrentWordDisplay = styled.div`
  font-size: 2rem;
  font-weight: bold;
  min-height: 2rem;
  min-width: 120px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    padding: 6px 12px;
    margin: 5px 0;
    width: 100%;
  }
`;

// Improved found words section
const FoundWordsHeader = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 4px;
  }
`;

const FoundWordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
    gap: 5px;
  }
`;

const WordChip = styled.div`
  padding: 5px 10px;
  background-color: #ffffff;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #495057;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  text-transform: uppercase;

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 0.75rem;
    border-radius: 10px;
  }
`;

// Stats section
const StatsSection = styled.div`
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

// Circular progress timer with improved visibility - Now used as backup
const CircularTimer = styled.div<{ $progress: number }>`
  display: none; /* Hide by default, we'll use the header gradient instead */
`;

// Timer Component
const Timer: React.FC<{ timeRemaining: number; totalTime: number }> = ({ 
  timeRemaining, 
  totalTime 
}) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  return (
    <div style={{ 
      fontSize: '1.2rem', 
      fontWeight: 'bold',
      padding: '4px 12px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: '60px'
    }}>
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};

// Game Screen Component
const GameScreen: React.FC = () => {
  const { state } = useGameContext();
  const { timeRemaining, totalTime, score, foundWords = [], currentWord = '' } = useGameState();
  const timerProgress = (timeRemaining / totalTime) * 100;
  
  // Calculate some stats
  const averageWordLength = foundWords.length 
    ? foundWords.reduce((sum: number, word: string) => sum + word.length, 0) / foundWords.length 
    : 0;
  
  const longestWord = foundWords.length 
    ? foundWords.reduce((longest: string, word: string) => word.length > longest.length ? word : longest, '') 
    : '';
  
  return (
    <GameContainer>
      <GameHeader style={{ background: `linear-gradient(to right, rgba(90, 196, 118, 0.6) ${timerProgress}%, rgba(255, 255, 255, 0.6) ${timerProgress}%)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Score score={score} />
          <Timer timeRemaining={timeRemaining} totalTime={totalTime} />
        </div>
        <CurrentWordDisplay>
          {currentWord || '···'}
        </CurrentWordDisplay>
      </GameHeader>
      
      <GameContent>
        <FlowerSection>
          <CircularTimer $progress={timerProgress} />
          <Flower />
        </FlowerSection>
        
        <SidebarSection>
          <FoundWordsHeader>Found Words</FoundWordsHeader>
          <FoundWordsGrid>
            {foundWords.map((word: string, index: number) => (
              <WordChip key={index}>{word}</WordChip>
            ))}
          </FoundWordsGrid>
          
          <StatsSection>
            <FoundWordsHeader>Statistics</FoundWordsHeader>
            <StatItem>
              <span>Words Found:</span>
              <span>{foundWords.length}</span>
            </StatItem>
            <StatItem>
              <span>Longest Word:</span>
              <span>{longestWord}</span>
            </StatItem>
            <StatItem>
              <span>Avg Word Length:</span>
              <span>{averageWordLength.toFixed(1)}</span>
            </StatItem>
          </StatsSection>
        </SidebarSection>
        
        <MobileFoundWords>
          <FoundWordsHeader>Found Words</FoundWordsHeader>
          <FoundWordsGrid>
            {foundWords.map((word: string, index: number) => (
              <WordChip key={index}>{word}</WordChip>
            ))}
          </FoundWordsGrid>
        </MobileFoundWords>
      </GameContent>
    </GameContainer>
  );
};

export default GameScreen; 