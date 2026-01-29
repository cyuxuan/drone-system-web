import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notify, Notification, getTypeStyles } from '../utils/notify';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const Icon = ICON_MAP[notification.type] || Info;
  const styles = getTypeStyles(notification.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`group relative mb-3 flex max-w-md min-w-[320px] items-center gap-4 overflow-hidden rounded-3xl border bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:bg-slate-900/80 ${styles.split(' ').pop()} `}
      style={{
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1) inset',
      }}
    >
      {/* Background Accent */}
      <div
        className={`absolute inset-0 bg-linear-to-r opacity-10 ${styles.split(' ').slice(0, 2).join(' ')}`}
      />

      {/* Glass Shine */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
        <div className="absolute top-0 -left-full h-full w-[50%] skew-x-[-25deg] bg-linear-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ease-in-out group-hover:left-[150%]" />
      </div>

      <div
        className={`relative rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-800 ${styles.split(' ').slice(2, 4).join(' ')}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="relative flex-1">
        <p className="text-sm leading-tight font-bold text-slate-800 dark:text-slate-200">
          {notification.message}
        </p>
      </div>

      <button
        onClick={() => notify.remove(notification.id)}
        className="relative rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-500/10 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress Bar */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          className={`absolute right-0 bottom-0 left-0 h-1 origin-left bg-current opacity-20 ${styles.split(' ').slice(2, 4).join(' ')}`}
        />
      )}
    </motion.div>
  );
};

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return notify.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed top-8 right-8 z-10000 flex flex-col items-end">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem notification={notification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
