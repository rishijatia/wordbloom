import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { LetterArrangement } from '../../../models/LetterArrangement';
import { ChallengeScore } from '../../../models/Challenge';
import { getChallengeLeaderboard, getDeviceId } from '../../../services/challengeService';

interface LetterUsageHeatmapProps {
  challengeId: string;
  letterArrangement: LetterArrangement;
}

interface LetterUsage {
  letter: string;
  count: number;
  totalWords: number;
  heatLevel: number; // 0-6, 0 is unused, 6 is most used
}

// Maximum heat level
const MAX_HEAT_LEVEL = 6;

// Colors for the heat levels (from cool to hot)
const heatColors = [
  '#CCCCCC', // gray (unused)
  '#67B7DC', // light blue (rarely used)
  '#6794DC', // blue
  '#8067DC', // purple
  '#C767DC', // pink
  '#DC67AB', // magenta
  '#DC6767'  // red (most used)
];

const LetterUsageHeatmap: React.FC<LetterUsageHeatmapProps> = ({ 
  challengeId, 
  letterArrangement 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<ChallengeScore[]>([]);
  const [viewMode, setViewMode] = useState<'community' | 'personal'>('community');
  const deviceId = getDeviceId();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const leaderboard = await getChallengeLeaderboard(challengeId);
        setScores(leaderboard);
      } catch (err) {
        console.error('Error fetching letter usage data:', err);
        setError('Failed to load letter usage data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [challengeId]);
  
  // Calculate letter usage based on found words
  const calculateLetterUsage = (words: string[]): Map<string, number> => {
    const letterMap = new Map<string, number>();
    
    words.forEach(word => {
      const letters = word.split('');
      letters.forEach(letter => {
        const upperLetter = letter.toUpperCase();
        letterMap.set(upperLetter, (letterMap.get(upperLetter) || 0) + 1);
      });
    });
    
    return letterMap;
  };
  
  // Get all words found by all players
  const allFoundWords = useMemo(() => {
    const words: string[] = [];
    scores.forEach(score => {
      score.foundWords.forEach(word => {
        if (!words.includes(word)) {
          words.push(word);
        }
      });
    });
    return words;
  }, [scores]);
  
  // Get words found by the current user
  const userFoundWords = useMemo(() => {
    const userScore = scores.find(score => score.deviceId === deviceId);
    return userScore ? userScore.foundWords : [];
  }, [scores, deviceId]);
  
  // Generate letter usage data for the heatmap
  const letterUsageData = useMemo(() => {
    // Choose which word set to analyze based on viewMode
    const wordsToAnalyze = viewMode === 'community' ? allFoundWords : userFoundWords;
    
    if (wordsToAnalyze.length === 0) {
      // If no words, create default data with all letters at heat level 0
      return [
        letterArrangement.center, 
        ...letterArrangement.innerRing,
        ...letterArrangement.outerRing
      ].map(letter => ({
        letter,
        count: 0,
        totalWords: 0,
        heatLevel: 0
      }));
    }
    
    // Calculate letter usage counts
    const letterCounts = calculateLetterUsage(wordsToAnalyze);
    
    // Find max count for normalization
    const maxCount = Math.max(...Array.from(letterCounts.values()));
    
    // Generate data for each letter
    const result: LetterUsage[] = [];
    
    // Add center letter
    result.push({
      letter: letterArrangement.center,
      count: letterCounts.get(letterArrangement.center) || 0,
      totalWords: wordsToAnalyze.length,
      heatLevel: calculateHeatLevel(letterCounts.get(letterArrangement.center) || 0, maxCount)
    });
    
    // Add inner ring letters
    letterArrangement.innerRing.forEach(letter => {
      result.push({
        letter,
        count: letterCounts.get(letter) || 0,
        totalWords: wordsToAnalyze.length,
        heatLevel: calculateHeatLevel(letterCounts.get(letter) || 0, maxCount)
      });
    });
    
    // Add outer ring letters
    letterArrangement.outerRing.forEach(letter => {
      result.push({
        letter,
        count: letterCounts.get(letter) || 0,
        totalWords: wordsToAnalyze.length,
        heatLevel: calculateHeatLevel(letterCounts.get(letter) || 0, maxCount)
      });
    });
    
    return result;
  }, [letterArrangement, allFoundWords, userFoundWords, viewMode]);
  
  // Calculate heat level (0-6) based on usage count
  function calculateHeatLevel(count: number, maxCount: number): number {
    if (count === 0) return 0;
    if (maxCount === 0) return 0;
    
    // Normalize and convert to heat level
    return Math.ceil((count / maxCount) * MAX_HEAT_LEVEL);
  }
  
  // Get color for a heat level
  function getHeatColor(heatLevel: number): string {
    return heatColors[heatLevel];
  }
  
  // Check if user has played
  // First using standard logic - did they find any words?
  let hasPlayed = userFoundWords.length > 0;
  
  // Add session storage backup for when firestore data might be slow to load
  const sessionStorageKey = `played_challenge_${challengeId}`;
  if (!hasPlayed && sessionStorage.getItem(sessionStorageKey) === 'true') {
    hasPlayed = true;
  }
  
  // Log diagnostic information
  console.log("Letter Heatmap - Has played?", hasPlayed, "Device ID:", deviceId);
  console.log("Found words:", userFoundWords.length);
  
  if (loading) {
    return <LoadingState>Loading letter usage data...</LoadingState>;
  }
  
  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }
  
  return (
    <Container>
      <Title>Letter Usage Heatmap</Title>
      
      <ControlsContainer>
        <ViewToggle>
          <ToggleButton 
            $active={viewMode === 'community'} 
            onClick={() => setViewMode('community')}
          >
            Community Usage
          </ToggleButton>
          <ToggleButton 
            $active={viewMode === 'personal'} 
            onClick={() => setViewMode('personal')}
            disabled={!hasPlayed}
          >
            Your Usage
          </ToggleButton>
        </ViewToggle>
        
        <LegendContainer>
          {heatColors.map((color, index) => (
            <LegendItem key={index}>
              <LegendColor style={{ backgroundColor: color }} />
              <LegendLabel>
                {index === 0 ? 'Unused' : 
                 index === MAX_HEAT_LEVEL ? 'Most Used' : ''}
              </LegendLabel>
            </LegendItem>
          ))}
        </LegendContainer>
      </ControlsContainer>
      
      {!hasPlayed && viewMode === 'personal' ? (
        <NotPlayedMessage>
          You haven't played this challenge yet. Play to see your letter usage heatmap!
        </NotPlayedMessage>
      ) : (
        <HeatmapContainer>
          <FlowerHeatmap>
            {/* Center hex */}
            <CenterHex>
              <HexContent 
                heatLevel={letterUsageData[0].heatLevel}
                style={{ backgroundColor: getHeatColor(letterUsageData[0].heatLevel) }}
              >
                <Letter>{letterUsageData[0].letter}</Letter>
                <Count>{letterUsageData[0].count}</Count>
              </HexContent>
            </CenterHex>
            
            {/* Inner ring */}
            <InnerRing>
              {letterUsageData.slice(1, 7).map((letterData, index) => (
                <Hex key={index}>
                  <HexContent 
                    heatLevel={letterData.heatLevel}
                    style={{ backgroundColor: getHeatColor(letterData.heatLevel) }}
                  >
                    <Letter>{letterData.letter}</Letter>
                    <Count>{letterData.count}</Count>
                  </HexContent>
                </Hex>
              ))}
            </InnerRing>

            {/* Outer ring */}
            <OuterRing>
              {letterUsageData.slice(7, 19).map((letterData, index) => (
                <OuterHex key={index}>
                  <HexContent 
                    heatLevel={letterData.heatLevel}
                    style={{ backgroundColor: getHeatColor(letterData.heatLevel) }}
                  >
                    <Letter className="small">{letterData.letter}</Letter>
                    <Count className="small">{letterData.count}</Count>
                  </HexContent>
                </OuterHex>
              ))}
            </OuterRing>
          </FlowerHeatmap>
          
          <StatsContainer>
            <StatTitle>
              {viewMode === 'community' ? 'Community Stats' : 'Your Stats'}
            </StatTitle>
            <StatGrid>
              <StatItem>
                <StatLabel>Total Words</StatLabel>
                <StatValue>
                  {viewMode === 'community' ? allFoundWords.length : userFoundWords.length}
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Most Used</StatLabel>
                <StatValue>
                  {letterUsageData.sort((a, b) => b.count - a.count)[0].letter}
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Least Used</StatLabel>
                <StatValue>
                  {letterUsageData
                    .filter(l => l.count > 0)
                    .sort((a, b) => a.count - b.count)[0]?.letter || 'N/A'}
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Unused Letters</StatLabel>
                <StatValue>
                  {letterUsageData.filter(l => l.count === 0).length}
                </StatValue>
              </StatItem>
            </StatGrid>
          </StatsContainer>
        </HeatmapContainer>
      )}
      
      <LetterDetailList>
        <DetailListTitle>Letter Details</DetailListTitle>
        <DetailList>
          {letterUsageData
            .sort((a, b) => b.count - a.count)
            .map((letterData, index) => (
              <DetailItem key={index}>
                <DetailLetter style={{ backgroundColor: getHeatColor(letterData.heatLevel) }}>
                  {letterData.letter}
                </DetailLetter>
                <DetailInfo>
                  <DetailCount>Used {letterData.count} times</DetailCount>
                  <DetailPercent>
                    {letterData.totalWords > 0 
                      ? `${Math.round((letterData.count / letterData.totalWords) * 100)}% of words` 
                      : '0% of words'}
                  </DetailPercent>
                </DetailInfo>
              </DetailItem>
            ))}
        </DetailList>
      </LetterDetailList>
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
    padding-left: 24px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  margin: 0 0 16px 0;
  font-weight: 600;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background-color: ${({ $active }) => $active ? '#007bff' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#212529'};
  border: 1px solid ${({ $active }) => $active ? '#007bff' : '#dee2e6'};
  
  &:hover:not(:disabled) {
    background-color: ${({ $active }) => $active ? '#0069d9' : '#f8f9fa'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 2px;
`;

const LegendLabel = styled.div`
  white-space: nowrap;
  font-size: 8px;
  
  @media (min-width: 768px) {
    font-size: 10px;
  }
`;

const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
`;

const FlowerHeatmap = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 16px auto;
  
  @media (min-width: 768px) {
    margin: 0;
  }
`;

const CenterHex = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 92px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  z-index: 2;
`;

const InnerRing = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const OuterRing = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Hex = styled.div`
  position: absolute;
  width: 60px;
  height: 69px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  
  /* Position each hex of the inner ring */
  &:nth-child(1) { top: 20%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(2) { top: 35%; left: 76%; transform: translate(-50%, 0); }
  &:nth-child(3) { top: 65%; left: 76%; transform: translate(-50%, 0); }
  &:nth-child(4) { top: 80%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(5) { top: 65%; left: 24%; transform: translate(-50%, 0); }
  &:nth-child(6) { top: 35%; left: 24%; transform: translate(-50%, 0); }
`;

const OuterHex = styled.div`
  position: absolute;
  width: 50px;
  height: 58px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  
  /* Position each hex of the outer ring - 12 positions */
  &:nth-child(1) { top: 10%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(2) { top: 18%; left: 67%; transform: translate(-50%, 0); }
  &:nth-child(3) { top: 31%; left: 83%; transform: translate(-50%, 0); }
  &:nth-child(4) { top: 50%; left: 90%; transform: translate(-50%, 0); }
  &:nth-child(5) { top: 69%; left: 83%; transform: translate(-50%, 0); }
  &:nth-child(6) { top: 82%; left: 67%; transform: translate(-50%, 0); }
  &:nth-child(7) { top: 90%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(8) { top: 82%; left: 33%; transform: translate(-50%, 0); }
  &:nth-child(9) { top: 69%; left: 17%; transform: translate(-50%, 0); }
  &:nth-child(10) { top: 50%; left: 10%; transform: translate(-50%, 0); }
  &:nth-child(11) { top: 31%; left: 17%; transform: translate(-50%, 0); }
  &:nth-child(12) { top: 18%; left: 33%; transform: translate(-50%, 0); }
`;

const HexContent = styled.div<{ heatLevel: number }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Letter = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  &.small {
    font-size: 18px;
  }
`;

const Count = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  &.small {
    font-size: 10px;
  }
`;

const StatsContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  
  @media (min-width: 768px) {
    flex: 1;
  }
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

const LetterDetailList = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const DetailListTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 12px 0;
`;

const DetailList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DetailLetter = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin-right: 8px;
`;

const DetailInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailCount = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const DetailPercent = styled.div`
  font-size: 12px;
  color: #666;
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

const NotPlayedMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  text-align: center;
  color: #666;
  padding: 0 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
`;

export default LetterUsageHeatmap;