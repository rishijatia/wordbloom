// Global type declarations
import { NotificationType } from '../components/game/Notification/Notification';

declare global {
  interface Window {
    addNotification: (message: string, type: NotificationType, duration?: number) => number;
  }
}

// This export is needed to make this a module
export {};
