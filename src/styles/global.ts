import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
  }

  body {
    background-color: ${props => props.theme.colors.background};
    background-image: ${props => props.theme.colors.backgroundGradient};
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    color: ${props => props.theme.colors.text};
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow-x: hidden;
    padding: 0;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Quicksand', 'Arial', sans-serif;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
  }
  
  /* Animations */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(10px); }
  }
  
  @keyframes growShrink {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes flyUp {
    0% { transform: translate(-50%, 0); opacity: 0; }
    20% { transform: translate(-50%, -20px); opacity: 1; }
    80% { transform: translate(-50%, -60px); opacity: 1; }
    100% { transform: translate(-50%, -100px); opacity: 0; }
  }
  
  /* Add enhanced animations */
  @keyframes glowPulse {
    0% { box-shadow: 0 0 5px rgba(245, 185, 70, 0.3); }
    50% { box-shadow: 0 0 15px rgba(245, 185, 70, 0.5); }
    100% { box-shadow: 0 0 5px rgba(245, 185, 70, 0.3); }
  }
  
  @keyframes connectionGrow {
    0% { transform: scaleX(0); opacity: 0.3; }
    100% { transform: scaleX(1); opacity: 1; }
  }
  
  @keyframes scoreFloat {
    0% { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
    20% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); }
    80% { opacity: 1; transform: translate(-50%, -40px) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -60px) scale(0.9); }
  }
  
  /* Mobile optimizations */
  @media (max-width: 480px) {
    html {
      font-size: 14px;
    }
    
    body {
      padding: 0;
    }
  }
`;

export default GlobalStyle; 