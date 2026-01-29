import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Navigation, Battery, Zap, Shield, Radio, MapPin } from 'lucide-react';
import { useAppContext } from '../../../context';
import { api } from '../../../services/api';
import { TelemetryData } from '../../../types';

const DashboardTaskMonitor: React.FC = () => {
  const { t } = useAppContext();
  const [drones, setDrones] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const data = await api.getLiveTelemetry();
        setDrones(data);
      } catch (error) {
        console.error('Failed to fetch telemetry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-hud border-brand-500/10 group/panel relative h-full overflow-hidden rounded-4xl border bg-white/40 p-8 shadow-2xl backdrop-blur-xl dark:bg-slate-950/40">
      {/* HUD Header */}
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-500/10 text-brand-500 border-brand-500/20 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-[0.2em] text-slate-900 uppercase dark:text-white">
              {t('taskMonitor')}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="bg-brand-500/30 h-0.5 w-12" />
              <span className="text-brand-500/60 text-[8px] font-black tracking-widest uppercase">
                {t('fleetStatus')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-brand-500/5 border-brand-500/10 flex items-center gap-3 rounded-xl border px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-black tracking-widest text-emerald-500/80 uppercase">
              {t('systemActive')}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <AnimatePresence mode="popLayout">
          {drones.map((drone, index) => (
            <motion.div
              key={drone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="group/item hover:border-brand-500/30 relative flex items-center gap-6 rounded-3xl border border-slate-200/50 bg-white/50 p-5 transition-all duration-500 hover:shadow-xl dark:border-slate-800/50 dark:bg-slate-900/50"
            >
              {/* Drone Icon/Status */}
              <div className="relative">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-500 ${
                    drone.status === 'flying'
                      ? 'bg-brand-500/10 border-brand-500/20 text-brand-500'
                      : 'border-slate-500/20 bg-slate-500/10 text-slate-500'
                  }`}
                >
                  <Navigation
                    className={`h-8 w-8 transition-transform duration-500 ${
                      drone.status === 'flying' ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
                {drone.status === 'flying' && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="bg-brand-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                    <span className="bg-brand-500 relative inline-flex h-4 w-4 rounded-full"></span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black tracking-wider text-slate-800 dark:text-white">
                    {drone.droneName}
                  </h4>
                  <span className="text-brand-500/60 text-[9px] font-black tracking-widest uppercase">
                    ID: {drone.id}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Battery
                      className={`h-3 w-3 ${
                        drone.battery < 30 ? 'animate-pulse text-rose-500' : 'text-emerald-500'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {drone.battery}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-brand-500 h-3 w-3" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {drone.speed} km/h
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {drone.alt} m
                    </span>
                  </div>
                </div>

                {/* Progress/Signal Bar */}
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${drone.status === 'flying' ? 100 : 0}%` }}
                    className={`absolute top-0 left-0 h-full ${drone.status === 'flying' ? 'bg-brand-500 shadow-[0_0_8px_#14b8a6]' : 'bg-slate-400'}`}
                  />
                </div>
              </div>

              {/* Action/Detail */}
              <div className="flex flex-col gap-2">
                <button className="bg-brand-500/5 hover:bg-brand-500/10 text-brand-500 border-brand-500/20 rounded-xl border p-2 transition-all">
                  <Radio className="h-4 w-4" />
                </button>
                <button className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-2 text-blue-500 transition-all hover:bg-blue-500/10">
                  <Shield className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && drones.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <div className="border-brand-500 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            <span className="text-brand-500/60 text-[10px] font-black tracking-widest uppercase">
              Initializing Telemetry...
            </span>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-6 dark:border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
            Active Missions
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white">
            {drones.filter((d) => d.status === 'flying').length}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">
            Avg Response Time
          </span>
          <span className="text-lg font-black text-emerald-500">1.2s</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardTaskMonitor;
