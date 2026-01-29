import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 isolate z-9999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md dark:bg-black/80"
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative w-full ${maxWidth} border-brand-500/10 flex flex-col overflow-hidden rounded-[2.5rem] border bg-white shadow-[0_30px_60px_rgba(0,0,0,0.3)] dark:bg-slate-900`}
          >
            <div className="border-brand-500/10 bg-brand-500/5 flex shrink-0 items-center justify-between border-b px-8 py-6">
              <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="hover:bg-brand-500/10 hover:text-brand-600 rounded-xl p-2.5 text-slate-400 transition-all dark:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="custom-scrollbar max-h-[80vh] flex-1 overflow-y-auto p-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Modal;
