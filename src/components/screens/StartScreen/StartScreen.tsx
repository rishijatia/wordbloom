import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';
import { parseUrlForChallengeCode, getChallengeByCode } from '../../../services/challengeService';
import ChallengeEntryScreen from '../ChallengeEntryScreen/ChallengeEntryScreen';
import { Challenge } from '../../../models/Challenge';

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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
`;

const Button = styled.button<{ $primary?: boolean; $secondary?: boolean }>`
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: ${props => {
    if (props.$primary) return '#5ac476';
    if (props.$secondary) return '#4a90e2';
    return '#f0f0f0';
  }};
  color: ${props => (props.$primary || props.$secondary) ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => {
      if (props.$primary) return '#4aa366';
      if (props.$secondary) return '#3a80d2';
      return '#e0e0e0';
    }};
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

enum StartScreenMode {
  MAIN,
  JOIN_CHALLENGE
}

const StartScreen: React.FC = () => {
  const { startGame, startChallengeGame, setGameMode } = useGameContext();
  const [screenMode, setScreenMode] = useState<StartScreenMode>(StartScreenMode.MAIN);
  
  // Check URL for challenge code on mount
  useEffect(() => {
    const challengeCode = parseUrlForChallengeCode();
    if (challengeCode) {
      setScreenMode(StartScreenMode.JOIN_CHALLENGE);
    }
  }, []);
  
  const handleClassicMode = () => {
    setGameMode('classic');
    startGame();
  };
  
  const handleJoinChallenge = (challenge: Challenge) => {
    setGameMode('challenge');
    startChallengeGame(challenge);
  };
  
  const handleCancelJoinChallenge = () => {
    setScreenMode(StartScreenMode.MAIN);
  };
  
  if (screenMode === StartScreenMode.JOIN_CHALLENGE) {
    return (
      <ChallengeEntryScreen 
        onCancel={handleCancelJoinChallenge}
        onJoinChallenge={handleJoinChallenge}
      />
    );
  }
  
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

      <ButtonGroup>
        <Button $primary onClick={handleClassicMode}>
          Classic Mode
        </Button>
        <Button $secondary onClick={() => setScreenMode(StartScreenMode.JOIN_CHALLENGE)}>
          Join Challenge
        </Button>
      </ButtonGroup>
    </StartContainer>
  );
};

export default StartScreen; 