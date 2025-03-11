import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';

const StartContainer = styled.div`
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

const StartButton = styled.button`
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: #5ac476;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4aa366;
  }
`;

const InstructionsSection = styled.div`
  width: 100%;
  text-align: center;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const RulesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const RulesTitle = styled.h2`
  font-size: 1.4rem;
  color: #333;
  margin: 0;
`;

const RulesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const Rule = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
  font-size: 1.1rem;

  &::before {
    content: "•";
    color: #5ac476;
  }
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
`;

const ControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const ColumnTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const ControlsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const Control = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;

  &::before {
    content: "•";
    color: #5ac476;
  }
`;

const StartScreen: React.FC = () => {
  const { startGame } = useGameContext();
  
  return (
    <StartContainer>
      <Title>WordBloom</Title>

      <InstructionsSection>
        <RulesContainer>
          <RulesTitle>Game Rules</RulesTitle>
          <RulesList>
            <Rule>Must use center letter</Rule>
            <Rule>Words must be 3-9 letters</Rule>
            <Rule>Use only connected letters</Rule>
          </RulesList>
        </RulesContainer>

        <ControlsGrid>
          <ControlsColumn>
            <ColumnTitle>PC Controls</ColumnTitle>
            <ControlsList>
              <Control>Type letters to select</Control>
              <Control>Enter to submit</Control>
              <Control>Backspace to clear</Control>
            </ControlsList>
          </ControlsColumn>

          <ControlsColumn>
            <ColumnTitle>Mobile Controls</ColumnTitle>
            <ControlsList>
              <Control>Drag to select letters</Control>
              <Control>Release to submit</Control>
            </ControlsList>
          </ControlsColumn>
        </ControlsGrid>
      </InstructionsSection>

      <StartButton onClick={startGame}>
        Start Game
      </StartButton>
    </StartContainer>
  );
};

export default StartScreen; 