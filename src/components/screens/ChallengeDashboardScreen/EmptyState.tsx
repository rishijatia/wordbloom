import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 12px;
  margin: 0 auto;
  max-width: 600px;
  width: 100%;
  
  @media (min-width: 768px) {
    padding: 80px 30px;
    max-width: 700px;
  }
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    font-size: 80px;
    margin-bottom: 30px;
  }
`;

const Title = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  
  @media (min-width: 768px) {
    font-size: 28px;
    margin-bottom: 12px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #6b7280;
  max-width: 400px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    font-size: 18px;
    max-width: 500px;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (min-width: 768px) {
    width: 50px;
    height: 50px;
    border-width: 6px;
    border-top-width: 6px;
    margin-bottom: 30px;
  }
`;

type EmptyStateType = 'discover' | 'yours' | 'history' | 'loading';

interface EmptyStateProps {
  type: EmptyStateType;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: <LoadingSpinner />,
          title: 'Loading Challenges',
          description: 'Please wait while we fetch your challenges...'
        };
      case 'discover':
        return {
          icon: '🔍',
          title: 'No Challenges to Discover',
          description: 'Explore challenges from other players. Find a new word puzzle to solve!'
        };
      case 'yours':
        return {
          icon: '👤',
          title: 'No Active Challenges',
          description: 'Challenges you\'ve created or joined will appear here.'
        };
      case 'history':
        return {
          icon: '📜',
          title: 'No Challenge History',
          description: 'Your completed challenges from the past 7 days will be shown here.'
        };
      default:
        return {
          icon: '❓',
          title: 'Nothing to See Here',
          description: 'Please try another tab or create a new challenge.'
        };
    }
  };

  const { icon, title, description } = getContent();

  return (
    <Container>
      <Icon>{icon}</Icon>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Container>
  );
};

export default EmptyState;