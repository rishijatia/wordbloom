import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../../contexts/GameContext';
import FlowerScene from '../scenes/FlowerScene';

const ThreeContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Maintain aspect ratio */
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 50%;
`;

const ThreeFlower: React.FC = () => {
  const { state } = useGameContext();
  const { letterArrangement, selectedPetals, gameStatus } = state;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FlowerScene | null>(null);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new FlowerScene(containerRef.current);
    sceneRef.current = scene;
    
    // Start animation loop
    scene.start();
    
    return () => {
      // Clean up on unmount
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, []);
  
  // Initialize flower layout when letter arrangement changes
  useEffect(() => {
    if (!sceneRef.current || !letterArrangement.center) return;
    
    sceneRef.current.initialize(letterArrangement);
  }, [letterArrangement]);
  
  // Update petal selection
  useEffect(() => {
    if (!sceneRef.current) return;
    
    sceneRef.current.updatePetalSelection(selectedPetals);
    sceneRef.current.updateConnections(selectedPetals);
  }, [selectedPetals]);
  
  return <ThreeContainer ref={containerRef} />;
};

export default ThreeFlower; 