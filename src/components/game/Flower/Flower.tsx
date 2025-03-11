import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../../contexts/GameContext';
import { PetalState, PetalTier } from '../../../models/Petal';
import { calculateFlowerLayout } from '../../../utils/layout';
import { arePetalsAdjacent } from '../../../utils/adjacency';
import Petal from '../Petal/Petal';

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FlowerContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: visible;
  background-color: transparent;
  border-radius: 50%;
  touch-action: none;
  margin: 0 auto;
  max-width: 500px;
  
  @media (max-width: 768px) {
    width: 85vw;
    height: 85vw;
    padding-bottom: 85vw;
    max-width: none;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
  }
`;

const FoundWordsSection = styled.div`
  display: none; /* Hide this section as it's duplicated in GameScreen */
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const FoundWordsHeader = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 3px;
  }
`;

const FoundWordsDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  padding: 0 10px;

  @media (max-width: 768px) {
    gap: 6px;
    padding: 0 5px;
  }
`;

const WordChip = styled.div`
  padding: 4px 12px;
  background-color: #f8f9fa;
  border-radius: 16px;
  font-size: 0.9rem;
  color: #495057;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 3px 10px;
    font-size: 0.85rem;
  }
`;

const Flower: React.FC = () => {
  const { state, selectPetal, resetSelection, submitWord } = useGameContext();
  const { letterArrangement, selectedPetals, gameStatus, foundWords, score, timeRemaining, currentWord } = state;
  
  const [petals, setPetals] = useState<PetalState[]>([]);
  const [hoveredPetal, setHoveredPetal] = useState<{ tier: PetalTier; index: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const updateRequiredRef = useRef<boolean>(false);
  const isDraggingRef = useRef(false);
  
  // Calculate timer progress percentage
  const timerProgress = (timeRemaining / 120) * 100; // Assuming GAME_TIME is 120 seconds
  
  // Get potential next petals for keyboard input
  const getPotentialNextPetals = useCallback((): PetalState[] => {
    if (selectedPetals.length === 0) return petals;
    
    const lastSelected = selectedPetals[selectedPetals.length - 1];
    const nextPetals = petals.filter(petal => 
      arePetalsAdjacent(lastSelected, petal, letterArrangement)
    );
    
    return nextPetals;
  }, [selectedPetals, petals, letterArrangement]);

  const potentialNextPetals = getPotentialNextPetals();

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameStatus !== 'playing') return;

    if (event.key === 'Escape') {
      resetSelection();
      return;
    }

    if (event.key === 'Backspace') {
      if (selectedPetals.length > 0) {
        resetSelection();
      }
      return;
    }

    if (event.key === 'Enter') {
      if (currentWord.length >= 3) {
        submitWord();
      }
      return;
    }

    // Handle letter keys
    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
    const letter = event.key.toUpperCase();
    
    // Find all petals with matching letter
    const matchingPetals = petals.filter(petal => 
    petal.letter.toUpperCase() === letter
    );

    if (matchingPetals.length > 0) {
      // If this is first selection, use the first matching petal
    if (selectedPetals.length === 0) {
        selectPetal(matchingPetals[0]);
            return;
      }
      
    // For subsequent selections, check adjacency
    const lastSelected = selectedPetals[selectedPetals.length - 1];
    
    // Check all matching petals for adjacency
    for (const matchingPetal of matchingPetals) {
    if (arePetalsAdjacent(lastSelected, matchingPetal, letterArrangement)) {
      selectPetal(matchingPetal);
    return;
    }
    }
    }
    }
  }, [gameStatus, selectedPetals, currentWord, petals, potentialNextPetals, resetSelection, submitWord, selectPetal, letterArrangement]);

  // Focus management
  useEffect(() => {
    if (gameStatus === 'playing' && containerRef.current) {
      containerRef.current.focus();
    }
  }, [gameStatus]);

  // Keyboard event listeners
  useEffect(() => {
    if (gameStatus === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [gameStatus, handleKeyDown]);

  // Show keyboard help when focused via keyboard
  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    // Check if focus was gained via keyboard (not mouse)
    if (!event.relatedTarget) {
      setShowKeyboardHelp(true);
    }
  };

  const handleBlur = () => {
    setShowKeyboardHelp(false);
  };
  
  // Calculate flower layout when container size or letter arrangement changes
  useEffect(() => {
    if (!containerRef.current || !letterArrangement.center) return;
    
    const updateLayout = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Get container dimensions
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      
      // Calculate positions and connections for layout
      const { positions, connections: connectionPairs } = calculateFlowerLayout(
        containerWidth, 
        containerHeight, 
        letterArrangement
      );
      
      // Build petals
      const newPetals: PetalState[] = [];
      
      // Center petal (Tier 1)
      newPetals.push({
        letter: letterArrangement.center,
        tier: 1,
        index: 0,
        position: positions[0],
        isSelected: false,
        isHighlighted: false,
        isNeighbor: false
      });
      
      // Inner ring petals (Tier 2)
      letterArrangement.innerRing.forEach((letter, i) => {
        newPetals.push({
          letter,
          tier: 2,
          index: i,
          position: positions[i + 1],
          isSelected: false,
          isHighlighted: false,
          isNeighbor: false
        });
      });
      
      // Outer ring petals (Tier 3)
      letterArrangement.outerRing.forEach((letter, i) => {
        newPetals.push({
          letter,
          tier: 3,
          index: i,
          position: positions[i + letterArrangement.innerRing.length + 1],
          isSelected: false,
          isHighlighted: false,
          isNeighbor: false
        });
      });
      
      // Debug check for petal counts
      console.log(`Tier 1: ${newPetals.filter(p => p.tier === 1).length}`);
      console.log(`Tier 2: ${newPetals.filter(p => p.tier === 2).length}`);
      console.log(`Tier 3: ${newPetals.filter(p => p.tier === 3).length}`);
      console.log(`Letter Arrangement - Outer Ring Length: ${letterArrangement.outerRing.length}`);
      console.log(`Number of positions: ${positions.length}`);
      console.log(`Outer positions start at index: ${letterArrangement.innerRing.length + 1}`);
      
      // Set petals state
      setPetals(newPetals);
    };
    
    // Initial layout calculation
    updateLayout();
    
    // Update layout on window resize
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [letterArrangement]);
  
  // Update petal states when selection or hover changes
  useEffect(() => {
    if (petals.length === 0) return;
    
    // Create a new array to avoid mutating the original
    const updatedPetals = [...petals];
    
    // Update each petal's state
    for (let i = 0; i < updatedPetals.length; i++) {
      const petal = updatedPetals[i];
      
      // Check if this petal is selected
      const isSelected = selectedPetals.some(
        sp => sp.tier === petal.tier && sp.index === petal.index
      );
      
      // Check if this petal is highlighted (hovered)
      const isHighlighted = hoveredPetal 
        ? hoveredPetal.tier === petal.tier && hoveredPetal.index === petal.index
        : false;
      
      // For neighbors, check adjacency with the last selected petal
      let isNeighbor = false;
      if (selectedPetals.length > 0 && !isSelected) {
        const lastSelected = selectedPetals[selectedPetals.length - 1];
        isNeighbor = arePetalsAdjacent(lastSelected, petal, letterArrangement);
      }
      
      // Only update if the state has changed
      if (petal.isSelected !== isSelected || 
          petal.isHighlighted !== isHighlighted || 
          petal.isNeighbor !== isNeighbor) {
        updatedPetals[i] = {
          ...petal,
          isSelected,
          isHighlighted,
          isNeighbor
        };
      }
    }
    
    // Only update state if something changed
    const petalsChanged = updatedPetals.some((p, i) => 
      p.isSelected !== petals[i].isSelected || 
      p.isHighlighted !== petals[i].isHighlighted || 
      p.isNeighbor !== petals[i].isNeighbor
    );
    
    if (petalsChanged) {
      setPetals(updatedPetals);
    }
  }, [selectedPetals, hoveredPetal, letterArrangement]);
  
  // Process petal at point (touch/mouse)
  const processPetalAtPoint = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || gameStatus !== 'playing') return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Convert x and y to percentages
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Find petals near the pointer, sorted by distance
    const nearbyPetals = petals
      .map(petal => {
        const distance = Math.sqrt(
          Math.pow(xPercent - petal.position.x, 2) + 
          Math.pow(yPercent - petal.position.y, 2)
        );
        return { petal, distance };
      })
      .filter(({ distance, petal }) => {
        // Get petal radius based on tier
        let radiusPercent;
        switch (petal.tier) {
          case 1: radiusPercent = 11; break; // Center hex
          case 2: radiusPercent = 8; break; // Inner ring
          case 3: radiusPercent = 7; break; // Outer ring - increased detection radius
          default: radiusPercent = 7;
        }
        return distance <= radiusPercent; // More strict distance for selection
      })
      .sort((a, b) => a.distance - b.distance);
    
    if (nearbyPetals.length === 0) return;
    
    // If this is the first selection, use the closest petal
    if (selectedPetals.length === 0) {
      selectPetal(nearbyPetals[0].petal);
      return;
    }
    
    // For subsequent selections
    const lastSelected = selectedPetals[selectedPetals.length - 1];
    
    // Try all nearby petals to find an adjacent one
    for (const { petal } of nearbyPetals) {
      if (arePetalsAdjacent(lastSelected, petal, letterArrangement)) {
        selectPetal(petal);
        return;
      }
    }
  }, [containerRef, gameStatus, petals, selectedPetals, letterArrangement, selectPetal]);
  
  // Update handleMouseMove to use isDraggingRef
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // Prevent default to avoid text selection during drag
    event.preventDefault();
    event.stopPropagation();
    
    // Process the petal at the current mouse position
    processPetalAtPoint(event.clientX, event.clientY);
  }, [processPetalAtPoint]);
  
  // Handle mouse down to start dragging
  const handleMouseDown = (event: React.MouseEvent) => {
    if (gameStatus !== 'playing') return;
    
    // Prevent default to avoid text selection during drag
    event.preventDefault();
    event.stopPropagation();
    
    // Reset previous selection
    resetSelection();
    
    // Set dragging state immediately
    setIsDragging(true);
    
    // Process the petal at initial click position
    processPetalAtPoint(event.clientX, event.clientY);
    
    // Add document-level event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mouse up to end drag
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (isDragging) {
      // Prevent default to avoid text selection during drag
      event.preventDefault();
      event.stopPropagation();
      
      setIsDragging(false);
      
      // Remove document-level event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Automatic submit/reset logic
      if (state.currentWord.length >= 3) {
        submitWord();
      } else {
        resetSelection();
      }
    }
  }, [isDragging, state.currentWord.length, submitWord, resetSelection]);
  
  // Update handleTouchMove to use isDraggingRef
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    // Prevent default to stop page scrolling during the drag
    event.preventDefault();
    
    // Process touch position
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      processPetalAtPoint(touch.clientX, touch.clientY);
    }
  }, [processPetalAtPoint]);
  
  // Touch event handlers for mobile support
  const handleTouchStart = (event: React.TouchEvent) => {
    if (gameStatus !== 'playing') return;
    
    // Reset previous selection
    resetSelection();
    
    // Set dragging state
    setIsDragging(true);
    
    // Process the first touch
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      processPetalAtPoint(touch.clientX, touch.clientY);
    }
  };
  
  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Automatic submit/reset logic
      if (state.currentWord.length >= 3) {
        submitWord();
      } else {
        resetSelection();
      }
    }
  };
  
  // Handle petal hover
  const handlePetalMouseEnter = (tier: PetalTier, index: number) => {
    if (gameStatus !== 'playing') return;
    
    // Only set hover state if we're not dragging
    if (!isDragging) {
      setHoveredPetal({ tier, index });
    }
  };
  
  // Handle petal hover end
  const handlePetalMouseLeave = () => {
    if (gameStatus !== 'playing') return;
    
    // Only clear hover state if we're not dragging
    if (!isDragging) {
      setHoveredPetal(null);
    }
  };
  
  // Convert relative position (0-100%) to absolute pixels
  const positionToPixels = (position: { x: number; y: number }) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (position.x / 100) * rect.width;
    const y = (position.y / 100) * rect.height;
    
    return { x, y };
  };
  
  // Cleanup event listeners when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // Add useEffect to set up non-passive touch event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const touchMoveHandler = (event: TouchEvent) => {
      if (!isDraggingRef.current) return;
      event.preventDefault();
      
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        processPetalAtPoint(touch.clientX, touch.clientY);
      }
    };

    // Add non-passive touch event listeners
    container.addEventListener('touchmove', touchMoveHandler, { passive: false });

    return () => {
      container.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [processPetalAtPoint]);
  
  // Add isDraggingRef update effect
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);
  
  return (
    <GameWrapper>
      <FlowerContainer 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        style={{ userSelect: 'none' }}
      >
        {petals.map((petal, index) => {
          const x = petal.position.x;
          const y = petal.position.y;
          
          return (
            <Petal
              key={index}
              letter={petal.letter}
              tier={petal.tier}
              index={petal.index}
              x={x}
              y={y}
              isSelected={petal.isSelected}
              isHighlighted={petal.isHighlighted}
              isNeighbor={petal.isNeighbor}
              isNextTypingCandidate={potentialNextPetals.some(
                p => p.tier === petal.tier && p.index === petal.index
              )}
              onClick={(letter, tier, index) => {
                if (!isDragging && gameStatus === 'playing') {
                  const clickedPetal = petals.find(p => p.tier === tier && p.index === index);
                  if (clickedPetal) {
                    selectPetal(clickedPetal);
                  }
                }
              }}
              onMouseEnter={handlePetalMouseEnter}
              onMouseLeave={handlePetalMouseLeave}
            />
          );
        })}
      </FlowerContainer>

      <FoundWordsSection>
        <FoundWordsHeader>Found Words</FoundWordsHeader>
        <FoundWordsDisplay>
          {foundWords.map((word, index) => (
            <WordChip key={index}>{word}</WordChip>
          ))}
        </FoundWordsDisplay>
      </FoundWordsSection>
    </GameWrapper>
  );
};

export default Flower;