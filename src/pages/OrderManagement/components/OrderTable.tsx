import React from 'react';
import { Edit2, Trash2, User as UserIcon, DollarSign, Calendar, ShoppingBag } from 'lucide-react';
import { DroneOrder, OrderStatus } from '../../../types';
import DataTable, { PaginationConfig } from '../../../components/DataTable';

interface OrderTableProps {
  orders: DroneOrder[];
  loading: boolean;
  hasError?: boolean;
  errorType?: 'network' | 'api' | 'generic';
  onRetry?: () => void;
  selectedIds: (string | number)[];
  onSelectAll: () => void;
  onToggleSelect: (id: string | number) => void;
  onEdit: (order: DroneOrder) => void;
  onDelete: (id: string | number) => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading,
  hasError,
  errorType = 'generic',
  onRetry,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  onEdit,
  onDelete,
  paginationConfig,
  t,
}) => {
  const getStatusStyle = React.useCallback((status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case OrderStatus.IN_PROGRESS:
        return 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20';
      case OrderStatus.PENDING:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case OrderStatus.CANCELLED:
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case OrderStatus.SCHEDULED:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20';
    }
  }, []);

  const translateStatus = React.useCallback(
    (status: OrderStatus) => {
      // Map numeric status to translation key
      const statusMap: Record<number, string> = {
        [OrderStatus.PENDING]: 'statusPending',
        [OrderStatus.SCHEDULED]: 'statusScheduled',
        [OrderStatus.IN_PROGRESS]: 'statusInProgress',
        [OrderStatus.CANCELLED]: 'statusCancelled',
        [OrderStatus.COMPLETED]: 'statusCompleted',
      };
      return t(statusMap[status] || 'statusUnknown');
    },
    [t],
  );

  const columns = React.useMemo(
    () => [
      {
        header: t('taskNumber'),
        className: 'pl-4',
        width: 140,
        render: (order: DroneOrder) => (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-black tracking-tighter text-slate-900 uppercase dark:bg-slate-800 dark:text-slate-100">
            {order.orderNumber}
          </span>
        ),
      },
      {
        header: t('projectClient'),
        render: (order: DroneOrder) => (
          <div>
            <p className="text-brand-600 dark:text-brand-400 whitespace-nowrap text-sm font-black tracking-tight uppercase">
              {order.projectName}
            </p>
          </div>
        ),
      },
      {
        header: t('orderingCustomer'),
        render: (order: DroneOrder) => {
          const maskPhone = (phone?: string) => {
            if (!phone) return '--';
            if (phone.length < 7) return phone;
            return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
          };
          return (
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100">
                {order.clientName}
              </p>
              <p className="mt-0.5 text-[10px] font-medium tracking-wider text-slate-400 dark:text-slate-500">
                {maskPhone(order.phoneNumber)}
              </p>
            </div>
          );
        },
      },
      {
        header: t('pilotLabel'),
        render: (order: DroneOrder) => (
          <div className="flex items-center gap-3">
            <div className="bg-brand-500/10 text-brand-600 border-brand-500/10 flex h-8 w-8 items-center justify-center rounded-full border text-[9px] font-black">
              {order.pilotName ? order.pilotName.charAt(0) : <UserIcon className="h-3.5 w-3.5" />}
            </div>
            <span className="text-xs font-black text-slate-600 uppercase dark:text-slate-300">
              {order.pilotName || '--'}
            </span>
          </div>
        ),
      },
      {
        header: t('taskBudget'),
        render: (order: DroneOrder) => (
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-sm font-black text-slate-900 tabular-nums dark:text-slate-100">
              ${order.amount.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        header: t('status'),
        render: (order: DroneOrder) => (
          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[9px] font-black tracking-widest whitespace-nowrap uppercase ${getStatusStyle(order.status)}`}
          >
            <div
              className={`h-1.5 w-1.5 animate-pulse rounded-full ${order.status === OrderStatus.COMPLETED ? 'bg-emerald-500' : 'bg-brand-500'}`}
            />
            {translateStatus(order.status)}
          </div>
        ),
      },
      {
        header: t('issueTime'),
        render: (order: DroneOrder) => (
          <div className="flex items-center gap-2 whitespace-nowrap text-[10px] font-black text-slate-400 uppercase dark:text-slate-500">
            <Calendar className="text-brand-500/40 h-3.5 w-3.5" /> {order.date}
          </div>
        ),
      },
      {
        header: t('control'),
        className: 'pr-14',
        align: 'right' as const,
        render: (order: DroneOrder) => (
          <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity whitespace-nowrap group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(order);
              }}
              className="hover:bg-brand-500/10 hover:text-brand-500 rounded-lg p-2 text-slate-400 transition-all dark:text-slate-500"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order.id);
              }}
              className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, onEdit, onDelete, getStatusStyle, translateStatus],
  );

  return (
    <DataTable
      data={orders}
      columns={columns}
      getRowKey={(o) => o.planNo}
      loading={loading}
      hasError={hasError}
      errorType={errorType}
      onRetry={onRetry}
      selectionConfig={{
        selectedIds,
        onSelectAll,
        onToggleSelect,
        allSelected: selectedIds.length === orders.length && orders.length > 0,
      }}
      emptyConfig={{
        icon: ShoppingBag,
        title: t('emptyTargetIndex'),
        description: t('emptyTargetDesc'),
      }}
      paginationConfig={paginationConfig}
    />
  );
};

export default OrderTable;
