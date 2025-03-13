import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { GameProvider, useGameContext } from './contexts/GameContext';
import GlobalStyle from './styles/global';
import { theme } from './styles/theme';
import StartScreen from './components/screens/StartScreen/StartScreen';
import GameScreen from './components/screens/GameScreen/GameScreen';
import GameOverScreen from './components/screens/GameOverScreen/GameOverScreen';
import ChallengeDashboardScreen from './components/screens/ChallengeDashboardScreen';
import ChallengeDetailScreen from './components/screens/ChallengeDetailScreen';
import NotificationManager from './components/game/Notification/NotificationManager';
import { Challenge } from './models/Challenge';

const AppContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

type AppScreen = 'game' | 'dashboard' | 'detail';

const GameContent: React.FC = () => {
  const { state, startChallengeGame } = useGameContext();
  const { gameStatus } = state;
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('game');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  const handleNavigateToDashboard = () => {
    setCurrentScreen('dashboard');
  };
  
  const handleNavigateToGame = () => {
    setCurrentScreen('game');
  };
  
  const handleNavigateToDetail = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setCurrentScreen('detail');
  };
  
  const handlePlayChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    startChallengeGame(challenge);
    handleNavigateToGame();
  };
  
  // Render the game screens
  if (currentScreen === 'game') {
    return (
      <>
        {gameStatus === 'playing' && <GameScreen />}
        {gameStatus === 'idle' && (
          <StartScreen onViewChallenges={handleNavigateToDashboard} />
        )}
        {gameStatus === 'gameOver' && (
          <GameOverScreen onViewChallenges={handleNavigateToDashboard} />
        )}
      </>
    );
  }
  
  // Render the dashboard screen
  if (currentScreen === 'dashboard') {
    return (
      <ChallengeDashboardScreen 
        onNavigateToDetail={handleNavigateToDetail}
        onPlayChallenge={handlePlayChallenge}
        onNavigateToCreate={handleNavigateToGame}
        onBack={handleNavigateToGame}
      />
    );
  }
  
  // Render the challenge detail screen
  if (currentScreen === 'detail' && selectedChallenge) {
    return (
      <ChallengeDetailScreen
        challengeId={selectedChallenge.id}
        onBack={() => setCurrentScreen('dashboard')}
        onPlay={handlePlayChallenge}
      />
    );
  }
  
  // Default fallback
  return (
    <StartScreen onViewChallenges={handleNavigateToDashboard} />
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GameProvider>
        <AppContainer>
          <GameContent />
        </AppContainer>
        <NotificationManager />
      </GameProvider>
    </ThemeProvider>
  );
};

export default App;
