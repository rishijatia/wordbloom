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
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px'
  }
};

export type Theme = typeof theme; 