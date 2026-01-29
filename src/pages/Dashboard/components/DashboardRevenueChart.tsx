import React from 'react';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface DashboardRevenueChartProps {
  data: Array<{ name: string; orders: number; revenue: number }>;
  theme: 'light' | 'dark';
  t: (key: string) => string;
}

const DashboardRevenueChart: React.FC<DashboardRevenueChartProps> = ({ data, theme, t }) => {
  return (
    <div className="xl:col-span-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-hud rounded-6xl group border-brand-500/5 relative bg-white/50 p-10 shadow-2xl dark:bg-slate-950/50"
      >
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-[0.2em] text-slate-900 uppercase dark:text-white">
                {t('revenueDistribution')}
              </h3>
              <p className="text-brand-500 mt-2 text-[9px] font-black tracking-[0.4em] uppercase">
                {t('throughputTrend')}
              </p>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorJade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="10 10"
                vertical={false}
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(20,184,166,0.05)'}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.toUpperCase()}
                tick={{
                  fill: theme === 'dark' ? '#64748b' : '#94a3b8',
                  fontSize: 10,
                  fontWeight: 900,
                }}
                dy={20}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: theme === 'dark' ? '#64748b' : '#94a3b8',
                  fontSize: 10,
                  fontWeight: 900,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: theme === 'dark' ? '#64748b' : '#94a3b8',
                  fontSize: 10,
                  fontWeight: 900,
                }}
              />
              <Tooltip
                cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '5 5' }}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#0a1111' : '#ffffff',
                  borderColor: 'rgba(20, 184, 166, 0.2)',
                  borderRadius: '1.5rem',
                  border: '1px solid',
                  padding: '1.5rem',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                }}
                itemStyle={{
                  fontSize: '11px',
                  fontWeight: 900,
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#14b8a6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorJade)"
                name={t('revenue')}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorBrand)"
                name={t('orders')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardRevenueChart;
