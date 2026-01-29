import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, BarChart2, Users, Zap, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../../context';

const QUICK_ACTIONS = [
  {
    id: 'new-order',
    icon: Plus,
    label: 'newOrder',
    color: 'bg-emerald-500',
    path: '/orders',
  },
  {
    id: 'reports',
    icon: BarChart2,
    label: 'dataReports',
    color: 'bg-brand-500',
    path: '/analytics',
  },
  {
    id: 'users',
    icon: Users,
    label: 'userManagement',
    color: 'bg-blue-500',
    path: '/users',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'systemSettings',
    color: 'bg-slate-500',
    path: '/settings',
  },
];

const DashboardQuickActions: React.FC = () => {
  const { t } = useAppContext();

  return (
    <div className="glass-hud border-brand-500/10 group/panel relative overflow-hidden rounded-4xl border bg-white/40 p-6 shadow-2xl backdrop-blur-xl dark:bg-slate-950/40">
      {/* Panel Decoration */}
      <div className="bg-brand-500/5 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full blur-3xl" />
      <div className="bg-brand-500/40 absolute top-4 left-4 h-1 w-1 rounded-full" />
      <div className="bg-brand-500/40 absolute right-4 bottom-4 h-1 w-1 rounded-full" />

      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500/10 text-brand-500 border-brand-500/20 rounded-xl border p-2.5 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-[0.2em] text-slate-900 uppercase dark:text-white">
              {t('quickActions')}
            </h3>
            <div className="mt-0.5 flex items-center gap-1">
              <div className="bg-brand-500/30 h-px w-8" />
              <span className="text-brand-500/40 text-[7px] font-black tracking-widest uppercase">
                Ready to deploy
              </span>
            </div>
          </div>
        </div>
        <div className="bg-brand-500/5 border-brand-500/10 flex items-center gap-2 rounded-lg border px-2 py-1">
          <div className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_8px_#14b8a6]" />
          <span className="text-brand-500/60 text-[8px] font-black tracking-widest uppercase">
            Tactical
          </span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group hover:border-brand-500/40 relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200/50 bg-white/50 p-5 transition-all duration-500 hover:shadow-[0_8px_25px_-8px_rgba(20,184,166,0.3)] dark:border-slate-800/50 dark:bg-slate-900/50"
          >
            {/* Hover Background Glow */}
            <div className="from-brand-500/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Corner Decor */}
            <div className="border-brand-500/0 group-hover:border-brand-500/40 absolute top-2 left-2 h-1 w-1 border-t border-l transition-all duration-500" />

            <div
              className={`bg-brand-500/5 text-brand-500 group-hover:bg-brand-500/10 relative z-10 mb-3 rounded-xl p-3 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]`}
            >
              <action.icon className="h-5 w-5" />
            </div>

            <span className="relative z-10 text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white">
              {t(action.label)}
            </span>

            <div className="absolute right-2 bottom-2 translate-x-2 transform opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
              <ChevronRight className="text-brand-500 h-3 w-3" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="border-brand-500/10 relative z-10 mt-6 border-t pt-5">
        <button className="border-brand-500/20 text-brand-500/50 hover:bg-brand-500/5 hover:border-brand-500/40 hover:text-brand-500 group/add flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-[9px] font-black tracking-[0.3em] uppercase transition-all duration-300">
          <Plus className="h-3 w-3 transition-transform duration-300 group-hover/add:rotate-90" />
          {t('customizeActions')}
        </button>
      </div>
    </div>
  );
};

export default DashboardQuickActions;
