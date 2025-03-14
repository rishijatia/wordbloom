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

type AppScreen = 'game' | 'dashboard' | 'detail' | 'loading' | 'error';

const GameContent: React.FC = () => {
  const { state, startChallengeGame } = useGameContext();
  const { gameStatus } = state;
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('loading');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null);
  const [isProcessingDeepLink, setIsProcessingDeepLink] = useState<boolean>(true);
  
  // Process deep links on initial load
  React.useEffect(() => {
    const processDeepLink = async () => {
      try {
        const { detectChallenge } = await import('./utils/challenge');
        const { challenge, challengerScore } = await detectChallenge();
        
        if (challenge) {
          console.log('Deep link challenge detected:', challenge.code);
          setSelectedChallenge(challenge);
          
          // Check if challenge is expired
          const { isChallengeExpired } = await import('./services/challengeService');
          if (isChallengeExpired(challenge)) {
            setDeepLinkError(`Challenge ${challenge.code} has expired. Challenges are available for 24 hours after creation.`);
            setCurrentScreen('error');
          } else {
            // If we have a valid challenge from URL, navigate to challenge detail
            setCurrentScreen('detail');
          }
          
          // Update URL to remove parameters after processing
          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState({}, '', url.toString());
        } else {
          // No challenge in URL, show default game screen
          setCurrentScreen('game');
        }
      } catch (error) {
        console.error('Error processing deep link:', error);
        setDeepLinkError('The challenge could not be loaded. Please check the link and try again.');
        setCurrentScreen('error');
      } finally {
        setIsProcessingDeepLink(false);
      }
    };
    
    processDeepLink();
  }, []);
  
  // Update browser history when changing screens
  React.useEffect(() => {
    if (!isProcessingDeepLink) {
      // Add current screen to browser history for back button support
      window.history.pushState(
        { screen: currentScreen, challengeId: selectedChallenge?.id }, 
        '',
        currentScreen === 'detail' && selectedChallenge 
          ? `?screen=${currentScreen}&challengeId=${selectedChallenge.id}` 
          : `?screen=${currentScreen}`
      );
    }
  }, [currentScreen, selectedChallenge, isProcessingDeepLink]);
  
  // Handle browser back button
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.screen) {
        setCurrentScreen(event.state.screen);
        
        // If returning to a detail screen, need to load the challenge
        if (event.state.screen === 'detail' && event.state.challengeId) {
          // Load challenge by ID
          const loadChallenge = async () => {
            try {
              const { getChallengeById } = await import('./services/challengeService');
              const challenge = await getChallengeById(event.state.challengeId);
              if (challenge) {
                setSelectedChallenge(challenge);
              }
            } catch (error) {
              console.error('Error loading challenge from history:', error);
            }
          };
          
          loadChallenge();
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
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
  
  // Render loading screen while processing deep links
  if (currentScreen === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2>Loading WordBloom...</h2>
        <p>Please wait while we initialize the game</p>
      </div>
    );
  }
  
  // Render error screen when deep link processing fails
  if (currentScreen === 'error') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e53935' }}>Challenge Not Available</h2>
        <p>{deepLinkError || 'An error occurred loading the challenge.'}</p>
        <button 
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#5ac476',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => setCurrentScreen('game')}
        >
          Return to Home Screen
        </button>
      </div>
    );
  }
  
  // Render the game screens
  if (currentScreen === 'game') {
    return (
      <>
        {gameStatus === 'playing' && <GameScreen />}
        {gameStatus === 'idle' && (
          <StartScreen onViewChallenges={handleNavigateToDashboard} />
        )}
        {gameStatus === 'gameOver' && (
          <GameOverScreen 
            onViewChallenges={handleNavigateToDashboard}
            onViewChallengeDetails={handleNavigateToDetail}
          />
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
    // When coming from game completion, we might not have seen the dashboard yet
    // Check game status to determine correct back behavior
    const handleBackNavigation = () => {
      if (state.gameStatus === 'gameOver') {
        // If we navigated here from the game over screen, we want to go to the dashboard
        setCurrentScreen('dashboard');
      } else {
        // Otherwise follow normal flow back to where we came from
        setCurrentScreen('dashboard');
      }
    };
    
    return (
      <ChallengeDetailScreen
        challengeId={selectedChallenge.id}
        onBack={handleBackNavigation}
        onPlay={(challenge) => handlePlayChallenge(challenge || selectedChallenge)}
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
