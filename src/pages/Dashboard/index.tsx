import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Radio,
  Zap,
  CircleDashed,
  Filter,
  ClipboardList,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '../../context';
import { api } from '../../services/api';
import { DroneOrder, OrderStatus, DashboardStats } from '../../types';
import { getErrorType, ErrorType } from '../../utils/error';
import OrderModal from '../OrderManagement/components/OrderModal';
import DashboardStatsGrid from './components/DashboardStatsGrid';
import DashboardQuickActions from './components/DashboardQuickActions';
import DashboardPendingMessages from './components/DashboardPendingMessages';
import DashboardOrderTable from './components/DashboardOrderTable';
import BulkActionHub from '../../components/BulkActionHub';
import DashboardRevenueChart from './components/DashboardRevenueChart';
import DashboardTaskMonitor from './components/DashboardTaskMonitor';
import DashboardBookingEntry from './components/DashboardBookingEntry';

import { perfMonitor } from '../../utils/performance';

const Dashboard = () => {
  const { t, theme, showMessage, confirm } = useAppContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    // 渲染完成后的处理
    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      perfMonitor.recordRenderTime(duration);
    });
  }, []);

  // Order Management State in Console
  const [orders, setOrders] = useState<DroneOrder[]>([]);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<DroneOrder> | null>(null);
  const [formData, setFormData] = useState<Partial<DroneOrder>>({
    projectName: '',
    clientName: '',
    amount: 0,
    status: OrderStatus.PENDING,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorType(null);
    try {
      const [statsData, ordersRes] = await Promise.all([api.getDashboardStats(), api.getOrders()]);
      setStats(statsData);
      setOrders(ordersRes.list || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setErrorType(getErrorType(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.planNo));
    }
  };

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleOpenEdit = (order: DroneOrder) => {
    setEditingOrder(order);
    setFormData({ ...order });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveOrder(formData);
      setIsModalOpen(false);
      loadData();
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingOrder ? t('authModification') : t('recordDeletion'),
      });
    } catch (error) {
      console.error('Failed to save order:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm(
      t('bulkDeleteOrdersDashboardConfirm').replace('{count}', selectedIds.length.toString()),
      {
        type: 'warning',
        title: t('delete'),
      },
    );

    if (isConfirmed) {
      try {
        for (const id of selectedIds) {
          // api.deleteOrder expects planNo (string)
          await api.deleteOrder(id as string);
        }
        setSelectedIds([]);
        loadData();
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to bulk delete orders:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    try {
      for (const id of selectedIds) {
        // Find the order to get its actual numeric id for saveOrder
        const order = orders.find((o) => o.planNo === id);
        if (order) {
          await api.saveOrder({ id: order.id, status: newStatus });
        }
      }
      setSelectedIds([]);
      loadData();
      showMessage({
        type: 'success',
        title: t('success'),
        message: t('authModification'),
      });
    } catch (error) {
      console.error('Failed to change bulk status:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  if (loading && !stats)
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6">
        <div className="relative">
          <CircleDashed className="text-brand-500 h-16 w-16 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="text-brand-600 h-6 w-6 animate-pulse" />
          </div>
        </div>
        <p className="animate-pulse text-[10px] font-black tracking-[0.5em] text-slate-400 uppercase dark:text-slate-500">
          {t('syncingTacticalFeed')}
        </p>
      </div>
    );

  return (
    <div className="flex flex-1 flex-col space-y-12 pb-24">
      {/* Console Header */}
      <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
        <div className="flex items-center gap-6">
          <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
            <LayoutDashboard className="text-brand-500 h-8 w-8 transition-transform group-hover:rotate-6" />
          </div>
          <div>
            <h1 className="flex items-center gap-4 text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('controlCenter')}
              <span className="not-font-black bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 rounded-2xl border px-4 py-1.5 text-[10px] tracking-[0.3em] uppercase shadow-sm">
                {t('commandDispatch')}
              </span>
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase dark:text-slate-400">
              <Zap className="text-brand-500 h-4 w-4 animate-pulse" /> {t('realTimeDashboard')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Row - Prominent Order Data */}
      <DashboardStatsGrid stats={stats} t={t} />

      {/* Operational Hub: Quick Actions, Messages, Booking Entry & Task Monitor */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-4">
          <DashboardQuickActions />
          <DashboardBookingEntry />
          <DashboardPendingMessages />
        </div>
        <div className="lg:col-span-8">
          <DashboardTaskMonitor />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-12">
        {/* Main Orders Command Center - List Layout like User Management */}
        <div className="xl:col-span-12">
          <div className="glass-hud border-brand-500/10 relative min-h-[400px] overflow-hidden rounded-[3.5rem] border bg-white/50 shadow-2xl dark:bg-slate-950/50">
            {loading ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-sm dark:bg-black/10">
                <div className="flex flex-col items-center gap-4">
                  <div className="border-brand-500/20 border-t-brand-500 h-12 w-12 animate-spin rounded-full border-4"></div>
                  <p className="text-brand-500 animate-pulse text-[10px] font-black tracking-[0.3em] uppercase">
                    {t('syncingProtocolData')}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="border-brand-500/10 bg-brand-500/3 flex flex-col items-center justify-between gap-6 border-b px-10 py-8 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="bg-brand-500/10 text-brand-500 border-brand-500/10 rounded-2xl border p-3">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-widest text-slate-900 uppercase dark:text-white">
                    {t('taskSchedulingPanorama')}
                  </h3>
                  <p className="mt-1 text-[9px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
                    {t('fleetOperationalRegistry')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="bg-brand-500/5 hover:bg-brand-500/10 text-brand-500 border-brand-500/10 rounded-xl border p-3 transition-colors">
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>

            <DashboardOrderTable
              orders={orders}
              loading={loading}
              hasError={!!errorType}
              onRetry={loadData}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onToggleSelect={handleToggleSelect}
              onEdit={handleOpenEdit}
              onDelete={(planNo) => {
                if (confirm(t('confirmCancel'))) api.deleteOrder(planNo).then(loadData);
              }}
            />
          </div>
        </div>

        {/* Secondary Console Metric - Trends */}
        <DashboardRevenueChart data={stats?.orderTrends || []} theme={theme} t={t} />
      </div>

      {/* Console Batch Hub */}
      <BulkActionHub
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        statusLabel={t('targetActive')}
        statusDesc={t('lockedTasks')}
        actions={[
          {
            label: t('bulkComplete'),
            icon: CheckCircle,
            onClick: () => handleBulkStatusChange(OrderStatus.COMPLETED),
            variant: 'success',
          },
          {
            label: t('bulkCancel'),
            icon: XCircle,
            onClick: () => handleBulkStatusChange(OrderStatus.CANCELLED),
            variant: 'warning',
          },
          {
            label: t('archiveProtocols'),
            icon: Trash2,
            onClick: handleBulkDelete,
            variant: 'danger',
          },
        ]}
      />

      {/* Order Modal Component */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingOrder={editingOrder}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
      />
    </div>
  );
};

export default Dashboard;
