import React from 'react';
import styled from 'styled-components';
import { LetterArrangement } from '../models/LetterArrangement';

interface WordleStyleGridProps {
  letterArrangement: LetterArrangement;
}

const WordleStyleGrid: React.FC<WordleStyleGridProps> = ({ letterArrangement }) => {
  // Destructure the letter arrangement
  const { center, innerRing, outerRing } = letterArrangement;
  
  // Organize letters into rows for a Wordle-like layout
  const rows = [
    // Top row - first 4 letters from outer ring
    outerRing.slice(0, 4),
    
    // Middle row - next 3 letters from inner ring
    innerRing.slice(0, 3),
    
    // Bottom row - just the center letter
    [center]
  ];
  
  return (
    <GridContainer>
      {rows.map((row, rowIndex) => (
        <Row key={`row-${rowIndex}`}>
          {row.map((letter, letterIndex) => (
            <LetterTile 
              key={`tile-${rowIndex}-${letterIndex}`}
              $tier={rowIndex === 2 ? 1 : rowIndex === 1 ? 2 : 3}
            >
              {letter.toUpperCase()}
            </LetterTile>
          ))}
        </Row>
      ))}
    </GridContainer>
  );
};

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

// Get colors based on petal tier to match game screen
const getColorByTier = (tier: number): string => {
  switch (tier) {
    case 1: return '#F5B946'; // Center (amber)
    case 2: return '#5ABEAF'; // Inner ring (teal)
    case 3: return '#B6A4DE'; // Outer ring (lavender)
    default: return '#f5f5f5';
  }
};

const LetterTile = styled.div<{ $tier: number }>`
  width: 50px;
  height: 50px;
  background-color: ${props => getColorByTier(props.$tier)};
  color: white;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export default WordleStyleGrid;