import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface ConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
  tier1?: number;
  tier2?: number;
}

// Use $-prefixed props to prevent them from being passed to the DOM
const ConnectionContainer = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: ${props => props.$active ? 2 : 1};
`;

// Use $-prefixed props to prevent them from being passed to the DOM
const ConnectionLine = styled.div<{ 
  $length: number; 
  $angle: number; 
  $active: boolean;
  $connectionType: 'center-inner' | 'inner-outer' | 'inner-inner' | 'outer-outer';
  $isSibling: boolean;
}>`
  position: absolute;
  height: ${props => props.$active ? '16px' : '4px'};
  width: ${props => props.$length}px;
  transform: rotate(${props => props.$angle}deg);
  transform-origin: 0 50%;
  background-color: ${props => {
    if (props.$active) {
      if (props.$isSibling) {
        // For active sibling connections, use the same color as non-sibling connections
        switch (props.$connectionType) {
          case 'inner-inner': return 'rgba(91, 143, 249, 0.9)';
          case 'outer-outer': return 'rgba(76, 175, 80, 0.9)';
          default: return 'rgba(52, 152, 219, 0.9)';
        }
      }
      // Active connection styles based on connection type
      switch (props.$connectionType) {
        case 'center-inner': return 'rgba(246, 185, 59, 0.9)';
        case 'inner-outer': return 'rgba(52, 152, 219, 0.9)';
        case 'inner-inner': return 'rgba(91, 143, 249, 0.9)';
        case 'outer-outer': return 'rgba(76, 175, 80, 0.9)';
        default: return 'rgba(52, 152, 219, 0.9)';
      }
    } else {
      if (props.$isSibling) {
        // For inactive sibling connections, use the same color as non-sibling connections
        switch (props.$connectionType) {
          case 'inner-inner': return 'rgba(91, 143, 249, 0.15)';
          case 'outer-outer': return 'rgba(76, 175, 80, 0.15)';
          default: return 'rgba(52, 152, 219, 0.15)';
        }
      }
      // Inactive connection styles - more visible but subtle
      switch (props.$connectionType) {
        case 'center-inner': return 'rgba(246, 185, 59, 0.15)';
        case 'inner-outer': return 'rgba(52, 152, 219, 0.15)';
        case 'inner-inner': return 'rgba(91, 143, 249, 0.15)';
        case 'outer-outer': return 'rgba(76, 175, 80, 0.15)';
        default: return 'rgba(52, 152, 219, 0.15)';
      }
    }
  }};
  border-radius: ${props => props.$active ? '8px' : '4px'};
  border-style: ${props => 'none'};
  border-width: ${props => props.$isSibling ? (props.$active ? '8px' : '2px') : '0'};
  border-color: ${props => {
    if (props.$isSibling) {
      switch (props.$connectionType) {
        case 'inner-inner': return props.$active ? 'rgba(91, 143, 249, 0.9)' : 'rgba(91, 143, 249, 0.15)';
        case 'outer-outer': return props.$active ? 'rgba(76, 175, 80, 0.9)' : 'rgba(76, 175, 80, 0.15)';
        default: return props.$active ? 'rgba(52, 152, 219, 0.9)' : 'rgba(52, 152, 219, 0.15)';
      }
    }
    return 'transparent';
  }};
  box-shadow: ${props => {
    if (props.$active) {
      // Custom glow color based on connection type
      switch (props.$connectionType) {
        case 'center-inner': return '0 0 10px rgba(246, 185, 59, 0.8), 0 0 20px rgba(246, 185, 59, 0.4)';
        case 'inner-outer': return '0 0 10px rgba(52, 152, 219, 0.8), 0 0 20px rgba(52, 152, 219, 0.4)';
        case 'inner-inner': return '0 0 10px rgba(91, 143, 249, 0.8), 0 0 20px rgba(91, 143, 249, 0.4)';
        case 'outer-outer': return '0 0 10px rgba(76, 175, 80, 0.8), 0 0 20px rgba(76, 175, 80, 0.4)';
        default: return '0 0 10px rgba(52, 152, 219, 0.8), 0 0 20px rgba(52, 152, 219, 0.4)';
      }
    } else {
      return 'none';
    }
  }};
  opacity: ${props => props.$active ? 1 : 0.7};
  transition: all 0.2s ease;
  
  ${props => props.$active && `
    animation: pulse-${props.$connectionType} 1.5s infinite alternate;
    
    @keyframes pulse-center-inner {
      0% {
        box-shadow: 0 0 10px rgba(246, 185, 59, 0.8), 0 0 20px rgba(246, 185, 59, 0.4);
      }
      100% {
        box-shadow: 0 0 15px rgba(246, 185, 59, 0.9), 0 0 30px rgba(246, 185, 59, 0.6);
      }
    }
    
    @keyframes pulse-inner-outer {
      0% {
        box-shadow: 0 0 10px rgba(52, 152, 219, 0.8), 0 0 20px rgba(52, 152, 219, 0.4);
      }
      100% {
        box-shadow: 0 0 15px rgba(52, 152, 219, 0.9), 0 0 30px rgba(52, 152, 219, 0.6);
      }
    }
    
    @keyframes pulse-inner-inner {
      0% {
        box-shadow: 0 0 10px rgba(91, 143, 249, 0.8), 0 0 20px rgba(91, 143, 249, 0.4);
      }
      100% {
        box-shadow: 0 0 15px rgba(91, 143, 249, 0.9), 0 0 30px rgba(91, 143, 249, 0.6);
      }
    }
    
    @keyframes pulse-outer-outer {
      0% {
        box-shadow: 0 0 10px rgba(76, 175, 80, 0.8), 0 0 20px rgba(76, 175, 80, 0.4);
      }
      100% {
        box-shadow: 0 0 15px rgba(76, 175, 80, 0.9), 0 0 30px rgba(76, 175, 80, 0.6);
      }
    }
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: ${props => props.$active ? '-8px' : '-6px'};
    left: ${props => props.$active ? '-8px' : '-6px'};
    width: ${props => props.$active ? '32px' : '16px'};
    height: ${props => props.$active ? '32px' : '16px'};
    border-radius: 50%;
    background-color: ${props => {
      if (props.$active) {
        switch (props.$connectionType) {
          case 'center-inner': return 'rgba(246, 185, 59, 0.9)';
          case 'inner-outer': return 'rgba(52, 152, 219, 0.9)';
          case 'inner-inner': return 'rgba(91, 143, 249, 0.9)';
          case 'outer-outer': return 'rgba(76, 175, 80, 0.9)';
          default: return 'rgba(52, 152, 219, 0.9)';
        }
      } else {
        return 'transparent';
      }
    }};
    box-shadow: ${props => props.$active ? '0 0 16px rgba(255, 255, 255, 0.8)' : 'none'};
    display: ${props => props.$active ? 'block' : 'none'};
  }
`;

const Connection: React.FC<ConnectionProps> = ({ x1, y1, x2, y2, isActive, tier1 = 0, tier2 = 0 }) => {
  const [lineProps, setLineProps] = useState({ length: 0, angle: 0 });
  
  // Determine the type of connection based on the tiers
  const getConnectionType = (): 'center-inner' | 'inner-outer' | 'inner-inner' | 'outer-outer' => {
    if (tier1 === 1 || tier2 === 1) {
      return 'center-inner';
    } else if ((tier1 === 2 && tier2 === 3) || (tier1 === 3 && tier2 === 2)) {
      return 'inner-outer';
    } else if (tier1 === 2 && tier2 === 2) {
      return 'inner-inner';
    } else if (tier1 === 3 && tier2 === 3) {
      return 'outer-outer';
    }
    return 'inner-outer'; // Default
  };
  
  // Determine if this is a sibling connection (same tier)
  const isSibling = tier1 === tier2 && tier1 !== 1; // Tier 1 only has one petal, so no siblings
  
  useEffect(() => {
    // Calculate length and angle of the connection
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    setLineProps({ length, angle });
  }, [x1, y1, x2, y2]);
  
  return (
    <ConnectionContainer $active={isActive}>
      <ConnectionLine 
        $length={lineProps.length}
        $angle={lineProps.angle}
        $active={isActive}
        $connectionType={getConnectionType()}
        $isSibling={isSibling}
        style={{ left: `${x1}px`, top: `${y1}px` }}
      />
    </ConnectionContainer>
  );
};

export default Connection; 