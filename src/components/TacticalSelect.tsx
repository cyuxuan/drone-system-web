import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface TacticalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

const TacticalSelect: React.FC<TacticalSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 group flex w-full items-center justify-between rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
      >
        <div className="flex items-center gap-3 truncate">
          {icon && (
            <span className="text-brand-500/60 group-hover:text-brand-500 transition-colors">
              {icon}
            </span>
          )}
          <span
            className={
              selectedOption
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 dark:text-slate-500'
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`text-brand-500/50 group-hover:text-brand-500 h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="glass-hud border-brand-500/20 absolute z-100 mt-2 w-full overflow-hidden rounded-2xl border-2 py-2 shadow-2xl"
          >
            <div className="custom-scrollbar max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-6 py-3.5 text-xs font-black tracking-widest uppercase transition-all ${
                    value === option.value
                      ? 'bg-brand-500 text-white'
                      : 'hover:bg-brand-500/10 hover:text-brand-600 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {option.label}
                  {value === option.value && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TacticalSelect;
