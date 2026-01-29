import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, SearchX, RefreshCcw, Info } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isError?: boolean;
  className?: string;
}

const HUD_MOCK_DATA = [
  { label: 'SIG_STRENGTH', value: 82 },
  { label: 'BUFFER_LOAD', value: 45 },
  { label: 'SYNC_STATUS', value: 91 },
  { label: 'MEM_ALLOC', value: 64 },
];

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction,
  isError = false,
  className = '',
}) => {
  const themeColor = isError ? 'rose' : 'brand';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-5xl relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden px-6 py-32 ${className}`}
    >
      {/* --- Performance Optimized Background Layers --- */}

      {/* 1. Base Scanning Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-${themeColor}-500) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* --- Main Content Core --- */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Central Icon Assembly - Enhanced and Simplified */}
        <div className="relative mb-16 flex items-center justify-center">
          {/* Main Visual Core Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-20 flex h-32 w-32 items-center justify-center"
          >
            {/* 1. Dynamic Outer Glow Ring (Solid) */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute inset-0 rounded-full border-2 border-${themeColor}-500 shadow-${themeColor}-500/30 blur-[2px]`}
            />

            {/* 2. Solid Inner Circle with Glass Effect */}
            <div
              className={`absolute inset-4 rounded-full border border-current opacity-20 ${isError ? 'bg-rose-500/5 text-rose-500' : 'text-brand-500 bg-brand-500/5'} `}
            />

            {/* 3. The Icon Itself - Larger and Bolder */}
            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10"
            >
              <Icon
                className={`h-14 w-14 ${isError ? 'text-rose-500' : 'text-brand-500'}`}
                strokeWidth={1.5}
              />
            </motion.div>

            {/* 4. Optimized Multi-layer Ripple Effect - Smoother, No Flicker */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: 'easeOut',
                }}
                className={`absolute inset-0 rounded-full border ${
                  isError ? 'border-rose-500/30' : 'border-brand-500/30'
                } pointer-events-none will-change-transform`}
              />
            ))}
          </motion.div>
        </div>

        {/* Text Content - Beautified Typography */}
        <div className="max-w-md space-y-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3
              className={`mb-2 text-4xl font-black tracking-tighter ${isError ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'} `}
            >
              <span className="inline-block rounded-sm bg-current/5 px-4 py-1 backdrop-blur-xs">
                {title}
              </span>
            </h3>

            <div className="flex items-center justify-center gap-4 opacity-40">
              <div
                className={`h-px w-16 bg-linear-to-r from-transparent via-${themeColor}-500 to-transparent`}
              />
              <div className={`h-1.5 w-1.5 rounded-full bg-${themeColor}-500 animate-pulse`} />
              <div
                className={`h-px w-16 bg-linear-to-r from-transparent via-${themeColor}-500 to-transparent`}
              />
            </div>
          </motion.div>

          {description && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="group relative"
            >
              <div className="absolute -inset-2 bg-linear-to-r from-transparent via-slate-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="relative text-xs leading-relaxed font-medium tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                <span className={`text-${themeColor}-500/60 mr-2 font-mono`}>&gt;</span>
                {description}
              </p>
            </motion.div>
          )}

          {/* Action Button - Redesigned for Tactical HUD */}
          {onAction && actionLabel && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-10"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAction}
                className={`group relative overflow-hidden px-12 py-4 transition-all duration-300 ${isError ? 'text-rose-500' : 'text-brand-500'} `}
              >
                {/* Button Background with Glass Effect */}
                <div
                  className={`absolute inset-0 rounded-lg border-2 border-current opacity-20 transition-opacity duration-300 group-hover:opacity-40`}
                />
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-current" />
                <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-current" />
                <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-current" />
                <div className="absolute right-0 bottom-0 h-3 w-3 border-r-2 border-b-2 border-current" />

                {/* Content */}
                <div className="relative z-10 flex items-center gap-3 text-xs font-black tracking-[0.3em] uppercase">
                  {isError ? (
                    <RefreshCcw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <span>{actionLabel}</span>
                </div>

                {/* Hover Glow Effect */}
                <div
                  className={`absolute inset-0 bg-current/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100`}
                />

                {/* Scanning Bar Animation */}
                <motion.div
                  animate={{ left: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 bottom-0 w-1/3 skew-x-[-20deg] bg-linear-to-r from-transparent via-current/20 to-transparent"
                />
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- HUD Outer Accents & Data Readouts --- */}

      {/* 1. Large Corner Brackets */}
      <div
        className={`absolute top-10 left-10 h-16 w-16 border-t-2 border-l-2 border-${themeColor}-500/20`}
      />
      <div
        className={`absolute top-10 right-10 h-16 w-16 border-t-2 border-r-2 border-${themeColor}-500/20`}
      />
      <div
        className={`absolute bottom-10 left-10 h-16 w-16 border-b-2 border-l-2 border-${themeColor}-500/20`}
      />
      <div
        className={`absolute right-10 bottom-10 h-16 w-16 border-r-2 border-b-2 border-${themeColor}-500/20`}
      />

      {/* 2. Side Data Strips (Left) */}
      <div className="absolute top-1/2 left-10 hidden -translate-y-1/2 flex-col gap-8 opacity-40 xl:flex">
        {HUD_MOCK_DATA.map((data, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span
              className={`text-[8px] font-black text-${themeColor}-500/60 tracking-tighter uppercase`}
            >
              {data.label}
            </span>
            <div className={`h-1 w-12 bg-${themeColor}-500/20 overflow-hidden rounded-full`}>
              <motion.div
                animate={{ width: [`${data.value}%`, '100%', `${data.value}%`] }}
                transition={{ duration: 5 + i, repeat: Infinity }}
                className={`h-full bg-${themeColor}-500/40`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Side Data Strips (Right) */}
      <div className="absolute top-1/2 right-10 hidden -translate-y-1/2 flex-col items-end gap-2 opacity-40 xl:flex">
        <div className={`font-mono text-[10px] text-${themeColor}-500/60`}>STATUS: STANDBY</div>
        <div className={`font-mono text-[10px] text-${themeColor}-500/60`}>COORD: 34.0522° N</div>
        <div className={`font-mono text-[10px] text-${themeColor}-500/60`}>ALT: 450.00 M</div>
        <div className="mt-2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              className={`h-4 w-1.5 bg-${themeColor}-500/40 rounded-sm`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(EmptyState);
