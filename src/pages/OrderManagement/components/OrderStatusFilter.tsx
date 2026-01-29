import React from 'react';
import { Filter } from 'lucide-react';
import { OrderStatus } from '../../../types';

interface OrderStatusFilterProps {
  statusFilter: string | number;
  onFilterChange: (status: string | number) => void;
  t: (key: string) => string;
}

const OrderStatusFilter: React.FC<OrderStatusFilterProps> = ({
  statusFilter,
  onFilterChange,
  t,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Filter className="text-brand-500/50 h-4 w-4" />
        <div className="flex gap-2">
          {[
            { label: t('allViews'), value: 'All' },
            { label: t('statusPending'), value: OrderStatus.PENDING },
            { label: t('statusScheduled'), value: OrderStatus.SCHEDULED },
            { label: t('statusInProgress'), value: OrderStatus.IN_PROGRESS },
            { label: t('statusCancelled'), value: OrderStatus.CANCELLED },
            { label: t('statusCompleted'), value: OrderStatus.COMPLETED },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => onFilterChange(s.value)}
              className={`rounded-xl border px-4 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${statusFilter === s.value ? 'bg-brand-500 border-brand-500 text-white shadow-md' : 'bg-brand-500/5 border-brand-500/10 hover:bg-brand-500/10 text-slate-500 dark:text-slate-400'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusFilter;
