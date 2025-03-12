import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
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

const flyUpAndFadeAnimation = keyframes`
  0% { transform: translate(-50%, 0); opacity: 0; scale: 0.7; }
  20% { transform: translate(-50%, -20px); opacity: 1; scale: 1.1; }
  80% { transform: translate(-50%, -80px); opacity: 1; scale: 1; }
  100% { transform: translate(-50%, -120px); opacity: 0; scale: 0.9; }
`;

const WordScoreAnimation = styled.div<{ $x: number; $y: number; $score: number }>`
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  transform: translateX(-50%);
  color: ${props => {
    if (props.$score > 30) return props.theme.colors.accent;
    if (props.$score > 20) return props.theme.colors.warning;
    return props.theme.colors.success;
  }};
  font-weight: bold;
  font-size: ${props => props.$score > 20 ? '2.2rem' : '1.8rem'};
  animation: ${flyUpAndFadeAnimation} 1.5s ease-out forwards;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
  z-index: 1000;
  white-space: nowrap;
  pointer-events: none;
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
  max-width: 550px;
  
  @media (max-width: 768px) {
    width: 90vw;
    height: 90vw;
    padding-bottom: 90vw;
    max-width: none;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px ${props => `${props.theme.colors.activeConnection}50`};
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
  const { state, selectPetal, resetSelection, submitWord, clearInvalidWordState } = useGameContext();
  const { letterArrangement, selectedPetals, gameStatus, foundWords, score, timeRemaining, currentWord } = state;
  
  const [petals, setPetals] = useState<PetalState[]>([]);
  const [hoveredPetal, setHoveredPetal] = useState<{ tier: PetalTier; index: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const updateRequiredRef = useRef<boolean>(false);
  const isDraggingRef = useRef(false);
  
  // For word score animation
  const [wordScore, setWordScore] = useState(0);
  const [showWordScore, setShowWordScore] = useState(false);
  const [wordScorePosition, setWordScorePosition] = useState({ x: 0, y: 0 });
  
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
      
      // End the dragging state
      setIsDragging(false);
      isDraggingRef.current = false;
      
      // Remove document-level event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Don't submit invalid words (too short)
      if (state.currentWord.length < 3) {
        resetSelection();
        return;
      }
      
      // Don't try to submit again if we already have an invalid attempt
      if (state.invalidWordAttempt) {
        // Let the WordDisplay component handle the reset
        return;
      }

      // Submit the word if it's long enough
      submitWord();
    }
  }, [isDragging, state.currentWord.length, state.invalidWordAttempt, submitWord, resetSelection, handleMouseMove]);
  
  // Update handleTouchMove to use isDraggingRef - without preventDefault
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!isDraggingRef.current) {
      return;
    }
    
    // Do NOT call preventDefault here - only use it in the non-passive native event listener
    // Process touch position only
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      processPetalAtPoint(touch.clientX, touch.clientY);
    }
  }, [processPetalAtPoint]);
  
  // Touch event handlers for mobile support
  const handleTouchStart = (event: React.TouchEvent) => {
    if (gameStatus !== 'playing') return;
    
    console.log('Touch start detected');
    
    // Reset previous selection
    resetSelection();
    
    // Set dragging state
    setIsDragging(true);
    isDraggingRef.current = true;
    
    // Process the first touch
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      processPetalAtPoint(touch.clientX, touch.clientY);
    }
  };
  
  const handleTouchEnd = (event: React.TouchEvent) => {
    // No longer calling preventDefault to avoid passive event listener warning
    
    console.log('Touch end detected, isDragging:', isDragging, 'word:', state.currentWord, 'invalid:', state.invalidWordAttempt);
    
    // Check if we're in a dragging state
    if (isDragging) {
      // End the dragging state
      setIsDragging(false);
      isDraggingRef.current = false;
      
      // Don't submit invalid words (too short)
      if (state.currentWord.length < 3) {
        console.log('Word too short, resetting');
        resetSelection();
        return;
      }
      
      // If we already have an invalid attempt, just let the WordDisplay handle it
      if (state.invalidWordAttempt) {
        console.log('Invalid word attempt already in progress, not submitting again');
        return;
      }

      // Submit the word if it's long enough
      console.log('Submitting word:', state.currentWord);
      submitWord();
      
      // When handling touch end on invalid words, we need to force a reset after
      // a short delay to account for state updates
      if (state.invalidWordAttempt) {
        console.log('Word invalid after submission, will reset');
        setTimeout(() => {
          resetSelection();
        }, 200);
      }
    } else {
      console.log('Touch end ignored - not dragging');
    }
  };
  
  // Handle touch cancel - important for some devices
  const handleTouchCancel = (event: React.TouchEvent) => {
    console.log('Touch cancel detected');
    
    if (isDragging) {
      // End dragging state
      setIsDragging(false);
      isDraggingRef.current = false;
      
      // Always reset on touch cancel for safety
      resetSelection();
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
      
      // We need preventDefault to stop scrolling while dragging
      // This is why we must use a non-passive event listener
      event.preventDefault();
      
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        processPetalAtPoint(touch.clientX, touch.clientY);
      }
    };

    // Add non-passive touch event listener for touchmove
    // The {passive: false} option is critical here to allow preventDefault
    container.addEventListener('touchmove', touchMoveHandler, { passive: false });

    return () => {
      container.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [processPetalAtPoint]);
  
  // Keep isDraggingRef in sync with state
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);
  
  // Track the invalid word attempt state - critical for reset handling
  useEffect(() => {
    if (state.invalidWordAttempt) {
      console.log('Invalid word detected in Flower component');
      
      // Force the dragging state to false immediately
      setIsDragging(false);
      isDraggingRef.current = false;
    }
  }, [state.invalidWordAttempt]);
  
  // Track score changes to display word score at the last selected petal position
  useEffect(() => {
    // Only show animation for valid words that earn points
    if (state.lastWordScore && state.lastWordScore > 0) {
      // Get position from the display container rather than from selectedPetals 
      // (which will be empty after word submission)
      const displayContainer = document.querySelector('#word-display-container');
      if (displayContainer) {
        const rect = displayContainer.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (containerRect) {
          // Calculate position relative to the flower container
          const x = ((rect.left + rect.width/2) - containerRect.left) / containerRect.width * 100;
          const y = (rect.bottom - containerRect.top) / containerRect.height * 100;
          
          setWordScore(state.lastWordScore);
          setWordScorePosition({ x, y });
          setShowWordScore(true);
          
          // Hide animation after it completes
          const timer = setTimeout(() => {
            setShowWordScore(false);
          }, 1500);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [state.lastWordScore, containerRef]);
  
  // Debugging - force a reset of the invalid state when word is detected
  useEffect(() => {
    if (state.invalidWordAttempt) {
      console.log('*** INVALID WORD DETECTED - WILL RESET STATE AFTER 500ms ***');
      
      const timer = setTimeout(() => {
        console.log('*** RESETTING SELECTION FROM FLOWER COMPONENT ***');
        resetSelection();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.invalidWordAttempt, resetSelection]);

  // Set up a safety mechanism to ensure we can always recover from a stuck state
  // This ensures we have a backup way to reset if something goes wrong
  useEffect(() => {
    if (!state.invalidWordAttempt) return; // Only run when invalid word is detected
    
    // If an invalid word state persists too long, force a reset
    console.log('Setting up safety timeout for invalid word');
    
    // We only want one safety timer at a time
    const safetyTimer = setTimeout(() => {
      if (state.invalidWordAttempt) {
        console.log('SAFETY: Forcing reset of stuck word state');
        resetSelection();
        clearInvalidWordState();
      }
    }, 3000); // 3 seconds should be plenty
    
    return () => {
      // Always clear the timeout when the effect is cleaned up
      clearTimeout(safetyTimer);
    };
  }, [state.invalidWordAttempt]); // Only depend on invalidWordAttempt, not the functions
  
  return (
    <GameWrapper>
      <FlowerContainer 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        style={{ userSelect: 'none' }}
      >
        {showWordScore && (
          <WordScoreAnimation 
            $x={wordScorePosition.x}
            $y={wordScorePosition.y}
            $score={wordScore}
          >
            +{wordScore}
          </WordScoreAnimation>
        )}
        {petals.map((petal, index) => {
          const x = petal.position.x;
          const y = petal.position.y;
          
          return (
            <Petal
              key={`petal-${petal.tier}-${petal.index}`}
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
            <WordChip key={`flower-${word}-${index}`}>{word}</WordChip>
          ))}
        </FoundWordsDisplay>
      </FoundWordsSection>
    </GameWrapper>
  );
};

export default Flower;