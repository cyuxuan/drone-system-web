import React from 'react';
import { ShoppingBag, DollarSign, Activity, Users, MapPin, Zap } from 'lucide-react';
import HUDCard from '../../../components/HUDCard';
import { DashboardStats } from '../../../types';

interface DashboardStatsGridProps {
  stats: DashboardStats | null;
  t: (key: string) => string;
}

const WEEKLY_ORDERS_TREND = [
  { value: 40 },
  { value: 30 },
  { value: 60 },
  { value: 80 },
  { value: 50 },
  { value: 90 },
];

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats, t }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <HUDCard
        index={0}
        title={t('weeklyOrders')}
        value={stats?.weeklyOrders || 0}
        change={14.2}
        icon={ShoppingBag}
        trend={WEEKLY_ORDERS_TREND}
        subMetrics={[
          { label: t('pendingOrders'), value: 12, color: 'text-brand-500' },
          { label: t('matchedInProgress'), value: 33, color: 'text-emerald-500' },
        ]}
      />
      <HUDCard
        index={1}
        title={t('totalRevenue')}
        value={`$${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`}
        change={8.4}
        icon={DollarSign}
        subMetrics={[
          { label: t('cashRevenue'), value: '$1.1M', color: 'text-emerald-500' },
          { label: t('creditRevenue'), value: '$85k', color: 'text-brand-500' },
        ]}
      />
      <HUDCard
        index={2}
        title={t('activePilots')}
        value={stats?.activePilots || 0}
        change={-2.1}
        icon={Activity}
        subMetrics={[
          { label: t('onDutyPilots'), value: '84', color: 'text-brand-500' },
          { label: t('restingPilots'), value: '62', color: 'text-slate-400' },
        ]}
      />
      <HUDCard
        index={3}
        title={t('onlineUsers')}
        value={stats?.onlineUsers || 0}
        change={28.5}
        icon={Users}
        subMetrics={[
          { label: t('mobileUsers'), value: '942', color: 'text-brand-500' },
          { label: t('desktopUsers'), value: '312', color: 'text-emerald-500' },
        ]}
      />
      <HUDCard
        index={4}
        title={t('matchedOrders')}
        value={128}
        change={12.5}
        icon={MapPin}
        subMetrics={[
          { label: t('signalScanning'), value: 'Active', color: 'text-brand-500' },
          { label: t('searchingNearby'), value: 'Running', color: 'text-emerald-500' },
        ]}
      />
      <HUDCard
        index={5}
        title={t('realTimeMetrics')}
        value="98.2%"
        change={0.5}
        icon={Zap}
        subMetrics={[
          { label: t('battery'), value: 'High', color: 'text-emerald-500' },
          { label: t('speed'), value: 'Stable', color: 'text-brand-500' },
        ]}
      />
    </div>
  );
};

export default DashboardStatsGrid;
