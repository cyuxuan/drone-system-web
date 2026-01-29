import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export interface HUDCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  index: number;
  trend?: Array<{ value: number }>;
  subMetrics?: Array<{ label: string; value: number | string; color: string }>;
}

const HUDCard = memo(
  ({ title, value, change, icon: Icon, index, trend, subMetrics }: HUDCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      className="group relative h-full rounded-3xl"
    >
      {/* Background Glow */}
      <div className="bg-brand-500/5 absolute inset-0 rounded-3xl opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />

      <div className="glass-hud border-brand-500/10 hover:border-brand-500/30 relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/40 p-6 backdrop-blur-xl transition-all duration-500 dark:bg-slate-950/40">
        {/* Corner Accents */}
        <div className="border-brand-500/30 absolute top-4 left-4 h-1.5 w-1.5 border-t border-l" />
        <div className="border-brand-500/30 absolute right-4 bottom-4 h-1.5 w-1.5 border-r border-b" />

        {/* Decorative Scanning Line */}
        <div className="via-brand-500/20 group-hover:animate-scan absolute top-0 right-0 left-0 h-px -translate-y-full bg-linear-to-r from-transparent to-transparent" />

        <div className="relative z-10 mb-4 flex items-start justify-between">
          <div className="bg-brand-500/10 dark:bg-brand-500/15 border-brand-500/20 text-brand-500 rounded-xl border p-3 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <Icon className="h-5 w-5" />
          </div>
          <div
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-black tracking-widest shadow-lg transition-colors ${
              change >= 0
                ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-500'
                : 'border-rose-500/10 bg-rose-500/5 text-rose-500'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        </div>

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500/40 h-1 w-1 rounded-full" />
            <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
              {title}
            </p>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex flex-col">
              <h3 className="flex items-center gap-2 text-3xl font-black tracking-tighter text-slate-900 tabular-nums dark:text-white">
                {value}
                <div className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_10px_#14b8a6]" />
              </h3>
              <span className="text-brand-500/30 mt-0.5 text-[7px] font-black tracking-[0.3em] uppercase">
                Live Data Link
              </span>
            </div>
            {trend && (
              <div className="h-8 w-20 opacity-30 transition-opacity duration-700 group-hover:opacity-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#14b8a6"
                      fill="url(#colorTrend)"
                      strokeWidth={1.5}
                    />
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Sub-metrics Display */}
          {subMetrics && subMetrics.length > 0 && (
            <div className="border-brand-500/10 relative z-10 mt-4 grid grid-cols-3 gap-2 border-t pt-4">
              {subMetrics.map((metric, i) => (
                <div key={i} className="flex flex-col">
                  <span className="mb-0.5 truncate text-[7px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                    {metric.label}
                  </span>
                  <span className={`text-[10px] font-black ${metric.color} tabular-nums`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  ),
);

export default HUDCard;
