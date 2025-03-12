import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Types of notifications
export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose?: () => void;
}

// Styled container for notification with different styling based on type
const NotificationContainer = styled.div<{ $type: NotificationType; $visible: boolean }>`
  position: fixed;
  top: 128px; // Positioned closer to the typed word (5% higher)
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$visible ? '0' : '-20px'});
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => {
    switch (props.$type) {
      case 'success': return props.theme.colors.success;
      case 'error': return props.theme.colors.danger;
      case 'info': return props.theme.colors.primary;
      default: return props.theme.colors.primary;
    }
  }};
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.fontSizes.large};
  z-index: 1000;
  opacity: ${props => props.$visible ? 0.95 : 0};
  box-shadow: ${props => props.theme.shadows.large};
  transition: all 0.3s ease-in-out;
  text-align: center;
  pointer-events: none;
  min-width: 180px;
  max-width: 80%; // Prevent overflow on small screens
  
  @media (max-width: 768px) {
    top: 118px; // Adjust for mobile screens (5% higher)
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSizes.medium};
    min-width: 140px;
  }
`;

/**
 * Notification component that displays a message with a type and auto-dismisses
 */
const Notification: React.FC<NotificationProps> = ({ 
  message,
  type,
  duration = 2000,
  onClose
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Short delay before showing notification to ensure smooth animation
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 50);
    
    // Hide notification after duration
    const hideTimer = setTimeout(() => {
      setVisible(false);
      
      // Call onClose after animation completes
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, duration);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);
  
  return (
    <NotificationContainer $type={type} $visible={visible}>
      {message}
    </NotificationContainer>
  );
};

export default Notification;
