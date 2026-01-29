import React from 'react';
import { motion } from 'framer-motion';

interface SidebarPanelProps {
  side: 'left' | 'right';
  children: React.ReactNode;
}

const SidebarPanel: React.FC<SidebarPanelProps> = ({ side, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`pointer-events-none z-10 flex h-full w-80 flex-col p-8 ${side === 'left' ? 'pr-0' : 'pl-0'}`}
    >
      <div className="scrollbar-hide pointer-events-auto flex-1 overflow-y-auto">{children}</div>
    </motion.div>
  );
};

export default SidebarPanel;
