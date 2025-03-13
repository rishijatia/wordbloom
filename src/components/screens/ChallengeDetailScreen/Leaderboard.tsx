import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ChallengeScore } from '../../../models/Challenge';
import { subscribeToLeaderboard, getDeviceId } from '../../../services/challengeService';

interface LeaderboardProps {
  challengeId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ challengeId }) => {
  const [scores, setScores] = useState<ChallengeScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentDeviceId = getDeviceId();
  const userRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Set up real-time updates for the leaderboard
      const unsubscribe = subscribeToLeaderboard(challengeId, (leaderboard) => {
        setScores(leaderboard);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to leaderboard:', err);
      setError('Failed to load leaderboard');
      setLoading(false);
    }
  }, [challengeId]);

  // Scroll to user's position when scores change
  useEffect(() => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [scores]);

  if (loading) {
    return <LoadingState>Loading leaderboard...</LoadingState>;
  }

  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }

  if (scores.length === 0) {
    return <EmptyState>No scores yet. Be the first to play this challenge!</EmptyState>;
  }

  return (
    <Container>
      <Title>Leaderboard</Title>
      <TableContainer>
        <LeaderboardTable>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Words</th>
              <th>Best Word</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => {
              const isCurrentUser = score.deviceId === currentDeviceId;
              return (
                <ScoreRow 
                  key={score.id} 
                  ref={isCurrentUser ? userRowRef : null}
                  $isCurrentUser={isCurrentUser}
                >
                  <td className="rank">{index + 1}</td>
                  <td className="player">
                    {score.playerName}
                    {isCurrentUser && <YouLabel>(You)</YouLabel>}
                  </td>
                  <td className="score">{score.score}</td>
                  <td className="words">{score.foundWords.length}</td>
                  <td className="best-word">{score.bestWord}</td>
                </ScoreRow>
              );
            })}
          </tbody>
        </LeaderboardTable>
      </TableContainer>
      
      <StatsSection>
        <StatTitle>Challenge Stats</StatTitle>
        <StatGrid>
          <StatItem>
            <StatLabel>Total Players</StatLabel>
            <StatValue>{scores.length}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Highest Score</StatLabel>
            <StatValue>{scores.length > 0 ? scores[0].score : 0}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Avg. Words Found</StatLabel>
            <StatValue>
              {scores.length > 0 
                ? Math.round(scores.reduce((sum, s) => sum + s.foundWords.length, 0) / scores.length) 
                : 0}
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Your Position</StatLabel>
            <StatValue>
              {scores.findIndex(s => s.deviceId === currentDeviceId) > -1 
                ? `${scores.findIndex(s => s.deviceId === currentDeviceId) + 1} / ${scores.length}` 
                : 'Not played'}
            </StatValue>
          </StatItem>
        </StatGrid>
      </StatsSection>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 24px;
  
  @media (min-width: 1024px) {
    flex: 1;
    min-width: 500px;
    max-width: none;
    padding-right: 24px;
    border-right: 1px solid #eee;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  margin: 0 0 16px 0;
  font-weight: 600;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 60vh;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .rank {
    width: 60px;
    text-align: center;
  }
  
  .player {
    min-width: 120px;
  }
  
  .score {
    width: 80px;
    text-align: center;
    font-weight: 600;
  }
  
  .words {
    width: 80px;
    text-align: center;
  }
  
  .best-word {
    min-width: 100px;
    font-style: italic;
  }
`;

const ScoreRow = styled.tr<{ $isCurrentUser: boolean }>`
  background-color: ${({ $isCurrentUser }) => $isCurrentUser ? 'rgba(0, 123, 255, 0.1)' : 'white'};
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${({ $isCurrentUser }) => $isCurrentUser ? 'rgba(0, 123, 255, 0.15)' : '#f8f9fa'};
  }
`;

const YouLabel = styled.span`
  margin-left: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #007bff;
`;

const StatsSection = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const StatTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 12px 0;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatItem = styled.div``;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #666;
`;

const ErrorState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #dc3545;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #666;
  text-align: center;
  padding: 0 24px;
`;

export default Leaderboard;