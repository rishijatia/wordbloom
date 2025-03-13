import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  width: 100%;
  
  @media (min-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
  }
`;

const TabInfoText = styled.div`
  color: #4b5563;
  font-size: 14px;
  
  @media (min-width: 768px) {
    font-size: 16px;
  }
  
  strong {
    font-weight: 600;
    color: #374151;
  }
`;

const ChallengeCount = styled.div`
  color: #6b7280;
  font-size: 14px;
  margin-top: 6px;
  
  @media (min-width: 768px) {
    margin-top: 0;
    font-size: 15px;
  }
`;

interface TabInfoProps {
  tabType: 'discover' | 'yours' | 'history';
  count: number;
  pageSize: number;
  currentPage: number;
}

const TabInfo: React.FC<TabInfoProps> = ({ tabType, count, pageSize, currentPage }) => {
  // Calculate correct start and end indices
  // For page 1: 1-10, page 2: 11-20, etc.
  const startIndex = Math.min((currentPage - 1) * pageSize + 1, count);
  const endIndex = Math.min(currentPage * pageSize, count);
  
  const getTabInfoText = () => {
    switch (tabType) {
      case 'discover':
        return (
          <TabInfoText>
            <strong>Discover Challenges</strong> sorted by popularity and expiration time
          </TabInfoText>
        );
      case 'yours':
        return (
          <TabInfoText>
            <strong>Your Active Challenges</strong> sorted by last played (most recent first)
          </TabInfoText>
        );
      case 'history':
        return (
          <TabInfoText>
            <strong>Showing expired challenges from the past 7 days</strong> (most recent first)
          </TabInfoText>
        );
      default:
        return null;
    }
  };
  
  // Don't display if no challenges
  if (count === 0) {
    return null;
  }
  
  return (
    <Container>
      {getTabInfoText()}
      <ChallengeCount>
        Showing {startIndex}-{endIndex} of {count} challenge{count !== 1 ? 's' : ''}
      </ChallengeCount>
    </Container>
  );
};

export default TabInfo;