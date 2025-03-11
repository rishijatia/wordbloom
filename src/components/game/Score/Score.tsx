import styled from 'styled-components';

const ScoreContainer = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface ScoreProps {
  score: number;
}

export const Score: React.FC<ScoreProps> = ({ score }) => {
  return (
    <ScoreContainer>
      Score: {score}
    </ScoreContainer>
  );
}; 