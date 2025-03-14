import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Challenge } from '../../../models/Challenge';
import { 
  getChallengeById, 
  getChallengeLeaderboard, 
  subscribeToLeaderboard, 
  isChallengeExpired, 
  shareChallenge,
  subscribeToChallenge as importedSubscribeToChallenge, 
  getDeviceId 
} from '../../../services/challengeService';
import Leaderboard from './Leaderboard';
import WordUniquenessAnalysis from './WordUniquenessAnalysis';
import LetterUsageHeatmap from './LetterUsageHeatmap';
import ShareModal from '../../../components/game/ShareModal';

interface ChallengeDetailScreenProps {
  challengeId: string;
  onBack: () => void;
  onPlay: (challenge: Challenge) => void;
  onNavigateToShare?: (challenge: Challenge, score?: number) => void;
}

const ChallengeDetailScreen: React.FC<ChallengeDetailScreenProps> = ({ 
  challengeId, 
  onBack,
  onPlay,
  onNavigateToShare
}) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'words' | 'letters'>('overview');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [playerScore, setPlayerScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const fetchedChallenge = await getChallengeById(challengeId);
        
        if (!fetchedChallenge) {
          setError('Challenge not found');
          return;
        }
        
        setChallenge(fetchedChallenge);
        
        // Fetch the leaderboard to get the player's score
        const leaderboard = await getChallengeLeaderboard(challengeId);
        const deviceId = getDeviceId();
        const userScore = leaderboard.find(score => score.deviceId === deviceId);
        
        if (userScore) {
          setPlayerScore(userScore.score);
        }
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load challenge details');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();

    // Set up real-time updates for the challenge
    const unsubscribe = subscribeToChallenge(challengeId, (updatedChallenge) => {
      if (updatedChallenge) {
        setChallenge(updatedChallenge);
      }
    });

    return () => unsubscribe();
  }, [challengeId]);

  const handlePlayChallenge = () => {
    if (challenge) {
      onPlay(challenge);
    }
  };

  const handleShareChallenge = () => {
    if (challenge && onNavigateToShare) {
      // Use the new share screen instead of modal
      onNavigateToShare(challenge, playerScore);
    } else if (challenge) {
      // Fall back to modal if navigation function not provided
      setIsShareModalOpen(true);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading challenge details...</LoadingMessage>
      </Container>
    );
  }

  if (error || !challenge) {
    return (
      <Container>
        <ErrorMessage>{error || 'Challenge not found'}</ErrorMessage>
        <BackButton onClick={onBack}>Back to Challenges</BackButton>
      </Container>
    );
  }

  const isExpired = isChallengeExpired(challenge);
  const timeRemaining = isExpired ? 0 : challenge.expiresAt - Date.now();
  
  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'Expired';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>← Back</BackButton>
        <ChallengeInfo>
          <ChallengeTitle>Challenge: {challenge.code}</ChallengeTitle>
          <ChallengeCreator>Created by {challenge.createdByName}</ChallengeCreator>
          <ChallengeStatus $isExpired={isExpired}>
            {isExpired ? 'Expired' : formatTimeRemaining(timeRemaining)}
          </ChallengeStatus>
        </ChallengeInfo>
      </Header>

      <ActionBar>
        <ActionButton 
          $primary 
          disabled={isExpired}
          onClick={handlePlayChallenge}
        >
          {isExpired ? 'Challenge Expired' : 'Play Challenge'}
        </ActionButton>
        <ActionButton onClick={handleShareChallenge}>
          Share Challenge
        </ActionButton>
      </ActionBar>

      <TabNavigation>
        <Tab 
          $active={currentTab === 'overview'} 
          onClick={() => setCurrentTab('overview')}
        >
          Leaderboard
        </Tab>
        <Tab 
          $active={currentTab === 'words'} 
          onClick={() => setCurrentTab('words')}
        >
          Word Analysis
        </Tab>
        <Tab 
          $active={currentTab === 'letters'} 
          onClick={() => setCurrentTab('letters')}
        >
          Letter Usage
        </Tab>
      </TabNavigation>

      <ContentArea>
        {currentTab === 'overview' && (
          <Leaderboard challengeId={challengeId} />
        )}
        {currentTab === 'words' && (
          <WordUniquenessAnalysis challengeId={challengeId} />
        )}
        {currentTab === 'letters' && (
          <LetterUsageHeatmap 
            challengeId={challengeId} 
            letterArrangement={challenge.letterArrangement}
          />
        )}
      </ContentArea>
      
      {challenge && (
        <ShareModal
          challenge={challenge}
          playerScore={playerScore}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </Container>
  );
};

// Helper function to subscribe to real-time challenge updates
function subscribeToChallenge(
  challengeId: string,
  callback: (challenge: Challenge | null) => void
) {
  // Use the renamed imported function to avoid naming conflicts
  return importedSubscribeToChallenge(challengeId, callback);
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 0;
  text-align: left;
  margin-bottom: 8px;
  
  @media (min-width: 768px) {
    margin-right: 24px;
    margin-bottom: 0;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const ChallengeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChallengeTitle = styled.h1`
  font-size: 24px;
  margin: 0 0 8px 0;
  
  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const ChallengeCreator = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

// Using the $-prefixed prop (transient prop) to prevent it from being passed to the DOM
const ChallengeStatus = styled.div<{ $isExpired: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ $isExpired }) => $isExpired ? '#dc3545' : '#28a745'};
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    gap: 16px;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $primary }) => $primary 
    ? `
      background-color: #007bff;
      color: white;
      border: none;
      
      &:hover:not(:disabled) {
        background-color: #0069d9;
      }
      
      &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    `
    : `
      background-color: white;
      color: #007bff;
      border: 1px solid #007bff;
      
      &:hover {
        background-color: #f8f9fa;
      }
    `
  }
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 3px solid ${({ $active }) => $active ? '#007bff' : 'transparent'};
  color: ${({ $active }) => $active ? '#007bff' : '#495057'};
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ $active }) => $active ? '#007bff' : '#007bff'};
    border-bottom-color: ${({ $active }) => $active ? '#007bff' : '#dee2e6'};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  
  @media (min-width: 1024px) {
    display: flex;
    overflow: visible;
    gap: 24px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  margin-top: 48px;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  margin-top: 48px;
  font-size: 18px;
  color: #dc3545;
  margin-bottom: 16px;
`;

export default ChallengeDetailScreen;