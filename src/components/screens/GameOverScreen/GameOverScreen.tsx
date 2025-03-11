import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

const GameOverContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 100;
  padding: 20px;
  overflow-y: auto;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #2c3e50;
`;

const Score = styled.p`
  margin-bottom: 10px;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
`;

const StatsContainer = styled.div`
  background-color: rgba(236, 240, 241, 0.8);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  width: 80%;
  max-width: 400px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(189, 195, 199, 0.5);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  font-weight: 500;
  color: #34495e;
  text-align: left;
`;

const StatValue = styled.span`
  color: #2980b9;
  font-weight: 600;
`;

const FoundWordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  max-width: 500px;
  max-height: 150px;
  overflow-y: auto;
  padding: 10px;
  background-color: rgba(236, 240, 241, 0.5);
  border-radius: 8px;
`;

const WordBadge = styled.div`
  background-color: #3498db;
  color: white;
  border-radius: 30px;
  padding: 5px 10px;
  font-size: 0.9rem;
  display: inline-block;
`;

const PlayAgainButton = styled.button`
  padding: 12px 30px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 15px;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const GameOverScreen: React.FC = () => {
  const { state, startGame } = useGameContext();
  const { score, foundWords, stats } = state;
  
  // Format average word length to 1 decimal place
  const formattedAvgLength = stats.avgWordLength.toFixed(1);
  
  return (
    <GameOverContainer>
      <Title>Game Over!</Title>
      
      <Score>{score} points</Score>
      
      <StatsContainer>
        <StatRow>
          <StatLabel>Words Found</StatLabel>
          <StatValue>{stats.wordsFound}</StatValue>
        </StatRow>
        
        <StatRow>
          <StatLabel>Longest Word</StatLabel>
          <StatValue>{stats.longestWord || 'None'}</StatValue>
        </StatRow>
        
        <StatRow>
          <StatLabel>Avg Word Length</StatLabel>
          <StatValue>{formattedAvgLength}</StatValue>
        </StatRow>
      </StatsContainer>
      
      {foundWords.length > 0 && (
        <>
          <h3>Words Found</h3>
          <FoundWordsContainer>
            {foundWords.map((word, index) => (
              <WordBadge key={index}>{word}</WordBadge>
            ))}
          </FoundWordsContainer>
        </>
      )}
      
      <PlayAgainButton onClick={startGame}>Play Again</PlayAgainButton>
    </GameOverContainer>
  );
};

export default GameOverScreen; 