import React from 'react';
import {
  Trash2,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  Video,
  CreditCard,
  Calendar,
  Phone,
  Users,
  Fingerprint,
  MapPin,
  Clock,
} from 'lucide-react';
import { Customer, CustomerSource } from '../../../types';

import { useAppContext } from '../../../context';
import DataTable, { PaginationConfig, FetchConfig } from '../../../components/DataTable';

interface CustomerTableProps {
  customers?: Customer[];
  fetchConfig?: FetchConfig<Customer>;
  onDataChange?: (data: Customer[], total: number) => void;
  loading?: boolean;
  hasError?: boolean;
  errorType?: 'network' | 'api' | 'generic';
  onRetry?: () => void;
  selectedIds: string[];
  onSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: number) => void;
  paginationConfig?: PaginationConfig;
}

const SourceBadge = ({ source }: { source: CustomerSource }) => {
  const { t } = useAppContext();
  const configs = {
    WECHAT: {
      icon: MessageCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      label: t('wechatMP'),
    },
    DOUYIN: {
      icon: Video,
      color: 'text-fuchsia-500',
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/20',
      label: t('douyinMP'),
    },
    ALIPAY: {
      icon: CreditCard,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      label: t('alipayMP'),
    },
    MINIAPP: {
      // 兼容新数据结构中的 MINIAPP
      icon: MessageCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      label: t('wechatMP'),
    },
  };
  const config = configs[source] || configs.WECHAT;
  const { icon: Icon, color, bg, border, label } = config;
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${bg} ${border} ${color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
    </div>
  );
};

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  fetchConfig,
  onDataChange,
  loading = false,
  hasError = false,
  errorType = 'generic',
  onRetry,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  onDelete,
  onToggleStatus,
  paginationConfig,
}) => {
  const { t } = useAppContext();

  const columns = React.useMemo(
    () => [
      {
        header: t('nickname'),
        className: 'pl-4',
        render: (customer: Customer) => {
          const isDisabled = customer.status === 1;
          return (
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    customer.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.customerNo}`
                  }
                  alt={customer.nickname}
                  className={`h-12 w-12 rounded-2xl border-2 object-cover ${isDisabled ? 'border-cinnabar-500/50' : 'border-brand-500/20'}`}
                />
                <div
                  className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-950 ${isDisabled ? 'bg-cinnabar-500' : 'bg-emerald-500'}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight text-slate-900 uppercase dark:text-white">
                    {customer.nickname || '飞客'}
                  </span>
                  {isDisabled && (
                    <span title={t('disabled')}>
                      <ShieldAlert className="text-cinnabar-500 h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex gap-2">
                  <SourceBadge source={customer.source} />
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: t('phoneNumber'),
        render: (customer: Customer) => (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="text-brand-500 h-3 w-3" />
              <span className="font-mono text-xs font-bold">
                {customer.phone || customer.phoneNumber}
              </span>
            </div>
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
              NO: {customer.customerNo?.substring(0, 12)}...
            </span>
          </div>
        ),
      },
      {
        header: t('businessOverview'),
        render: (customer: Customer) => (
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 tabular-nums dark:text-white">
                {customer.totalOrders || 0}{' '}
                <span className="text-[9px] text-slate-400 uppercase">{t('orders')}</span>
              </span>
              <div className="bg-brand-500/10 mt-1.5 h-1 w-16 overflow-hidden rounded-full">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(((customer.totalOrders || 0) / 50) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        header: t('registerTime'),
        render: (customer: Customer) => {
          const date = customer.registerTime || customer.createTime;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="text-brand-500 h-3 w-3" />
                <span className="text-xs font-bold">
                  {date ? new Date(date).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                <MapPin className="h-2.5 w-2.5" />
                <span>IP: {customer.registerIp || '-'}</span>
              </div>
            </div>
          );
        },
      },
      {
        header: t('loginActivity'),
        render: (customer: Customer) => {
          const loginTime = customer.lastLoginTime;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock className="text-brand-500 h-3 w-3" />
                <span className="text-xs font-bold">
                  {loginTime ? new Date(loginTime).toLocaleDateString() : t('never')}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  <Fingerprint className="h-2.5 w-2.5" />
                  <span>{customer.loginType || '-'}</span>
                </div>
                {customer.lastLoginIp && (
                  <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                    <MapPin className="h-2.5 w-2.5" />
                    <span>IP: {customer.lastLoginIp}</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        header: t('actionMatrix'),
        className: 'pr-14',
        align: 'right' as const,
        render: (customer: Customer) => {
          const isDisabled = customer.status === 1;
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(customer.customerNo, customer.status);
                }}
                className={`rounded-xl p-2.5 shadow-sm transition-all ${
                  isDisabled
                    ? 'bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10'
                    : 'bg-cinnabar-500/5 text-cinnabar-500 hover:bg-cinnabar-500/10'
                }`}
                title={isDisabled ? t('active') : t('disabled')}
              >
                {isDisabled ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(customer.customerNo);
                }}
                className="rounded-xl p-2.5 text-slate-400 shadow-sm transition-all hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-500"
                title={t('delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [t, onDelete, onToggleStatus],
  );

  return (
    <DataTable
      data={customers}
      fetchConfig={fetchConfig}
      onDataChange={onDataChange}
      columns={columns}
      getRowKey={(customer) => customer.customerNo}
      loading={loading}
      hasError={hasError}
      errorType={errorType}
      onRetry={onRetry}
      selectionConfig={{
        selectedIds,
        onSelectAll,
        onToggleSelect: (id) => onToggleSelect(id as string),
        allSelected:
          (customers?.length || 0) > 0 && selectedIds.length === (customers?.length || 0),
      }}
      emptyConfig={{
        icon: Users,
        title: t('noCustomersFound'),
        description: t('noCustomersFoundDesc'),
      }}
      paginationConfig={paginationConfig}
    />
  );
};

export default CustomerTable;
