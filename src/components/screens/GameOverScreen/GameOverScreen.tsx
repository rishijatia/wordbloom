import React, { useState } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';
import { Challenge } from '../../../models/Challenge';
import ChallengeCreationScreen from '../ChallengeCreationScreen/ChallengeCreationScreen';
import ChallengeCodeScreen from '../ChallengeCodeScreen/ChallengeCodeScreen';
import ChallengeLeaderboardScreen from '../ChallengeLeaderboardScreen/ChallengeLeaderboardScreen';
import ShareModal from '../../../components/game/ShareModal';
import { submitChallengeScore, getPlayerName, savePlayerName } from '../../../services/challengeService';

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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button<{ $primary?: boolean; $secondary?: boolean }>`
  padding: 12px 30px;
  background-color: ${props => {
    if (props.$primary) return '#3498db';
    if (props.$secondary) return '#5ac476';
    return '#f0f0f0';
  }};
  color: ${props => (props.$primary || props.$secondary) ? 'white' : '#333'};
  border: none;
  border-radius: 50px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => {
      if (props.$primary) return '#2980b9';
      if (props.$secondary) return '#4aa366';
      return '#e0e0e0';
    }};
  }
`;

enum GameOverMode {
  CLASSIC_RESULTS,
  CHALLENGE_RESULTS,
  CREATE_CHALLENGE,
  SHOW_CHALLENGE_CODE
}

interface GameOverScreenProps {
  onViewChallenges?: () => void;
  onViewChallengeDetails?: (challenge: Challenge) => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onViewChallenges, onViewChallengeDetails }) => {
  const { state, startGame, startChallengeGame, createChallenge } = useGameContext();
  const { score, foundWords, stats, gameMode, activeChallenge } = state;
  const [screenMode, setScreenMode] = useState<GameOverMode>(
    gameMode === 'challenge' ? GameOverMode.CHALLENGE_RESULTS : GameOverMode.CLASSIC_RESULTS
  );
  const [createdChallenge, setCreatedChallenge] = useState<Challenge | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  // Format average word length to 1 decimal place
  const formattedAvgLength = stats.avgWordLength.toFixed(1);
  
  // Submit score if playing an existing challenge (not when creating a new one)
  React.useEffect(() => {
    const submitScore = async () => {
      if (gameMode === 'challenge' && activeChallenge) {
        try {
          // Get the player's name
          const playerName = getPlayerName();
          
          console.log(`Submitting score for existing challenge: ${activeChallenge.id}, player: ${playerName}, score: ${score}`);
          
          await submitChallengeScore(
            activeChallenge.id,
            playerName,
            score,
            foundWords
          );
          
          console.log('Score submitted successfully');
          
          if (window.addNotification) {
            window.addNotification('Score submitted to leaderboard!', 'success', 2000);
          }
        } catch (error) {
          console.error('Error submitting challenge score:', error);
          if (window.addNotification) {
            window.addNotification('Error submitting score', 'error', 3000);
          }
        }
      }
    };
    
    submitScore();
  }, []);
  
  const handlePlayAgain = () => {
    startGame();
  };
  
  const handleCreateChallenge = async (playerName: string) => {
    try {
      // Save the player name for future reference
      savePlayerName(playerName);
      
      // Create the challenge (score submission is now handled in the context)
      const challenge = await createChallenge();
      
      if (challenge) {
        console.log(`Challenge created with ID: ${challenge.id}`);
        
        if (window.addNotification) {
          window.addNotification('Challenge created and score submitted!', 'success', 2000);
        }
        
        setCreatedChallenge(challenge);
        setScreenMode(GameOverMode.SHOW_CHALLENGE_CODE);
      } else {
        if (window.addNotification) {
          window.addNotification('Failed to create challenge', 'error', 3000);
        }
      }
    } catch (error) {
      console.error('Error in handleCreateChallenge:', error);
      if (window.addNotification) {
        window.addNotification('Error creating challenge', 'error', 3000);
      }
    }
  };
  
  const handlePlayChallenge = async () => {
    if (createdChallenge) {
      try {
        await startChallengeGame(createdChallenge);
      } catch (error) {
        console.error('Error playing challenge:', error);
        if (window.addNotification) {
          window.addNotification('Error starting challenge game', 'error', 3000);
        }
      }
    }
  };
  
  const handlePlayAgainChallenge = async () => {
    if (activeChallenge) {
      try {
        await startChallengeGame(activeChallenge);
      } catch (error) {
        console.error('Error replaying challenge:', error);
        if (window.addNotification) {
          window.addNotification('Error replaying challenge', 'error', 3000);
        }
      }
    }
  };
  
  const handleShareChallenge = () => {
    setIsShareModalOpen(true);
  };
  
  const handleViewChallengeDetails = () => {
    if (activeChallenge && onViewChallengeDetails) {
      onViewChallengeDetails(activeChallenge);
    }
  };
  
  // Challenge Creation Screen
  if (screenMode === GameOverMode.CREATE_CHALLENGE) {
    return (
      <ChallengeCreationScreen
        onCancel={() => setScreenMode(GameOverMode.CLASSIC_RESULTS)}
        onCreateChallenge={handleCreateChallenge}
      />
    );
  }
  
  // Challenge Code Screen (after creation)
  if (screenMode === GameOverMode.SHOW_CHALLENGE_CODE && createdChallenge) {
    return (
      <ChallengeCodeScreen
        challenge={createdChallenge}
        score={score}
        onBack={() => setScreenMode(GameOverMode.CLASSIC_RESULTS)}
        onPlayChallenge={handlePlayChallenge}
        onDone={() => setScreenMode(GameOverMode.CLASSIC_RESULTS)}
      />
    );
  }
  
  // Challenge Results Screen
  if (screenMode === GameOverMode.CHALLENGE_RESULTS && activeChallenge) {
    return (
      <ChallengeLeaderboardScreen
        challenge={activeChallenge}
        score={score}
        foundWords={foundWords}
        onPlayAgain={handlePlayAgainChallenge}
        onNewChallenge={handlePlayAgain}
        onBackToHome={() => startGame()} // This is a bit of a hack to reset
        onViewDetails={onViewChallengeDetails ? () => onViewChallengeDetails(activeChallenge) : undefined}
      />
    );
  }
  
  // Classic Game Over Screen
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
      
      <ButtonGroup>
        <Button $primary onClick={handlePlayAgain}>Play Again</Button>
        <Button $secondary onClick={() => setScreenMode(GameOverMode.CREATE_CHALLENGE)}>
          Create Challenge
        </Button>
        {onViewChallenges && (
          <Button onClick={onViewChallenges}>
            View Challenges
          </Button>
        )}
        {activeChallenge && onViewChallengeDetails && (
          <Button onClick={handleViewChallengeDetails}>
            View Results
          </Button>
        )}
        {activeChallenge && (
          <Button onClick={handleShareChallenge}>
            Share Challenge
          </Button>
        )}
      </ButtonGroup>
      
      {activeChallenge && (
        <ShareModal
          challenge={activeChallenge}
          playerScore={score}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </GameOverContainer>
  );
};

export default GameOverScreen; 