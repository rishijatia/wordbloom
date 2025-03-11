import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { GameProvider, useGameContext } from './contexts/GameContext';
import GlobalStyle from './styles/global';
import { theme } from './styles/theme';
import StartScreen from './components/screens/StartScreen/StartScreen';
import GameScreen from './components/screens/GameScreen/GameScreen';
import GameOverScreen from './components/screens/GameOverScreen/GameOverScreen';

const AppContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const GameContent: React.FC = () => {
  const { state } = useGameContext();
  const { gameStatus } = state;
  
  return (
    <>
      {gameStatus === 'playing' && <GameScreen />}
      {gameStatus === 'idle' && <StartScreen />}
      {gameStatus === 'gameOver' && <GameOverScreen />}
    </>
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
      </GameProvider>
    </ThemeProvider>
  );
};

export default App;
