import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

const WordListContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  max-height: 150px;
  overflow-y: auto;
`;

const Title = styled.h3`
  margin-bottom: 10px;
  text-align: center;
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const WordList: React.FC = () => {
  const { state } = useGameContext();
  const { foundWords } = state;
  
  // Ideally, we'd have word scores here too
  // For simplicity, we're just showing the words
  
  return (
    <WordListContainer>
      <Title>Found Words</Title>
      <List>
        {foundWords.map((word, index) => (
          <ListItem key={index}>
            <span>{word}</span>
            {/* If we had word scores: <span>+{wordScores[word]}</span> */}
          </ListItem>
        ))}
      </List>
    </WordListContainer>
  );
};

export default WordList; 