import React from 'react';
import { Box, Users, Plane, ShieldCheck } from 'lucide-react';

const StatsOverview: React.FC = () => {
  const stats = [
    { label: '总飞行时长', value: '12,840', unit: 'Hrs', icon: Plane, color: 'text-brand-500' },
    { label: '活跃无人机', value: '428', unit: 'Units', icon: Box, color: 'text-emerald-500' },
    { label: '注册飞手', value: '1,250', unit: 'Pilots', icon: Users, color: 'text-brand-500' },
    { label: '任务完成率', value: '99.8', unit: '%', icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-hud border-brand-500/10 group hover:border-brand-500/30 flex items-center gap-6 rounded-3xl border p-6 transition-all"
        >
          <div
            className={`bg-brand-500/5 border-brand-500/10 flex h-14 w-14 items-center justify-center rounded-2xl border ${stat.color} transition-transform duration-500 group-hover:scale-110`}
          >
            <stat.icon className="h-7 w-7" />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tabular-nums">{stat.value}</span>
              <span className="text-brand-500 text-[10px] font-black uppercase">{stat.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
