import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, AlertTriangle, Info, ChevronRight, Clock } from 'lucide-react';
import { useAppContext } from '../../../context';

const MOCK_MESSAGES = [
  {
    id: 1,
    type: 'alert',
    title: 'Drone Alpha-7 Signal Weak',
    time: '2 mins ago',
    icon: AlertTriangle,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    id: 2,
    type: 'message',
    title: 'New Client Inquiry: Project Sky-High',
    time: '15 mins ago',
    icon: MessageSquare,
    color: 'text-brand-500',
    bgColor: 'bg-brand-500/10',
  },
  {
    id: 3,
    type: 'info',
    title: 'System Maintenance Scheduled for 02:00',
    time: '1 hour ago',
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

const DashboardPendingMessages: React.FC = () => {
  const { t } = useAppContext();

  return (
    <div className="glass-hud border-brand-500/10 group/panel relative overflow-hidden rounded-4xl border bg-white/40 p-6 shadow-2xl backdrop-blur-xl dark:bg-slate-950/40">
      {/* Panel Decoration */}
      <div className="bg-brand-500/5 absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full blur-3xl" />
      <div className="bg-brand-500/40 absolute top-4 right-4 h-1 w-1 rounded-full" />
      <div className="bg-brand-500/40 absolute bottom-4 left-4 h-1 w-1 rounded-full" />

      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500/10 text-brand-500 border-brand-500/20 rounded-xl border p-2.5 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-[0.2em] text-slate-900 uppercase dark:text-white">
              {t('pendingMessages')}
            </h3>
            <div className="mt-0.5 flex items-center gap-1">
              <div className="bg-brand-500/30 h-px w-8" />
              <span className="text-brand-500/40 text-[7px] font-black tracking-widest uppercase">
                Operational Intel
              </span>
            </div>
          </div>
        </div>
        <div className="animate-pulse rounded-lg bg-rose-500 px-2.5 py-1 text-[8px] font-black tracking-widest text-white uppercase shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          3 New
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        <AnimatePresence>
          {MOCK_MESSAGES.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group hover:border-brand-500/30 hover:bg-brand-500/5 flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-100/50 bg-white/30 p-3.5 transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-900/30"
            >
              <div
                className={`rounded-xl p-2.5 ${msg.bgColor} ${msg.color} relative transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(20,184,166,0.1)]`}
              >
                <msg.icon className="h-4 w-4" />
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 border-white bg-rose-500 dark:border-slate-950" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="group-hover:text-brand-500 truncate text-[11px] font-black tracking-widest text-slate-800 uppercase transition-colors dark:text-slate-200">
                  {msg.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 opacity-60">
                  <Clock className="h-2.5 w-2.5" />
                  <span className="text-[8px] font-bold tracking-widest uppercase">{msg.time}</span>
                </div>
              </div>
              <div className="group-hover:bg-brand-500 flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100/50 transition-all duration-300 group-hover:text-white dark:bg-slate-800/50">
                <ChevronRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="border-brand-500/10 relative z-10 mt-6 border-t pt-5">
        <button className="text-brand-500/60 hover:text-brand-500 group flex w-full items-center justify-center gap-2 text-[9px] font-black tracking-[0.3em] uppercase transition-colors">
          {t('viewAllMessages')}
          <div className="bg-brand-500/5 group-hover:bg-brand-500 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 group-hover:text-white">
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardPendingMessages;
