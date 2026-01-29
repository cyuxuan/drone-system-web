import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LucideIcon } from 'lucide-react';
import { useAppContext } from '../context';

export interface BulkAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

interface BulkActionHubProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
  statusLabel?: string;
  statusDesc?: string;
}

const BulkActionHub: React.FC<BulkActionHubProps> = ({
  selectedCount,
  onClear,
  actions,
  statusLabel,
  statusDesc,
}) => {
  const { t } = useAppContext();

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-500/5 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 border-rose-500/10';
      case 'success':
        return 'hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30';
      case 'warning':
        return 'hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10 hover:border-amber-500/30';
      default:
        return 'hover:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/10 hover:border-brand-500/30';
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
          className="fixed right-12 bottom-12 z-100"
        >
          <div className="glass-hud border-brand-500/40 ring-brand-500/5 flex items-center rounded-4xl border-2 bg-white/95 p-2 shadow-[0_30px_100px_-10px_rgba(0,0,0,0.4)] ring-4 backdrop-blur-3xl dark:bg-slate-950/95">
            {/* Status Header */}
            <div className="border-brand-500/15 flex items-center gap-4 border-r px-5 py-2">
              <div className="relative">
                <div className="bg-brand-500/30 absolute -inset-1.5 animate-pulse rounded-full blur"></div>
                <div className="bg-brand-500 relative flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black text-white shadow-lg">
                  {selectedCount}
                </div>
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-brand-600 dark:text-brand-400 text-[10px] font-black tracking-[0.2em] uppercase">
                  {statusLabel || t('targetLocked')}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase opacity-70 dark:text-slate-500">
                  {statusDesc || t('lockedTargetItems')}
                </span>
              </div>
            </div>

            {/* Actions Strip */}
            <div className="flex items-center gap-2 px-3">
              {actions.map((action, index) => (
                <React.Fragment key={action.label}>
                  <button
                    onClick={action.onClick}
                    className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[9px] font-black tracking-widest uppercase transition-all ${getVariantStyles(
                      action.variant,
                    )}`}
                  >
                    <action.icon className="h-3.5 w-3.5" /> {action.label}
                  </button>
                  {index < actions.length - 1 && action.variant !== actions[index + 1].variant && (
                    <div className="bg-brand-500/15 mx-2 h-6 w-px" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClear}
              className="bg-brand-500/5 hover:bg-brand-500/10 hover:text-brand-600 ml-2 rounded-full p-2 text-slate-400 transition-all dark:text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionHub;
