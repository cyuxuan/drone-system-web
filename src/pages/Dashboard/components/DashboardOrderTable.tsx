import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Edit2,
  Trash2,
  ShoppingBag,
  Target,
  Clock,
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import { DroneOrder, OrderStatus } from '../../../types';
import { useAppContext } from '../../../context';

interface DashboardOrderTableProps {
  orders: DroneOrder[];
  loading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  selectedIds: (string | number)[];
  onSelectAll: () => void;
  onToggleSelect: (id: string | number) => void;
  onEdit: (order: DroneOrder) => void;
  onDelete: (planNo: string) => void;
}

const DashboardOrderTable: React.FC<DashboardOrderTableProps> = ({
  orders,
  loading,
  hasError,
  onRetry,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  const { t } = useAppContext();
  const allSelected = selectedIds.length === orders.length && orders.length > 0;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h3 className="mb-2 text-xl font-black tracking-widest text-slate-900 uppercase dark:text-white">
          {t('loadError')}
        </h3>
        <p className="mx-auto mb-8 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {t('loadErrorDesc')}
        </p>
        <button
          onClick={onRetry}
          className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/25 rounded-2xl px-8 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all"
        >
          {t('retryLoad')}
        </button>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
        <div className="bg-brand-500/10 border-brand-500/20 mb-6 flex h-20 w-20 items-center justify-center rounded-full border">
          <ShoppingBag className="text-brand-500 h-10 w-10" />
        </div>
        <h3 className="mb-2 text-xl font-black tracking-widest text-slate-900 uppercase dark:text-white">
          {t('emptyTargetIndex')}
        </h3>
        <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
          {t('emptyTargetDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      {/* Tactical Header */}
      <div className="bg-brand-500/2 border-brand-500/10 flex items-center border-b px-10 py-6">
        <div className="flex w-12 items-center justify-start">
          <button
            onClick={onSelectAll}
            className={`rounded-lg p-2 transition-all ${
              allSelected
                ? 'text-brand-500 bg-brand-500/10'
                : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {allSelected ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </button>
        </div>
        <div className="grid flex-1 grid-cols-12 items-center gap-4">
          <div className="col-span-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
            {t('taskNumber')}
          </div>
          <div className="col-span-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
            {t('projectClient')}
          </div>
          <div className="col-span-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
            {t('taskBudget')}
          </div>
          <div className="col-span-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
            {t('dispatchStatus')}
          </div>
          <div className="col-span-2 text-right text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
            {t('issueTime')}
          </div>
        </div>
        <div className="w-24" /> {/* Action Spacer */}
      </div>

      {/* Tactical Body */}
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout">
          {orders.map((order, index) => {
            const isSelected = selectedIds.includes(order.planNo);
            return (
              <motion.div
                key={order.planNo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group border-brand-500/5 relative flex items-center overflow-hidden border-b px-10 py-5 transition-all ${
                  isSelected ? 'bg-brand-500/3' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                }`}
              >
                {/* Active Scanning Line on Hover */}
                <div className="bg-brand-500 absolute top-0 left-0 h-full w-1 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="z-10 flex w-12 items-center justify-start">
                  <button
                    onClick={() => onToggleSelect(order.planNo)}
                    className={`rounded-lg p-2 transition-all ${
                      isSelected
                        ? 'text-brand-500 bg-brand-500/10 scale-110 shadow-sm'
                        : 'hover:text-brand-500/60 text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    {isSelected ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                </div>

                <div className="grid flex-1 grid-cols-12 items-center gap-4">
                  {/* Task Number */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Target
                        className={`h-3 w-3 ${
                          isSelected ? 'text-brand-500 animate-pulse' : 'text-slate-300'
                        }`}
                      />
                      <span
                        className={`rounded-md border px-2 py-1 font-mono text-[11px] font-black tracking-tighter uppercase transition-colors ${
                          isSelected
                            ? 'bg-brand-500/10 border-brand-500/20 text-brand-600'
                            : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {order.orderNumber}
                      </span>
                    </div>
                  </div>

                  {/* Project & Client */}
                  <div className="col-span-4">
                    <div className="flex flex-col">
                      <span className="group-hover:text-brand-500 text-[13px] font-black tracking-tight text-slate-800 uppercase transition-colors dark:text-slate-100">
                        {order.projectName}
                      </span>
                      <span className="mt-0.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                        {order.clientName}
                      </span>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-xs font-black text-slate-700 tabular-nums dark:text-slate-300">
                        {order.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            order.status === OrderStatus.COMPLETED
                              ? 'bg-emerald-500'
                              : order.status === OrderStatus.IN_PROGRESS
                                ? 'bg-brand-500 animate-pulse'
                                : 'bg-slate-400'
                          }`}
                        />
                        {order.status === OrderStatus.IN_PROGRESS && (
                          <div className="bg-brand-500 absolute inset-0 scale-150 animate-ping rounded-full opacity-40" />
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-black tracking-[0.2em] uppercase ${
                          order.status === OrderStatus.COMPLETED
                            ? 'text-emerald-500'
                            : order.status === OrderStatus.IN_PROGRESS
                              ? 'text-brand-500'
                              : 'text-slate-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono text-[10px] font-bold tracking-tighter uppercase">
                          {order.date}
                        </span>
                      </div>
                      <span className="text-brand-500/40 mt-0.5 text-[8px] font-black tracking-tighter uppercase">
                        T+0 SYNC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="z-10 flex w-24 items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(order);
                    }}
                    className="hover:text-brand-500 hover:bg-brand-500/10 rounded-xl p-2.5 text-slate-400 transition-all active:scale-90"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(order.planNo);
                    }}
                    className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500 active:scale-90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Panoramic Bottom Bar */}
      <div className="bg-brand-500/1 border-brand-500/5 flex items-center justify-between border-t px-10 py-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="text-brand-500 h-3.5 w-3.5" />
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {t('showingResultsCount')
                .replace('{count}', orders.length.toString())
                .replace('{total}', orders.length.toString())}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {t('linkStable')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-brand-500 h-1.5 w-1.5 animate-pulse rounded-full" />
          <span className="text-brand-500/60 text-[9px] font-black tracking-[0.3em] uppercase">
            Panorama Stream Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOrderTable;
