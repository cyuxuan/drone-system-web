import React from 'react';
import {
  ShieldCheck,
  Globe,
  Edit2,
  Trash2,
  Users,
  Phone,
  LogIn,
  Database,
  User as UserIcon,
} from 'lucide-react';
import { User } from '../../../types';
import DataTable, { PaginationConfig } from '../../../components/DataTable';
import { useAuth } from '../../../context/AuthContext';

interface UserTableProps {
  users: User[];
  loading: boolean;
  hasError?: boolean;
  errorType?: 'network' | 'api' | 'generic';
  onRetry?: () => void;
  selectedIds: number[];
  onSelectAll: () => void;
  onToggleSelect: (id: number) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
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
  const { hasPermission } = useAuth();
  const columns = React.useMemo(
    () => [
      {
        header: t('username'),
        className: 'pl-4',
        render: (user: User) => (
          <div className="flex items-center gap-4">
            <div className="bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-black shadow-inner">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-slate-900 uppercase dark:text-slate-100">
                {user.username}
              </span>
              {user.nickname && (
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {user.nickname}
                </span>
              )}
              <div className="mt-1 flex items-center gap-1 font-mono text-[8px] text-slate-400">
                <UserIcon className="h-2 w-2" />
                {user.userId}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: t('email'),
        render: (user: User) => (
          <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
            {user.email}
          </span>
        ),
      },
      {
        header: t('phoneNumber'),
        render: (user: User) => (
          <div className="flex items-center gap-2 font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
            <Phone className="h-3 w-3 text-slate-400" />
            {user.phone || '-'}
          </div>
        ),
      },
      {
        header: t('source'),
        render: (user: User) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase dark:text-slate-400">
              <Database className="h-3 w-3" />
              {user.source || 'SYSTEM'}
            </div>
            <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
              {user.loginType || 'PASSWORD'}
            </div>
          </div>
        ),
      },
      {
        header: t('lastLogin'),
        render: (user: User) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase dark:text-slate-400">
              <LogIn className="h-3 w-3" />
              {user.lastLoginTime || '-'}
            </div>
            {user.lastLoginIp && (
              <div className="font-mono text-[9px] font-medium text-slate-400 dark:text-slate-500">
                {user.lastLoginIp}
              </div>
            )}
          </div>
        ),
      },
      {
        header: t('role'),
        render: (user: User) => (
          <div className="bg-brand-500/5 border-brand-500/10 flex w-fit items-center gap-2 rounded-lg border px-3 py-1">
            <ShieldCheck className="text-brand-500/60 h-3 w-3" />
            <span className="text-brand-600 dark:text-brand-400 text-[9px] font-black tracking-widest uppercase">
              {user.role}
            </span>
          </div>
        ),
      },
      {
        header: t('status'),
        render: (user: User) => (
          <div className="flex items-center gap-2">
            <div
              className={`h-1.5 w-1.5 animate-pulse rounded-full ${user.status === 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-400'}`}
            />
            <span
              className={`text-[10px] font-black uppercase ${user.status === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
              {user.status === 0 ? t('operational') : t('disabled')}
            </span>
          </div>
        ),
      },
      {
        header: t('created'),
        className: 'px-6',
        render: (user: User) => (
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase dark:text-slate-500">
            <Globe className="text-brand-500/40 h-3.5 w-3.5" /> {user.createTime}
          </div>
        ),
      },
      {
        header: t('actions'),
        className: 'pr-14',
        align: 'right' as const,
        render: (user: User) => (
          <div className="flex items-center justify-end gap-2">
            {hasPermission('system:user:edit') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user);
                }}
                className="hover:bg-brand-500/10 hover:text-brand-500 rounded-lg p-2 text-slate-400 transition-all dark:text-slate-500"
                title={t('edit')}
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {hasPermission('system:user:delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(user.id);
                }}
                className="hover:bg-cinnabar-500/10 hover:text-cinnabar-500 rounded-lg p-2 text-slate-400 transition-all dark:text-slate-500"
                title={t('delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [t, onEdit, onDelete, hasPermission],
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      loading={loading}
      hasError={hasError}
      errorType={errorType}
      onRetry={onRetry}
      selectionConfig={{
        selectedIds,
        onSelectAll,
        onToggleSelect,
        allSelected: selectedIds.length === users.length && users.length > 0,
      }}
      emptyConfig={{
        icon: Users,
        title: t('emptyTargetIndex'),
        description: t('emptyTargetDesc'),
      }}
      paginationConfig={paginationConfig}
    />
  );
};

export default UserTable;
