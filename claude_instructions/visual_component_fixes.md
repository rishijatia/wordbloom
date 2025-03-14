/**
 * WordBloom Visual Component Fixes
 * 
 * This document provides solutions for the issues observed in the screenshots:
 * 1. Hexagonal Grid Overlap Issue
 * 2. Word Analysis Visualization Improvement
 * 3. Wordle-Style Layout Implementation
 */

// ==============================
// 1. Hexagonal Grid Overlap Fix
// ==============================

// The issue is in the positioning of hexagons in the LetterUsageHeatmap.tsx component
// Here's the fix for the overlapping hexagons:

// In LetterUsageHeatmap.tsx, update the styled components for the hex positioning:

const OuterHex = styled.div`
  position: absolute;
  width: 50px;
  height: 58px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  
  /* Position each hex of the outer ring - 12 positions with adjusted coordinates and spacing */
  &:nth-child(1) { top: 10%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(2) { top: 18%; left: 67%; transform: translate(-50%, 0); }
  &:nth-child(3) { top: 30%; left: 82%; transform: translate(-50%, 0); }
  &:nth-child(4) { top: 50%; left: 88%; transform: translate(-50%, 0); }
  &:nth-child(5) { top: 70%; left: 82%; transform: translate(-50%, 0); }
  &:nth-child(6) { top: 82%; left: 67%; transform: translate(-50%, 0); }
  &:nth-child(7) { top: 90%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(8) { top: 82%; left: 33%; transform: translate(-50%, 0); }
  &:nth-child(9) { top: 70%; left: 18%; transform: translate(-50%, 0); }
  &:nth-child(10) { top: 50%; left: 12%; transform: translate(-50%, 0); }
  &:nth-child(11) { top: 30%; left: 18%; transform: translate(-50%, 0); }
  &:nth-child(12) { top: 18%; left: 33%; transform: translate(-50%, 0); }
`;

// Also make similar adjustments to the inner ring for consistency:

const Hex = styled.div`
  position: absolute;
  width: 60px;
  height: 69px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  
  /* Position each hex of the inner ring with more even spacing */
  &:nth-child(1) { top: 20%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(2) { top: 34%; left: 75%; transform: translate(-50%, 0); }
  &:nth-child(3) { top: 66%; left: 75%; transform: translate(-50%, 0); }
  &:nth-child(4) { top: 80%; left: 50%; transform: translate(-50%, 0); }
  &:nth-child(5) { top: 66%; left: 25%; transform: translate(-50%, 0); }
  &:nth-child(6) { top: 34%; left: 25%; transform: translate(-50%, 0); }
`;

// ==============================
// 2. Word Analysis Visualization
// ==============================

// The issue with the Word Analysis visualization is that it's not visually engaging enough
// Here's a more appealing implementation for the VennDiagram component:

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

// Also update the LegendContainer for better placement and visibility:

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

// ==============================
// 3. Wordle-Style Layout Implementation
// ==============================

// For the Wordle-style layout, create a new component that displays letters in a grid format:

// Create a new file: src/components/WordleStyleGrid.tsx

import React from 'react';
import styled from 'styled-components';
import { LetterArrangement } from '../models/LetterArrangement';

interface WordleStyleGridProps {
  letterArrangement: LetterArrangement;
}

const WordleStyleGrid: React.FC<WordleStyleGridProps> = ({ letterArrangement }) => {
  // Destructure the letter arrangement
  const { center, innerRing, outerRing } = letterArrangement;
  
  // Organize letters into rows for a Wordle-like layout
  const rows = [
    // Top row - first 4 letters from outer ring
    outerRing.slice(0, 4),
    
    // Middle row - next 3 letters from inner ring
    innerRing.slice(0, 3),
    
    // Bottom row - just the center letter
    [center]
  ];
  
  return (
    <GridContainer>
      {rows.map((row, rowIndex) => (
        <Row key={`row-${rowIndex}`}>
          {row.map((letter, letterIndex) => (
            <LetterTile 
              key={`tile-${rowIndex}-${letterIndex}`}
              $isCenter={rowIndex === 2 && letterIndex === 0}
            >
              {letter}
            </LetterTile>
          ))}
        </Row>
      ))}
    </GridContainer>
  );
};

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const LetterTile = styled.div<{ $isCenter: boolean }>`
  width: 50px;
  height: 50px;
  background-color: ${props => props.$isCenter ? '#4CAF50' : '#f5f5f5'};
  color: ${props => props.$isCenter ? 'white' : 'black'};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export default WordleStyleGrid;

// You can use this component in your application where needed.
// For example, you could add it to the ChallengeDetailScreen.tsx or create a new preview component.

// For implementation in the WordleStyleGrid in your share screen:
// Use the component like this:

<WordleSharePreview>
  <WordleStyleGrid letterArrangement={letterArrangement} />
  <ChallengeInfo>
    <CodeDisplay>Challenge Code: {challengeCode}</CodeDisplay>
    <PlayerInfo>Created by {creatorName}</PlayerInfo>
  </ChallengeInfo>
</WordleSharePreview>