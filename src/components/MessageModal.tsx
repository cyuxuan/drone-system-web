import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle, Info, HelpCircle, X } from 'lucide-react';
import { useAppContext } from '../context';

export type MessageType = 'confirm' | 'alert' | 'success' | 'error' | 'warning';

interface MessageModalProps {
  isOpen: boolean;
  type: MessageType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}) => {
  const { t } = useAppContext();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-amber-500" />;
      case 'confirm':
        return <HelpCircle className="text-brand-500 h-12 w-12" />;
      default:
        return <Info className="h-12 w-12 text-blue-500" />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'error':
        return 'border-rose-500/20 bg-rose-500/5';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5';
      case 'confirm':
        return 'border-brand-500/20 bg-brand-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20';
      default:
        return 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20';
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 isolate z-9999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md dark:bg-black/80"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] border bg-white shadow-[0_30px_60px_rgba(0,0,0,0.3)] dark:bg-slate-900 ${getTypeStyles()} flex flex-col items-center p-8 text-center`}
          >
            <button
              onClick={onCancel}
              className="absolute top-6 right-6 rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-500/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className={`mb-6 rounded-3xl p-4 ${getTypeStyles()} border-none`}>{getIcon()}</div>

            <h3 className="mb-3 text-2xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {title}
            </h3>

            <p className="mb-8 text-sm leading-relaxed font-medium text-slate-500 dark:text-slate-400">
              {message}
            </p>

            <div className="flex w-full items-center gap-3">
              {type === 'confirm' && (
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-2xl bg-slate-100 px-6 py-4 text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  {cancelText || t('cancel')}
                </button>
              )}
              <button
                onClick={onConfirm || onCancel}
                className={`flex-1 rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-lg transition-all active:scale-95 ${getButtonStyles()}`}
              >
                {confirmText ||
                  (type === 'confirm' ? t('confirmDirective') : t('confirmDirective'))}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default MessageModal;
