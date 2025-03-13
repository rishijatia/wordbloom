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

const ConnectionLine = styled.div<{ 
  $length: number; 
  $angle: number; 
  $active: boolean;
  $connectionType: 'center-inner' | 'inner-outer' | 'inner-inner' | 'outer-outer';
  $isSibling: boolean;
}>`
  position: absolute;
  height: ${props => props.$active ? '12px' : '3px'};
  width: ${props => props.$length}px;
  transform: rotate(${props => props.$angle}deg);
  transform-origin: 0 50%;
  
  /* Enhanced gradient colors for connections */
  background: ${props => {
    if (props.$active) {
      // Active connection styles based on connection type
      switch (props.$connectionType) {
        case 'center-inner': return 'linear-gradient(90deg, rgba(245, 185, 70, 0.9), rgba(245, 185, 70, 0.7))';
        case 'inner-outer': return 'linear-gradient(90deg, rgba(90, 190, 175, 0.9), rgba(90, 190, 175, 0.7))';
        case 'inner-inner': return 'linear-gradient(90deg, rgba(90, 190, 175, 0.9), rgba(90, 190, 175, 0.7))';
        case 'outer-outer': return 'linear-gradient(90deg, rgba(182, 164, 222, 0.9), rgba(182, 164, 222, 0.7))';
        default: return 'linear-gradient(90deg, rgba(90, 190, 175, 0.9), rgba(90, 190, 175, 0.7))';
      }
    } else {
      // Inactive connection styles - more visible but subtle
      return 'rgba(224, 224, 224, 0.3)';
    }
  }};
  
  border-radius: ${props => props.$active ? '6px' : '2px'};
  box-shadow: ${props => {
    if (props.$active) {
      // Custom glow color based on connection type
      switch (props.$connectionType) {
        case 'center-inner': return '0 0 10px rgba(245, 185, 70, 0.5)';
        case 'inner-outer': return '0 0 10px rgba(90, 190, 175, 0.5)';
        case 'inner-inner': return '0 0 10px rgba(90, 190, 175, 0.5)';
        case 'outer-outer': return '0 0 10px rgba(182, 164, 222, 0.5)';
        default: return '0 0 10px rgba(90, 190, 175, 0.5)';
      }
    } else {
      return 'none';
    }
  }};
  
  opacity: ${props => props.$active ? 1 : 0.5};
  transition: all 0.2s ease;
  
  /* Add animation for active connections */
  ${props => props.$active && `
    animation: connectionGrow 0.2s ease-out forwards;
  `}
  
  /* Add connection endpoint dot */
  &::after {
    content: '';
    display: ${props => props.$active ? 'block' : 'none'};
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => {
      switch (props.$connectionType) {
        case 'center-inner': return 'rgba(245, 185, 70, 0.9)';
        case 'inner-outer': return 'rgba(90, 190, 175, 0.9)';
        case 'inner-inner': return 'rgba(90, 190, 175, 0.9)';
        case 'outer-outer': return 'rgba(182, 164, 222, 0.9)';
        default: return 'rgba(90, 190, 175, 0.9)';
      }
    }};
    box-shadow: 0 0 8px ${props => {
      switch (props.$connectionType) {
        case 'center-inner': return 'rgba(245, 185, 70, 0.7)';
        case 'inner-outer': return 'rgba(90, 190, 175, 0.7)';
        case 'inner-inner': return 'rgba(90, 190, 175, 0.7)';
        case 'outer-outer': return 'rgba(182, 164, 222, 0.7)';
        default: return 'rgba(90, 190, 175, 0.7)';
      }
    }};
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