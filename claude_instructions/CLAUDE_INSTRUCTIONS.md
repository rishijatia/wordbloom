# Expert Prompt for Claude 3.7: WordBloom Visual Design Enhancement

You'll be upgrading the visual design of a 2D word puzzle game called WordBloom that organizes letters in a flower-like pattern. The game has a functional but visually basic interface that needs enhancement through modern design techniques including glass morphism, cohesive color schemes, subtle animations, and improved visual hierarchy.

## Design Objectives
- Transform clinical white backgrounds to a botanical-inspired design system
- Enhance petal colors for better visual harmony and hierarchy
- Apply glass morphism effects to UI elements
- Add subtle animations and visual feedback
- Create a unified layout that flows better visually

## Implementation Plan
Apply these changes to specific files in the following order of priority:

### 1. Update Theme File (`src/styles/theme.ts`)
Replace the current theme with this enhanced version:

```typescript
export const theme = {
  colors: {
    // Primary brand colors
    primary: '#19A78E',     // Rich teal
    secondary: '#F5B946',   // Warm amber
    danger: '#E05D55',      // Soft red
    warning: '#F5B946',     // Amber
    
    // UI colors
    background: '#F8FCF9',   // Off-white with slight green tint
    backgroundGradient: 'linear-gradient(165deg, #F8FCF9 0%, #E3F1E9 100%)',
    panel: 'rgba(255, 255, 255, 0.85)',
    text: '#333333',
    lightText: '#71847A',
    
    // Petal colors - completely redesigned
    centerPetal: '#F5B946',       // Warm amber center
    selectedCenterPetal: '#FFD980', // Lighter amber when selected
    
    innerPetal: '#5ABEAF',        // Teal for inner ring
    selectedInnerPetal: '#8BD5CB', // Lighter teal when selected
    
    outerPetal: '#B6A4DE',        // Soft lavender for outer
    selectedOuterPetal: '#CAB8F2', // Lighter lavender when selected
    
    // Connection colors
    activeConnection: 'rgba(245, 185, 70, 0.9)',
    staticConnection: 'rgba(224, 224, 224, 0.5)',
    
    // Success/feedback colors
    success: '#5AAC6E',      // Garden green
    accent: '#FF8C6B',       // Coral accent
    timerBg: '#E0F2F1',      // Timer background
    shadow: 'rgba(22, 78, 99, 0.15)'  // Richer shadow
  },
  
  fontSizes: {
    xs: '0.75rem',
    small: '0.85rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
    xxlarge: '1.75rem',
    xxxlarge: '2rem'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  
  borderRadius: {
    small: '12px',         // Increased roundness
    medium: '16px',        // Increased roundness 
    large: '20px',         // Increased roundness
    round: '50%'
  },
  
  shadows: {
    small: '0 3px 8px rgba(22, 78, 99, 0.1)',   // More atmospheric shadows
    medium: '0 6px 16px rgba(22, 78, 99, 0.12)',
    large: '0 8px 24px rgba(22, 78, 99, 0.15)',
    glow: '0 0 15px rgba(245, 185, 70, 0.4)'    // New amber glow shadow
  }
};
```

### 2. Enhance Global Styles (`src/styles/global.ts`)
Add these animations to the existing GlobalStyle:

```typescript
const GlobalStyle = createGlobalStyle`
  /* Keep existing styles and add these animations */
  
  body {
    background-color: ${props => props.theme.colors.background};
    background-image: ${props => props.theme.colors.backgroundGradient};
    font-family: 'Nunito', 'Segoe UI', sans-serif;
    color: ${props => props.theme.colors.text};
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
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(10px); }
  }
  
  @keyframes scoreFloat {
    0% { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
    20% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); }
    80% { opacity: 1; transform: translate(-50%, -40px) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -60px) scale(0.9); }
  }
`;
```

### 3. Update Game Screen Layout (`src/components/screens/GameScreen/GameScreen.tsx`) 
Replace these styled components in GameScreen.tsx:

```typescript
// Main container with gradient background
const GameContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.backgroundGradient};
  overflow: hidden;

  /* Add subtle pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657l1.415 1.414L13.857 0H11.03zm32.284 0L39.9 3.414 42.28 0h1.032zm-9.9 0L35.6 1.414 40.57 0h-7.14zM16.686 0L10.743 5.943 13.57 0h3.116zM36.157 0L32 4.157 36.157 0z' fill='%2390a29c' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.sm};
  }
`;

// Glass effect header
const GameHeader = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  z-index: 10;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.medium};
  margin: 0 auto;
  margin-bottom: ${props => props.theme.spacing.md};

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.sm};
    gap: ${props => props.theme.spacing.xs};
  }
`;

// Enhanced flower section
const FlowerSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: auto;
  min-height: 550px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow: visible;
  transform-origin: center center;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${props => props.theme.shadows.medium};
  padding: ${props => props.theme.spacing.md};

  @media (max-width: 1024px) {
    flex: 2;
    min-height: 450px;
    transform: none;
  }

  @media (max-width: 768px) {
    min-height: 350px;
    margin-bottom: 0;
    padding: ${props => props.theme.spacing.sm};
  }
`;

// Enhanced word display
const CurrentWordDisplay = styled.div`
  font-size: ${props => props.theme.fontSizes.xxxlarge};
  font-weight: bold;
  min-height: 2.75rem;
  min-width: 150px;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.medium};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  text-align: center;
  margin-top: ${props => props.theme.spacing.sm};

  /* Add glow when word is being formed */
  ${props => props.children && props.children !== '···' && `
    box-shadow: ${props.theme.shadows.glow};
    animation: glowPulse 2s infinite;
  `}

  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.xxlarge};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
    margin: ${props => props.theme.spacing.xs} 0;
    width: 100%;
  }
`;
```

### 4. Enhance Petal Component (`src/components/game/Petal/Petal.tsx`)
Update the HexagonalPetal styled component:

```typescript
const HexagonalPetal = styled.div<{
  $tier: PetalTier;
  $index: number;
  $x: number;
  $y: number;
  $isSelected: boolean;
  $isHighlighted: boolean;
  $isNeighbor: boolean;
  $isNextTypingCandidate?: boolean;
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => getSizeByTier(props.$tier, props.$index)};
  height: calc(${props => getSizeByTier(props.$tier, props.$index)} * 0.866);
  background-color: ${props => props.$isSelected 
    ? getSelectedColorByTier(props.$tier, props.$index, props.theme)
    : getColorByTier(props.$tier, props.$index, props.theme)};
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  font-weight: bold;
  font-size: ${props => getFontSizeByTier(props.$tier, props.$index)};
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
  box-shadow: ${props => props.$isSelected 
    ? `0 4px 12px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.4)`
    : `0 2px 6px rgba(0, 0, 0, 0.15), inset 0 0 6px rgba(255, 255, 255, 0.3)`};
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  z-index: ${props => props.$isSelected 
    ? 10
    : props.$tier + 2};
  
  /* Position the hexagon */
  left: calc(${props => props.$x}% - ${props => getSizeByTier(props.$tier, props.$index)}/2);
  top: calc(${props => props.$y}% - ${props => getSizeByTier(props.$tier, props.$index)} * 0.433);
  
  /* Visual effects based on state */
  transform: ${props => {
    if (props.$isSelected) return 'scale(1.12) translateZ(0)';
    if (props.$isHighlighted) return 'scale(1.06) translateZ(0)';
    return 'scale(1) translateZ(0)';
  }};
  
  /* Add gradient overlay for 3D effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.4) 0%, 
      rgba(255, 255, 255, 0.1) 50%, 
      rgba(0, 0, 0, 0.05) 100%
    );
    pointer-events: none;
    opacity: ${props => props.$isSelected ? 0.9 : 0.6};
  }
  
  /* Next typing candidate styling - subtle glow */
  ${props => props.$isNextTypingCandidate && !props.$isSelected && `
    animation: glowPulse 1.5s infinite;
  `}
  
  /* Neighbor styling */
  ${props => props.$isNeighbor && !props.$isSelected && `
    box-shadow: 0 0 12px ${getSelectedColorByTier(props.$tier, props.$index, props.theme)}80;
  `}
  
  /* Add subtle hover effect */
  &:hover {
    transform: ${props => props.$isSelected ? 'scale(1.12) translateZ(0)' : 'scale(1.06) translateZ(0)'};
    box-shadow: ${props => props.$isSelected 
      ? `0 6px 16px rgba(0, 0, 0, 0.25), inset 0 0 12px rgba(255, 255, 255, 0.5)`
      : `0 4px 12px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.4)`};
  }
  
  /* Add active press effect */
  &:active {
    transform: scale(0.95) translateZ(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;
```

Also update the color functions in the same file:

```typescript
// Update these color functions in Petal.tsx
const getColorByTier = (tier: PetalTier, index: number, theme: any): string => {
  switch (tier) {
    case 1: return theme.colors.centerPetal;      // Amber for center
    case 2: return theme.colors.innerPetal;       // Teal for inner ring
    case 3: return theme.colors.outerPetal;       // Lavender for outer ring
    default: return '#ffffff';
  }
};

const getSelectedColorByTier = (tier: PetalTier, index: number, theme: any): string => {
  switch (tier) {
    case 1: return theme.colors.selectedCenterPetal;  // Bright amber
    case 2: return theme.colors.selectedInnerPetal;   // Bright teal
    case 3: return theme.colors.selectedOuterPetal;   // Bright lavender
    default: return '#ffffff';
  }
};
```

### 5. Enhance Connection Component (`src/components/game/Connection/Connection.tsx`)
Update the ConnectionLine styled component:

```typescript
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
```

### 6. Enhance Timer Component (`src/components/game/Timer/Timer.tsx`)
Update the TimerContainer styled component:

```typescript
const TimerContainer = styled.div<{ $isLowTime: boolean }>`
  font-size: 1.2rem;
  font-weight: bold;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.small};
  color: ${props => props.$isLowTime ? props.theme.colors.danger : props.theme.colors.text};
  transition: color 0.3s ease;
  position: relative;
  overflow: hidden;
  
  /* Add timer progress background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => (props.timeRemaining / props.totalTime) * 100}%;
    background: ${props => props.$isLowTime 
      ? 'rgba(224, 93, 85, 0.15)' 
      : 'rgba(90, 172, 110, 0.15)'};
    transition: width 1s linear, background 0.5s ease;
    z-index: 0;
  }
  
  /* Position text above the progress bar */
  & > * {
    position: relative;
    z-index: 1;
  }
  
  /* Pulsing animation for low time */
  ${props => props.$isLowTime && `
    animation: glowPulse 1.5s infinite;
  `}
`;
```

### 7. Enhance Score Component (`src/components/game/Score/Score.tsx`)
Update the ScoreContainer and PointsAnimation components:

```typescript
const ScoreContainer = styled.div`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${props => props.theme.shadows.small};
  position: relative;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 120px;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.medium};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    min-width: 100px;
  }
`;

const PointsAnimation = styled.div<{ $points: number }>`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${props => {
    if (props.$points > 30) return props.theme.colors.accent;
    if (props.$points > 20) return props.theme.colors.secondary;
    return props.theme.colors.success;
  }};
  font-weight: bold;
  font-size: ${props => {
    if (props.$points > 30) return '2.4rem';
    if (props.$points > 20) return '2.2rem';
    return '1.8rem';
  }};
  animation: scoreFloat 1.5s ease-out forwards;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
  z-index: 1000;
  white-space: nowrap;
  pointer-events: none;
`;
```

### 8. Update WordDisplay Component (`src/components/game/WordDisplay/WordDisplay.tsx`)
Update the display container and invalid word popup:

```typescript
const DisplayContainer = styled.div<{ $invalid: boolean }>`
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.$invalid ? props.theme.colors.danger : props.theme.colors.text};
  animation: ${props => props.$invalid ? shakeAnimation : 'none'} 0.5s ease;
  position: relative;
  text-shadow: ${props => props.$invalid ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'};
`;

const InvalidWordPopup = styled.div<{ $disappearing: boolean }>`
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(224, 93, 85, 0.9);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  white-space: nowrap;
  font-size: 20px;
  animation: ${props => props.$disappearing ? popupDisappearAnimation : popupAppearAnimation} 0.3s ease forwards;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;
```

## Implementation Process
1. Start with `theme.ts` as it affects the entire application
2. Next, enhance the `global.ts` file with new animations
3. Update the petal and connection components for the core game mechanics
4. Finally, update the surrounding UI components (timer, score, word display)

## Verification Guidelines
After implementing the changes, verify:
- Colors in the new palette match throughout the application
- Animations are subtle and enhance rather than distract from gameplay
- Glass effect and shadows create a proper depth hierarchy
- The new design maintains all functionality while improving aesthetics

Continue implementing these changes in order of priority until you reach the context limit. If you need to make choices due to context constraints, focus on the theme file, petal enhancements, and connection improvements as these will make the most visual impact.