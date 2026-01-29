import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Radio, Zap, Cpu, Wifi, Globe } from 'lucide-react';

interface HeaderProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const Header: React.FC<HeaderProps> = ({ isFullscreen, toggleFullscreen }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-20 flex h-28 shrink-0 items-center justify-between bg-transparent px-10"
    >
      {/* Left Section: Branding */}
      <div className="flex items-center gap-6">
        <div className="group relative">
          <div className="bg-brand-500/10 absolute -inset-3 animate-pulse rounded-2xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100" />
          <div className="bg-brand-500/5 border-brand-500/20 text-brand-500 relative flex h-14 w-14 items-center justify-center rounded-2xl border shadow-[0_0_15px_rgba(20,184,166,0.1)] backdrop-blur-sm">
            <Radio className="h-7 w-7 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl leading-none font-black tracking-tighter text-white uppercase drop-shadow-lg">
              云Go <span className="text-brand-500">Visual</span>
            </h1>
            <div className="bg-brand-500/10 border-brand-500/20 rounded border px-2 py-0.5">
              <span className="text-brand-500 text-[8px] font-black tracking-widest uppercase">
                v2.4.0
              </span>
            </div>
          </div>
          <p className="mt-2.5 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] text-slate-400 uppercase drop-shadow-md">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
            CloudGo Strategic Operation Center
          </p>
        </div>
      </div>

      {/* Center Section: System Status Bridge */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-16 w-[560px] -translate-x-1/2">
        {/* Bridge Background - More geometric/tech shape */}
        <div
          className="border-brand-500/20 absolute inset-0 border-x border-b bg-slate-900/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md"
          style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
        />

        {/* Decorative Top Accent */}
        <div className="via-brand-500/50 absolute top-0 left-1/2 h-px w-48 -translate-x-1/2 bg-linear-to-r from-transparent to-transparent" />

        <div className="absolute inset-x-16 bottom-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-0.5">
              <Cpu className="text-brand-500/80 h-3.5 w-3.5" />
              <span className="text-[8px] font-black tracking-tighter text-slate-300 uppercase drop-shadow-sm">
                Core: 24%
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Wifi className="text-brand-500/80 h-3.5 w-3.5" />
              <span className="text-[8px] font-black tracking-tighter text-slate-300 uppercase drop-shadow-sm">
                Link: 12ms
              </span>
            </div>
          </div>

          <div className="bg-brand-500/5 border-brand-500/10 flex skew-x-[-20deg] flex-col items-center border-x px-6 py-1">
            <div className="flex skew-x-20 flex-col items-center">
              <div className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              <span className="text-brand-500 mt-1 text-[8px] font-black tracking-[0.2em] uppercase">
                Status
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-0.5">
              <Globe className="text-brand-500/80 h-3.5 w-3.5" />
              <span className="text-[8px] font-black tracking-tighter text-slate-300 uppercase drop-shadow-sm">
                Nodes: 142
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Zap className="text-brand-500/80 h-3.5 w-3.5" />
              <span className="text-[8px] font-black tracking-tighter text-slate-300 uppercase drop-shadow-sm">
                Power: Max
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Time & Controls */}
      <div className="flex items-center gap-6">
        <div className="bg-brand-500/5 border-brand-500/10 flex items-center gap-4 rounded-2xl border px-6 py-3 backdrop-blur-sm">
          <div className="text-right">
            <p className="text-brand-500/60 mb-0.5 text-[9px] font-black tracking-widest uppercase">
              Mission Time
            </p>
            <p className="text-lg leading-none font-black tracking-wider text-white uppercase tabular-nums drop-shadow-lg">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </p>
          </div>
          <div className="bg-brand-500/10 h-8 w-px" />
          <div className="text-left">
            <p className="text-brand-500/60 mb-0.5 text-[9px] font-black tracking-widest uppercase">
              Date
            </p>
            <p className="text-[11px] leading-none font-black tracking-tighter text-slate-200 uppercase drop-shadow-md">
              {time.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="group border-brand-500/10 text-brand-500 hover:border-brand-500/30 hover:bg-brand-500/5 relative overflow-hidden rounded-2xl border bg-slate-900/20 p-3.5 backdrop-blur-sm transition-all duration-300 active:scale-95"
        >
          <div className="from-brand-500/10 absolute inset-0 bg-linear-to-tr to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </div>
        </button>
      </div>
    </motion.header>
  );
};

export default Header;
