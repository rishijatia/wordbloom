import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { ChallengeScore } from '../../../models/Challenge';
import { getChallengeLeaderboard, getDeviceId } from '../../../services/challengeService';

interface WordUniquenessAnalysisProps {
  challengeId: string;
}

interface WordData {
  text: string;
  category: 'unique' | 'common' | 'missed';
  score: number;
  players: number;
  totalPlayers: number;
}

// Categories
const UNIQUE = 'unique'; // Words only you found
const COMMON = 'common'; // Words found by you and others
const MISSED = 'missed'; // Words you missed that others found

const WordUniquenessAnalysis: React.FC<WordUniquenessAnalysisProps> = ({ challengeId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [filter, setFilter] = useState<'all' | 'unique' | 'common' | 'missed'>('all');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'score' | 'popularity'>('score');
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const deviceId = getDeviceId();
  
  // Analyze words from all scores to generate word uniqueness data
  const generateWordUniquenessData = useCallback((scores: ChallengeScore[]): WordData[] => {
    if (scores.length === 0) return [];
    
    // Get current user's score
    const userScore = scores.find(score => score.deviceId === deviceId);
    const userWords = userScore?.foundWords || [];
    
    // Create a map of all words and how many players found them
    const wordMap = new Map<string, { count: number, score: number }>();
    
    scores.forEach(score => {
      score.foundWords.forEach(word => {
        const existing = wordMap.get(word) || { count: 0, score: 0 };
        wordMap.set(word, { 
          count: existing.count + 1,
          // Estimate score - in reality we'd have the actual score per word
          score: Math.max(existing.score, word.length > 3 ? word.length : 1)
        });
      });
    });
    
    // Categorize words
    const result: WordData[] = [];
    
    // Process all words
    for (const [word, data] of wordMap.entries()) {
      const isFoundByUser = userWords.includes(word);
      let category: 'unique' | 'common' | 'missed';
      
      if (isFoundByUser && data.count === 1) {
        category = UNIQUE; // Only found by you
      } else if (isFoundByUser) {
        category = COMMON; // Found by you and others
      } else {
        category = MISSED; // Not found by you but found by others
      }
      
      result.push({
        text: word,
        category,
        score: data.score,
        players: data.count,
        totalPlayers: scores.length
      });
    }
    
    return result;
  }, [deviceId]);
  
  // Apply filters
  const getFilteredWords = useCallback(() => {
    if (filter === 'all') return wordData;
    return wordData.filter(word => word.category === filter);
  }, [wordData, filter]);
  
  // Sort words
  const getSortedWords = useCallback(() => {
    const filtered = getFilteredWords();
    
    switch (sortBy) {
      case 'alphabetical':
        return [...filtered].sort((a, b) => a.text.localeCompare(b.text));
      case 'score':
        return [...filtered].sort((a, b) => b.score - a.score);
      case 'popularity':
        return [...filtered].sort((a, b) => b.players - a.players);
      default:
        return filtered;
    }
  }, [getFilteredWords, sortBy]);
  
  // Handle window resize for SVG
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const bounds = svgRef.current.getBoundingClientRect();
        setSvgDimensions({ 
          width: bounds.width, 
          height: Math.min(bounds.width * 0.6, 400) 
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Create a refresh function
  const refreshData = async () => {
    setLoading(true);
    try {
      const scores = await getChallengeLeaderboard(challengeId);
      const words = generateWordUniquenessData(scores);
      setWordData(words);
      
      // Mark as played in session storage when refreshing after playing
      const sessionStorageKey = `played_challenge_${challengeId}`;
      const currentPlayerScore = scores.find(score => score.deviceId === deviceId);
      if (currentPlayerScore && currentPlayerScore.foundWords.length > 0) {
        sessionStorage.setItem(sessionStorageKey, 'true');
      }
    } catch (err) {
      console.error('Error refreshing word data:', err);
      setError('Failed to refresh word analysis');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch word data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const scores = await getChallengeLeaderboard(challengeId);
        const words = generateWordUniquenessData(scores);
        setWordData(words);
        
        // If there's evidence the user has played, store it in session storage
        const userScore = scores.find(score => score.deviceId === deviceId);
        const sessionStorageKey = `played_challenge_${challengeId}`;
        if (userScore && userScore.foundWords.length > 0) {
          console.log("Setting played flag in session storage");
          sessionStorage.setItem(sessionStorageKey, 'true');
        }
      } catch (err) {
        console.error('Error fetching word data:', err);
        setError('Failed to load word analysis');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [challengeId, generateWordUniquenessData, deviceId]);
  
  // Calculate stats
  const stats = {
    uniqueCount: wordData.filter(w => w.category === UNIQUE).length,
    commonCount: wordData.filter(w => w.category === COMMON).length,
    missedCount: wordData.filter(w => w.category === MISSED).length,
    totalCount: wordData.length
  };
  
  if (loading) {
    return <LoadingState>Loading word analysis...</LoadingState>;
  }
  
  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }
  
  if (wordData.length === 0) {
    return <EmptyState>No word data available. Play the challenge to see word analysis!</EmptyState>;
  }
  
  // Check if user has played this challenge
  // First using standard logic - did they find any words?
  let hasPlayed = stats.uniqueCount > 0 || stats.commonCount > 0;
  
  // Add session storage backup for when firestore data might be slow to load
  const sessionStorageKey = `played_challenge_${challengeId}`;
  if (!hasPlayed && sessionStorage.getItem(sessionStorageKey) === 'true') {
    hasPlayed = true;
  }
  
  // Log diagnostic information
  console.log("Word Analysis - Has played?", hasPlayed, "Device ID:", deviceId);
  console.log("Unique words:", stats.uniqueCount, "Common words:", stats.commonCount);

  // Check if user has played this challenge - show locked view  
  if (!hasPlayed) {
    return (
      <Container>
        <TitleRow>
          <Title>Word Analysis</Title>
          <RefreshButton onClick={refreshData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Data'}
          </RefreshButton>
        </TitleRow>
        
        <LockedContainer>
          <LockIcon>🔒</LockIcon>
          <LockedMessage>
            You need to play this challenge to see the word analysis.
          </LockedMessage>
          <LockedSubMessage>
            Play the challenge to unlock this analysis and see how your word findings compare to other players.
          </LockedSubMessage>
        </LockedContainer>
      </Container>
    );
  }

  return (
    <Container>
      <TitleRow>
        <Title>Word Analysis</Title>
        <RefreshButton onClick={refreshData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </RefreshButton>
      </TitleRow>
      
      <VisualizationContainer>
        <SVGContainer ref={svgRef as any}>
          <svg width="100%" height="100%" viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}>
            {/* Venn diagram-like visualization */}
            <VennDiagram 
              width={svgDimensions.width} 
              height={svgDimensions.height} 
              stats={stats}
            />
          </svg>
          <LegendContainer>
            <LegendItem color="#4CAF50">
              <span>Words only you found ({stats.uniqueCount})</span>
            </LegendItem>
            <LegendItem color="#2196F3">
              <span>Words you & others found ({stats.commonCount})</span>
            </LegendItem>
            <LegendItem color="#F44336">
              <span>Words you missed ({stats.missedCount})</span>
            </LegendItem>
          </LegendContainer>
        </SVGContainer>
      </VisualizationContainer>
      
      <ControlsContainer>
        <FilterControls>
          <FilterButton 
            $active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All Words
          </FilterButton>
          <FilterButton 
            $active={filter === 'unique'} 
            onClick={() => setFilter('unique')}
            $color="#4CAF50"
          >
            Unique
          </FilterButton>
          <FilterButton 
            $active={filter === 'common'} 
            onClick={() => setFilter('common')}
            $color="#2196F3"
          >
            Common
          </FilterButton>
          <FilterButton 
            $active={filter === 'missed'} 
            onClick={() => setFilter('missed')}
            $color="#F44336"
          >
            Missed
          </FilterButton>
        </FilterControls>
        
        <SortControls>
          <SortLabel>Sort by:</SortLabel>
          <SortSelect 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="alphabetical">A-Z</option>
            <option value="score">Score</option>
            <option value="popularity">Popularity</option>
          </SortSelect>
        </SortControls>
      </ControlsContainer>
      
      <WordList>
        {getSortedWords().map((word, index) => (
          <WordItem 
            key={`${word.text}-${index}`}
            category={word.category}
          >
            <WordText>{word.text}</WordText>
            <WordDetails>
              <WordScore>Score: {word.score}</WordScore>
              <WordPopularity>
                {word.players} / {word.totalPlayers} players
              </WordPopularity>
            </WordDetails>
          </WordItem>
        ))}
      </WordList>
    </Container>
  );
};

// Venn Diagram Component
interface VennDiagramProps {
  width: number;
  height: number;
  stats: {
    uniqueCount: number;
    commonCount: number;
    missedCount: number;
    totalCount: number;
  };
}

const VennDiagram: React.FC<VennDiagramProps> = ({ width, height, stats }) => {
  // Skip rendering if dimensions are invalid
  if (width <= 0 || height <= 0) return null;
  
  // Calculate circle sizes based on word counts
  const total = Math.max(1, stats.totalCount);
  
  // Adjust circle sizes based on counts but maintain minimum sizes for visual appeal
  const minRadius = 60;
  const maxRadiusAdjustment = 50;
  
  const uniqueRadius = minRadius + (stats.uniqueCount / total) * maxRadiusAdjustment;
  const commonRadius = minRadius + (stats.commonCount / total) * maxRadiusAdjustment;
  const missedRadius = minRadius + (stats.missedCount / total) * maxRadiusAdjustment;
  
  // Position circles with better spacing
  const centerY = height / 2;
  const uniqueX = width * 0.3;
  const commonX = width * 0.5;
  const missedX = width * 0.7;
  
  return (
    <g>
      {/* Add background rectangle for better visibility */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#f8f9fa"
        rx={8}
        ry={8}
      />
      
      {/* Unique words circle - green */}
      <circle 
        cx={uniqueX} 
        cy={centerY} 
        r={uniqueRadius} 
        fill="rgba(76, 175, 80, 0.7)" 
        stroke="rgba(76, 175, 80, 0.9)"
        strokeWidth={2}
      />
      <text 
        x={uniqueX} 
        y={centerY} 
        textAnchor="middle" 
        dominantBaseline="middle"
        fill="white"
        fontWeight="bold"
        fontSize={uniqueRadius > 70 ? "24px" : "20px"}
      >
        {stats.uniqueCount}
      </text>
      
      {/* Common words circle - blue */}
      <circle 
        cx={commonX} 
        cy={centerY} 
        r={commonRadius} 
        fill="rgba(33, 150, 243, 0.7)" 
        stroke="rgba(33, 150, 243, 0.9)"
        strokeWidth={2}
      />
      <text 
        x={commonX} 
        y={centerY} 
        textAnchor="middle" 
        dominantBaseline="middle"
        fill="white"
        fontWeight="bold"
        fontSize={commonRadius > 70 ? "24px" : "20px"}
      >
        {stats.commonCount}
      </text>
      
      {/* Missed words circle - red */}
      <circle 
        cx={missedX} 
        cy={centerY} 
        r={missedRadius} 
        fill="rgba(244, 67, 54, 0.7)" 
        stroke="rgba(244, 67, 54, 0.9)"
        strokeWidth={2}
      />
      <text 
        x={missedX} 
        y={centerY} 
        textAnchor="middle" 
        dominantBaseline="middle"
        fill="white"
        fontWeight="bold"
        fontSize={missedRadius > 70 ? "24px" : "20px"}
      >
        {stats.missedCount}
      </text>
      
      {/* Enhanced labels with background for better visibility */}
      <rect
        x={uniqueX - 50}
        y={centerY + uniqueRadius + 5}
        width={100}
        height={20}
        fill="rgba(255, 255, 255, 0.7)"
        rx={4}
        ry={4}
      />
      <text 
        x={uniqueX} 
        y={centerY + uniqueRadius + 17} 
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#4CAF50"
      >
        Your Unique Words
      </text>
      
      <rect
        x={commonX - 45}
        y={centerY + commonRadius + 5}
        width={90}
        height={20}
        fill="rgba(255, 255, 255, 0.7)"
        rx={4}
        ry={4}
      />
      <text 
        x={commonX} 
        y={centerY + commonRadius + 17} 
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#2196F3"
      >
        Common Words
      </text>
      
      <rect
        x={missedX - 45}
        y={centerY + missedRadius + 5}
        width={90}
        height={20}
        fill="rgba(255, 255, 255, 0.7)"
        rx={4}
        ry={4}
      />
      <text 
        x={missedX} 
        y={centerY + missedRadius + 17} 
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#F44336"
      >
        Missed Words
      </text>
    </g>
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

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 20px;
  margin: 0;
  font-weight: 600;
`;

const RefreshButton = styled.button`
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #e9ecef;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VisualizationContainer = styled.div`
  margin-bottom: 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  height: 300px;
  
  @media (min-width: 768px) {
    height: 400px;
  }
`;

const SVGContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    left: auto;
    right: 16px;
    transform: none;
  }
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  
  &:before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    background-color: ${({ color }) => color};
    margin-right: 6px;
    border-radius: 2px;
  }
  
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  
  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const FilterButton = styled.button<{ $active: boolean, $color?: string }>`
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  background-color: ${({ $active, $color }) => 
    $active ? ($color || '#007bff') : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#212529'};
  border: 1px solid ${({ $color, $active }) => 
    $active ? ($color || '#007bff') : '#dee2e6'};
  
  &:hover {
    background-color: ${({ $active, $color }) => 
      $active ? ($color || '#007bff') : '#f8f9fa'};
  }
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SortLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const SortSelect = styled.select`
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 14px;
`;

const WordList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
`;

const WordItem = styled.div<{ category: string }>`
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 8px;
  transition: transform 0.2s ease;
  
  background-color: ${({ category }) => {
    switch (category) {
      case UNIQUE: return 'rgba(76, 175, 80, 0.1)';
      case COMMON: return 'rgba(33, 150, 243, 0.1)';
      case MISSED: return 'rgba(244, 67, 54, 0.1)';
      default: return 'white';
    }
  }};
  
  border-left: 4px solid ${({ category }) => {
    switch (category) {
      case UNIQUE: return '#4CAF50';
      case COMMON: return '#2196F3';
      case MISSED: return '#F44336';
      default: return '#ccc';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const WordText = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const WordDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const WordScore = styled.div``;

const WordPopularity = styled.div``;

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

const NotPlayedMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #666;
  padding: 0 24px;
`;

const LockedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 40px 24px;
  border-radius: 12px;
  text-align: center;
  border: 1px dashed #dee2e6;
  margin: 20px 0;
  min-height: 300px;
`;

const LockIcon = styled.div`
  font-size: 48px;
  margin-bottom: 24px;
  color: #6c757d;
  opacity: 0.8;
`;

const LockedMessage = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
`;

const LockedSubMessage = styled.div`
  font-size: 16px;
  color: #6c757d;
  max-width: 450px;
`;

export default WordUniquenessAnalysis;