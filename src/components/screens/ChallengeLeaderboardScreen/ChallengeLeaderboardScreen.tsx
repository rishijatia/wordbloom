import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { ChallengeScore } from '../../../models/Challenge';
import { 
  getChallengeLeaderboard, 
  shareChallenge, 
  getDeviceId,
  subscribeToLeaderboard,
  subscribeToChallenge
} from '../../../services/challengeService';

const LeaderboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  gap: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0;
  text-align: center;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #555;
  margin: 0;
  text-align: center;
`;

const LeaderboardTable = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ScrollableLeaderboard = styled.div`
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

const LeaderboardHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 100px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-weight: bold;
  color: #333;
`;

const LeaderboardRow = styled.div<{ $isCurrentPlayer: boolean }>`
  display: grid;
  grid-template-columns: 60px 1fr 100px;
  padding: 12px 16px;
  background-color: ${props => props.$isCurrentPlayer ? '#e9f7ef' : 'white'};
  border: 1px solid ${props => props.$isCurrentPlayer ? '#5ac476' : '#eee'};
  border-radius: 8px;
  
  &:hover {
    background-color: ${props => props.$isCurrentPlayer ? '#dcf2e5' : '#f9f9f9'};
  }
`;

const RankCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
`;

const ScoreCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: bold;
  font-size: 1.1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
  margin-top: 20px;
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
  gap: 10px;
  
  &:hover {
    background-color: ${props => {
      if (props.$primary) return '#4aa366';
      if (props.$secondary) return '#3a80d2';
      return '#e0e0e0';
    }};
  }
`;

const ChallengeInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const ChallengeCode = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  letter-spacing: 2px;
`;

const EmptyLeaderboard = styled.div`
  padding: 30px;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  width: 100%;
`;

interface ChallengeLeaderboardScreenProps {
  challenge: Challenge;
  score: number;
  foundWords: string[];
  onPlayAgain: () => void;
  onNewChallenge: () => void;
  onBackToHome: () => void;
}

const ChallengeLeaderboardScreen: React.FC<ChallengeLeaderboardScreenProps> = ({
  challenge,
  score,
  foundWords,
  onPlayAgain,
  onNewChallenge,
  onBackToHome
}) => {
  const [leaderboard, setLeaderboard] = useState<ChallengeScore[]>([]);
  const [updatedChallenge, setUpdatedChallenge] = useState<Challenge>(challenge);
  const [loading, setLoading] = useState(true);
  const deviceId = getDeviceId();
  
  useEffect(() => {
    console.log(`ChallengeLeaderboard mounted for challenge: ${challenge.id}`);
    
    // Initial load of leaderboard data
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('Loading initial leaderboard data...');
        const initialLeaderboard = await getChallengeLeaderboard(challenge.id);
        console.log(`Loaded ${initialLeaderboard.length} initial scores`);
        
        if (initialLeaderboard.length > 0) {
          console.log('Initial leaderboard entries:');
          initialLeaderboard.forEach((entry, idx) => {
            console.log(`${idx+1}. ${entry.playerName}: ${entry.score}`);
          });
        }
        
        setLeaderboard(initialLeaderboard);
      } catch (error) {
        console.error('Error loading initial leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Set up real-time listeners
    console.log('Setting up leaderboard real-time listener');
    const leaderboardUnsubscribe = subscribeToLeaderboard(
      challenge.id,
      (updatedLeaderboard) => {
        console.log(`Received updated leaderboard with ${updatedLeaderboard.length} entries`);
        
        if (updatedLeaderboard.length > 0) {
          console.log('Updated leaderboard entries:');
          updatedLeaderboard.forEach((entry, idx) => {
            console.log(`${idx+1}. ${entry.playerName}: ${entry.score}`);
          });
        }
        
        setLeaderboard(updatedLeaderboard);
      }
    );
    
    console.log('Setting up challenge real-time listener');
    const challengeUnsubscribe = subscribeToChallenge(
      challenge.id,
      (updatedChallengeData) => {
        if (updatedChallengeData) {
          console.log('Received updated challenge data', updatedChallengeData);
          setUpdatedChallenge(updatedChallengeData);
        }
      }
    );
    
    // Clean up listeners on unmount
    return () => {
      console.log('Cleaning up leaderboard subscriptions');
      leaderboardUnsubscribe();
      challengeUnsubscribe();
    };
  }, [challenge.id]);
  
  const handleShare = async () => {
    try {
      await shareChallenge(updatedChallenge, score);
      if (window.addNotification) {
        window.addNotification('Challenge shared!', 'success', 2000);
      }
    } catch (err) {
      console.error('Failed to share challenge:', err);
      if (window.addNotification) {
        window.addNotification('Failed to share challenge', 'error', 2000);
      }
    }
  };
  
  const playerRank = leaderboard.findIndex(score => score.deviceId === deviceId) + 1;
  
  return (
    <LeaderboardContainer>
      <Title>Challenge Results</Title>
      
      <ChallengeInfo>
        <Subtitle>Challenge Code</Subtitle>
        <ChallengeCode>{updatedChallenge.code}</ChallengeCode>
      </ChallengeInfo>
      
      {loading ? (
        <EmptyLeaderboard>Loading leaderboard data...</EmptyLeaderboard>
      ) : leaderboard.length > 0 ? (
        <LeaderboardTable>
          <LeaderboardHeader>
            <div>Rank</div>
            <div>Player</div>
            <div>Score</div>
          </LeaderboardHeader>
          
          <ScrollableLeaderboard>
            {leaderboard.map((scoreItem, index) => (
              <LeaderboardRow 
                key={`${scoreItem.id}-${index}`} 
                $isCurrentPlayer={scoreItem.deviceId === deviceId}
              >
                <RankCell>{index + 1}</RankCell>
                <NameCell>{scoreItem.playerName || 'Unknown Player'}</NameCell>
                <ScoreCell>{scoreItem.score}</ScoreCell>
              </LeaderboardRow>
            ))}
          </ScrollableLeaderboard>
          
          {/* Player count indicator */}
          <div style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>
            {updatedChallenge.playerCount} out of {updatedChallenge.maxPlayers} players
          </div>
        </LeaderboardTable>
      ) : score > 0 ? (
        <EmptyLeaderboard>
          Your score has been submitted! Waiting for the leaderboard to update...
        </EmptyLeaderboard>
      ) : (
        <EmptyLeaderboard>
          No scores yet. Be the first to complete this challenge!
        </EmptyLeaderboard>
      )}
      
      <ButtonGroup>
        <Button $secondary onClick={handleShare}>
          Share Challenge
        </Button>
        <Button $primary onClick={onPlayAgain}>
          Play Again
        </Button>
        <Button onClick={onNewChallenge}>
          Create New Challenge
        </Button>
        <Button onClick={onBackToHome}>
          Back to Home
        </Button>
      </ButtonGroup>
    </LeaderboardContainer>
  );
};

export default ChallengeLeaderboardScreen;