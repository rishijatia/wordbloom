export const theme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    background: '#F0F9FF', // Light blue background
    text: '#333333',
    lightText: '#7f8c8d',
    
    // Botanical color scheme for petals
    centerPetal: '#FFD56D', // Golden yellow for center petal
    innerPetal: '#81D8C9', // Teal mint for inner ring
    outerPetal: '#C0A5E3', // Soft purple for outer ring
    
    // Selected states - more vibrant versions
    selectedCenterPetal: '#FFB347', // Brighter golden for selected center
    selectedInnerPetal: '#4ECDC4', // Brighter teal for selected inner
    selectedOuterPetal: '#A893DB', // Brighter purple for selected outer
    
    // Panel and UI colors
    panel: '#FFFFFF', // White panels
    accent: '#FF8C6B', // Coral accent
    timerBg: '#E0F2F1', // Timer background
    success: '#66BB6A', // Green success
    error: '#EF5350', // Red error
    shadow: 'rgba(0, 0, 0, 0.1)', // Shadows
    
    // Connection colors
    activeConnection: 'rgba(81, 216, 201, 0.8)', // Teal connection
    staticConnection: 'rgba(224, 224, 224, 0.5)'
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
    small: '8px',
    medium: '12px',
    large: '16px',
    round: '50%'
  },
  
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
    large: '0 6px 16px rgba(0, 0, 0, 0.15)'
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px'
  }
};

export type Theme = typeof theme; 