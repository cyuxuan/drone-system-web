import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Send, Target, Users } from 'lucide-react';
import { useAppContext } from '../../../context';

const DashboardBookingEntry: React.FC = () => {
  const { t } = useAppContext();
  const [formData, setFormData] = useState({
    location: '',
    type: 'Photography',
    date: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="glass-hud border-brand-500/10 group/panel relative overflow-hidden rounded-4xl border bg-white/40 p-8 shadow-2xl backdrop-blur-xl dark:bg-slate-950/40">
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-500/10 text-brand-500 border-brand-500/20 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-[0.2em] text-slate-900 uppercase dark:text-white">
              {t('quickBooking')}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="bg-brand-500/30 h-0.5 w-12" />
              <span className="text-brand-500/60 text-[8px] font-black tracking-widest uppercase">
                {t('fleetStatus')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="space-y-4">
          <div className="group/field relative">
            <label className="mb-2 block text-[9px] font-black tracking-widest text-slate-400 uppercase">
              {t('missionLocation')}
            </label>
            <div className="relative">
              <div className="group-focus-within/field:text-brand-500 absolute inset-y-0 left-4 flex items-center text-slate-400 transition-colors">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Enter coordinates or address..."
                className="focus:border-brand-500/50 w-full rounded-2xl border border-slate-200/50 bg-white/50 py-4 pr-4 pl-12 text-sm font-bold text-slate-800 transition-all outline-none focus:bg-white focus:shadow-lg dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group/field relative">
              <label className="mb-2 block text-[9px] font-black tracking-widest text-slate-400 uppercase">
                {t('serviceType')}
              </label>
              <div className="relative">
                <div className="group-focus-within/field:text-brand-500 absolute inset-y-0 left-4 flex items-center text-slate-400 transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <select
                  className="focus:border-brand-500/50 w-full appearance-none rounded-2xl border border-slate-200/50 bg-white/50 py-4 pr-4 pl-12 text-sm font-bold text-slate-800 transition-all outline-none focus:bg-white focus:shadow-lg dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Photography">{t('photography')}</option>
                  <option value="Agricultural">{t('agricultural')}</option>
                  <option value="Inspection">{t('inspection')}</option>
                  <option value="Delivery">{t('delivery')}</option>
                </select>
              </div>
            </div>

            <div className="group/field relative">
              <label className="mb-2 block text-[9px] font-black tracking-widest text-slate-400 uppercase">
                {t('launchDate')}
              </label>
              <div className="relative">
                <div className="group-focus-within/field:text-brand-500 absolute inset-y-0 left-4 flex items-center text-slate-400 transition-colors">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="focus:border-brand-500/50 w-full rounded-2xl border border-slate-200/50 bg-white/50 py-4 pr-4 pl-12 text-sm font-bold text-slate-800 transition-all outline-none focus:bg-white focus:shadow-lg dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-brand-500 hover:bg-brand-600 relative w-full overflow-hidden rounded-2xl py-5 text-[10px] font-black tracking-[0.3em] text-white uppercase shadow-2xl transition-all"
        >
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            <span>{t('deployMission')}</span>
          </div>
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-white/0 via-white/20 to-white/0 group-hover:animate-[shimmer_1.5s_infinite]" />
        </motion.button>
      </div>
    </div>
  );
};

export default DashboardBookingEntry;
