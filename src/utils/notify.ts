import { LucideIcon, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

type Listener = (notifications: Notification[]) => void;

class NotifyManager {
  private notifications: Notification[] = [];
  private listeners: Listener[] = [];
  private lastMessage: string = '';
  private lastTimestamp: number = 0;
  private readonly FLOOD_WINDOW = 2000; // 2 seconds window to prevent duplicate messages

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  show(type: NotificationType, message: string, duration = 4000) {
    const now = Date.now();

    // Anti-flood logic: ignore if same message within window
    if (message === this.lastMessage && now - this.lastTimestamp < this.FLOOD_WINDOW) {
      return;
    }

    this.lastMessage = message;
    this.lastTimestamp = now;

    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = { id, type, message, duration };

    this.notifications.push(notification);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  error(message: string, duration?: number) {
    this.show('error', message, duration);
  }

  success(message: string, duration?: number) {
    this.show('success', message, duration);
  }

  info(message: string, duration?: number) {
    this.show('info', message, duration);
  }

  warning(message: string, duration?: number) {
    this.show('warning', message, duration);
  }

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }
}

export const notify = new NotifyManager();

export const getIcon = (type: NotificationType): LucideIcon => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
    default:
      return Info;
  }
};

export const getTypeStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'from-emerald-500/20 to-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'error':
      return 'from-rose-500/20 to-rose-600/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'warning':
      return 'from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'info':
    default:
      return 'from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
  }
};
