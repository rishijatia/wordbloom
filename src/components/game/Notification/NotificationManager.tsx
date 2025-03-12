import React, { useState, useEffect, useCallback } from 'react';
import Notification, { NotificationType } from './Notification';

// Notification item interface
interface NotificationItem {
  id: number;
  message: string;
  type: NotificationType;
  duration?: number;
}

/**
 * NotificationManager component that manages multiple notifications
 * Can be used to show success for word submissions, errors for invalid words, etc.
 */
const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counter, setCounter] = useState(0);
  
  // Function to add a notification
  // Allows positioning below word panel rather than center screen
  const addNotification = useCallback((message: string, type: NotificationType, duration?: number) => {
    const id = counter;
    setCounter(prev => prev + 1);
    
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    return id;
  }, [counter]);
  
  // Function to remove a notification
  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Add the addNotification function to the window object
  // So it can be called from other components or contexts
  useEffect(() => {
    // @ts-ignore - add to window for global access
    window.addNotification = addNotification;
    
    return () => {
      // @ts-ignore - clean up
      delete window.addNotification;
    };
  }, [addNotification]);
  
  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

export default NotificationManager;
