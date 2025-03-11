export const theme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    background: '#f0f8ff',
    text: '#333333',
    lightText: '#7f8c8d',
    
    // Petal colors
    centerPetal: '#ffcc29',
    innerPetal: '#4f9ee8',
    outerPetal: '#5ac476',
    
    // Connection colors
    activeConnection: 'rgba(52, 152, 219, 0.8)',
    staticConnection: 'rgba(224, 224, 224, 0.5)'
  },
  
  fontSizes: {
    small: '0.8rem',
    medium: '1rem',
    large: '1.2rem',
    xlarge: '1.5rem',
    xxlarge: '1.8rem'
  },
  
  borderRadius: {
    small: '5px',
    medium: '10px',
    large: '20px',
    round: '50%'
  },
  
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 10px 30px rgba(0, 0, 0, 0.1)'
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px'
  }
};

export type Theme = typeof theme; 