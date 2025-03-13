import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  getActiveChallenges, 
  getCreatedChallenges, 
  getParticipatedChallengeDetails, 
  getYourChallenges, 
  isChallengeExpired,
  PaginatedChallenges
} from '../../../services/challengeService';
import { Challenge } from '../../../models/Challenge';
import ChallengeCard from './ChallengeCard';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import TabInfo from './TabInfo';

type TabType = 'discover' | 'yours' | 'history';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto; /* Center the container */
  padding: 16px;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal scrolling */

  /* Add responsive padding adjustments */
  @media (min-width: 768px) {
    padding: 30px;
  }

  @media (min-width: 1200px) {
    padding: 40px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    margin-bottom: 36px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;

  &:hover {
    color: #4f46e5;
  }

  @media (min-width: 768px) {
    font-size: 42px;
    margin-bottom: 24px;
  }
`;

const TabDescription = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 16px;
  margin: 0 auto 20px;
  text-align: center;
  font-size: 16px;
  color: #4b5563;
  line-height: 1.5;
  
  p {
    margin: 0 0 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: #4f46e5;
  }

  @media (min-width: 768px) {
    max-width: 900px;
    padding: 20px;
    font-size: 18px;
    margin-bottom: 30px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    max-width: 700px;
  }
`;

const Tab = styled.button<{$active?: boolean}>`
  flex: 1;
  padding: 12px;
  background-color: ${props => props.$active ? '#4f46e5' : '#e5e7eb'};
  color: ${props => props.$active ? 'white' : '#4b5563'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;

  &:hover {
    background-color: ${props => props.$active ? '#4338ca' : '#d1d5db'};
  }
  
  @media (min-width: 768px) {
    padding: 16px;
    font-size: 18px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ChallengesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal overflow */
  overflow-y: auto; /* Allow vertical scrolling if needed */
  max-height: calc(100vh - 200px); /* Adjust max height to prevent vertical clipping */

  @media (max-width: 767px) {
    max-width: 100%;
    padding: 0;
    > * {
      max-width: 100%;
      min-width: 0;
    }
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const CreateButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #4f46e5;
  color: white;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background-color 0.2s;
  z-index: 10;

  &:hover {
    background-color: #4338ca;
    transform: scale(1.05);
  }

  @media (min-width: 768px) {
    bottom: 32px;
    right: 32px;
    width: 72px;
    height: 72px;
    font-size: 28px;
  }

  /* Ensure FAB is fully visible on all devices */
  @media (max-width: 767px) {
    bottom: 16px;
    right: 16px;
  }
`;

const TabIcon = styled.span`
  margin-right: 6px;
  
  @media (max-width: 480px) {
    margin-right: 0;
    margin-bottom: 4px;
    font-size: 16px;
  }
`;

const TabLabel = styled.span`
  @media (max-width: 480px) {
    font-size: 12px;
    display: block;
  }
`;

const TabContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

interface ChallengeDashboardScreenProps {
  onNavigateToDetail: (challenge: Challenge) => void;
  onPlayChallenge: (challenge: Challenge) => void;
  onNavigateToCreate: () => void;
  onBack: () => void;
}

const ChallengeDashboardScreen: React.FC<ChallengeDashboardScreenProps> = ({
  onNavigateToDetail,
  onPlayChallenge,
  onNavigateToCreate,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalChallenges, setTotalChallenges] = useState<number>(0);
  const [hasMoreChallenges, setHasMoreChallenges] = useState<boolean>(false);
  const [lastVisible, setLastVisible] = useState<any>(null);

  // Reset pagination when changing tabs
  useEffect(() => {
    setCurrentPage(1);
    setLastVisible(null);
    loadChallenges(activeTab, null);
  }, [activeTab]);

  // Helper function to check if a challenge is expiring soon (less than 3 hours)
  const isChallengExpiringSoon = (challenge: Challenge): boolean => {
    return !isChallengeExpired(challenge) && 
           (challenge.expiresAt - Date.now()) < (3 * 60 * 60 * 1000);
  };
  
  // Helper function to check if a challenge is popular (3 or more players)
  const isChallengePopular = (challenge: Challenge): boolean => {
    return challenge.playerCount >= 3;
  };
  
  // Helper function to sort challenges by priority
  const sortChallengesByPriority = (challenges: Challenge[]): Challenge[] => {
    return [...challenges].sort((a, b) => {
      // Both popular and expiring soon (highest priority)
      const aPopularAndExpiring = isChallengePopular(a) && isChallengExpiringSoon(a);
      const bPopularAndExpiring = isChallengePopular(b) && isChallengExpiringSoon(b);
      
      if (aPopularAndExpiring && !bPopularAndExpiring) return -1;
      if (!aPopularAndExpiring && bPopularAndExpiring) return 1;
      
      // Popular only (second priority)
      const aPopular = isChallengePopular(a);
      const bPopular = isChallengePopular(b);
      
      if (aPopular && !bPopular) return -1;
      if (!aPopular && bPopular) return 1;
      
      // Expiring soon only (third priority)
      const aExpiring = isChallengExpiringSoon(a);
      const bExpiring = isChallengExpiringSoon(b);
      
      if (aExpiring && !bExpiring) return -1;
      if (!aExpiring && bExpiring) return 1;
      
      // Both have same priority, sort by most recent
      return b.createdAt - a.createdAt;
    });
  };

  const loadChallenges = async (tab: TabType, lastDoc: any = null) => {
    setLoading(true);
    try {
      let result: PaginatedChallenges;
      
      switch (tab) {
        case 'discover':
          result = await getActiveChallenges(lastDoc, 10);
          // Sort by priority for discover challenges (should already be sorted by expiry by default)
          result.challenges = sortChallengesByPriority(result.challenges);
          break;
        case 'yours':
          result = await getYourChallenges(lastDoc, 10);
          break;
        case 'history':
          result = await getParticipatedChallengeDetails(lastDoc, 10);
          break;
        default:
          result = {
            challenges: [],
            lastVisible: null,
            hasMore: false
          };
      }
      
      setChallenges(lastDoc ? [...challenges, ...result.challenges] : result.challenges);
      setLastVisible(result.lastVisible);
      setHasMoreChallenges(result.hasMore);
      
      if (result.totalCount !== undefined) {
        setTotalChallenges(result.totalCount);
      } else if (lastDoc) {
        // If we're loading more pages, increment the total count estimate
        setTotalChallenges(Math.max(
          totalChallenges,
          challenges.length + result.challenges.length
        ));
      } else {
        // First page load, estimate based on current results and hasMore
        setTotalChallenges(
          result.challenges.length + (result.hasMore ? 10 : 0)
        );
      }
    } catch (error) {
      console.error(`Error loading ${tab} challenges:`, error);
      setChallenges([]);
      setHasMoreChallenges(false);
      setTotalChallenges(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page changes for pagination
  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1) return;
    
    // Store current page before changing
    const previousPage = currentPage;
    setCurrentPage(page);
    
    if (page === 1) {
      // First page - reset to beginning
      loadChallenges(activeTab, null);
    } else if (page === previousPage + 1) {
      // Moving forward one page - use current lastVisible
      loadChallenges(activeTab, lastVisible);
    } else {
      // Jump to specific page or backward - for now, reload from beginning
      // This is a limitation with Firestore - we can't go directly to arbitrary pages
      // In a more complex app, we'd store cursors for each page or use an offset-based approach
      
      // Show loading state while we fetch
      setLoading(true);
      
      // Start a fresh load from the first page
      let currentLastVisible: null = null;
      let currentResults: Challenge[] = [];
      
      // Sequential loading to reach the desired page
      const fetchSequentially = async () => {
        for (let i = 1; i <= page; i++) {
          const result = await (activeTab === 'discover' 
            ? getActiveChallenges(currentLastVisible, 10)
            : activeTab === 'yours'
            ? getCreatedChallenges(currentLastVisible, 10)
            : getParticipatedChallengeDetails(currentLastVisible, 10));
          
          if (i === page) {
            // We've reached the target page
            setChallenges(result.challenges);
            setLastVisible(result.lastVisible);
            setHasMoreChallenges(result.hasMore);
            if (result.totalCount !== undefined) {
              setTotalChallenges(result.totalCount);
            }
          }
          
          if (!result.lastVisible || !result.hasMore) {
            // No more pages to fetch
            break;
          }
          
          // Update for next iteration
          currentLastVisible = result.lastVisible;
          currentResults = result.challenges;
        }
        
        setLoading(false);
      };
      
      // Start sequential loading
      fetchSequentially().catch(error => {
        console.error(`Error loading page ${page}:`, error);
        setLoading(false);
        setChallenges([]);
      });
    }
  };
  
  // Handle "Load More" button for mobile
  const handleLoadMore = () => {
    if (!hasMoreChallenges || loading) return;
    
    setCurrentPage(currentPage + 1);
    loadChallenges(activeTab, lastVisible);
  };

  // Get the description message for each tab
  const getTabDescription = () => {
    if (loading) return null;
    
    switch (activeTab) {
      case 'discover':
        return (
          <TabDescription>
            <p><strong>Join the Community!</strong> Explore challenges from other players.</p>
            <p>Popular and soon-to-expire challenges are shown first. Jump in and see if you can top the leaderboard!</p>
          </TabDescription>
        );
      case 'yours':
        return challenges.length > 0 ? (
          <TabDescription>
            <p>These are challenges you've created or joined that are still active.</p>
            <p>Continue playing to improve your scores!</p>
          </TabDescription>
        ) : null;
      case 'history':
        return challenges.length > 0 ? (
          <TabDescription>
            <p><strong>Challenge History</strong> - Showing expired challenges from the past 7 days.</p>
            <p>View details to see how your performance compared to other players!</p>
          </TabDescription>
        ) : null;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (loading) {
      return <EmptyState type="loading" />;
    }

    if (challenges.length === 0) {
      return <EmptyState type={activeTab} />;
    }

    return (
      <ChallengesGrid>
        {challenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onViewDetails={() => onNavigateToDetail(challenge)}
            onPlay={() => onPlayChallenge(challenge)}
          />
        ))}
      </ChallengesGrid>
    );
  };

  return (
    <Container>
      <Header>
        <Title>Challenges</Title>
        <TabContainer>
          <Tab 
            $active={activeTab === 'discover'} 
            onClick={() => setActiveTab('discover')}
          >
            <TabContent>
              <TabIcon>🔍</TabIcon>
              <TabLabel>Discover</TabLabel>
            </TabContent>
          </Tab>
          <Tab 
            $active={activeTab === 'yours'} 
            onClick={() => setActiveTab('yours')}
          >
            <TabContent>
              <TabIcon>👤</TabIcon>
              <TabLabel>Your Challenges</TabLabel>
            </TabContent>
          </Tab>
          <Tab 
            $active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
          >
            <TabContent>
              <TabIcon>📜</TabIcon>
              <TabLabel>History</TabLabel>
            </TabContent>
          </Tab>
        </TabContainer>
      </Header>
      
      {getTabDescription()}
      
      {/* Tab information display */}
      {!loading && challenges.length > 0 && (
        <TabInfo 
          tabType={activeTab}
          count={totalChallenges}
          pageSize={10}
          currentPage={currentPage}
        />
      )}

      <Content>
        {renderContent()}
      </Content>
      
      {/* Pagination controls */}
      {!loading && challenges.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalChallenges}
          itemsPerPage={10}
          onPageChange={handlePageChange}
          onLoadMore={handleLoadMore}
          hasMore={hasMoreChallenges}
          loading={loading}
        />
      )}

      <CreateButton onClick={onNavigateToCreate}>+</CreateButton>
    </Container>
  );
};

export default ChallengeDashboardScreen;