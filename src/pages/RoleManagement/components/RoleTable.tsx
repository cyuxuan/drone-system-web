import React from 'react';
import { Shield, Edit2, Trash2, Users, Key } from 'lucide-react';
import { Role } from '../../../types';
import DataTable, { PaginationConfig } from '../../../components/DataTable';

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  hasError?: boolean;
  errorType?: 'network' | 'api' | 'generic';
  onRetry?: () => void;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onViewMembers: (role: Role) => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
}

const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  loading,
  hasError,
  errorType = 'generic',
  onRetry,
  onEdit,
  onDelete,
  onViewMembers,
  paginationConfig,
  t,
}) => {
  const columns = React.useMemo(
    () => [
      {
        header: t('roleName'),
        className: 'pl-4',
        render: (role: Role) => (
          <div className="flex items-center gap-4">
            <div className="bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-black shadow-inner">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 uppercase dark:text-white">
              {role.name}
            </span>
          </div>
        ),
      },
      {
        header: t('description'),
        render: (role: Role) => (
          <p className="line-clamp-1 max-w-xs text-sm font-medium text-slate-500 dark:text-slate-400">
            {role.description || t('noDescription')}
          </p>
        ),
      },
      {
        header: t('permissions'),
        render: (role: Role) => (
          <div className="bg-brand-500/5 border-brand-500/10 flex w-fit items-center gap-2 rounded-lg border px-3 py-1">
            <Key className="text-brand-500/60 h-3 w-3" />
            <span className="text-brand-600 dark:text-brand-400 text-[9px] font-black tracking-widest uppercase">
              {role.permissions.length} {t('permissions')}
            </span>
          </div>
        ),
      },
      {
        header: t('actions'),
        className: 'pr-14',
        align: 'right' as const,
        render: (role: Role) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewMembers(role);
              }}
              className="hover:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center gap-2 rounded-lg px-3 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all"
              title={t('viewUsers')}
            >
              <Users className="h-3.5 w-3.5" />
              {t('viewUsers')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(role);
              }}
              className="hover:bg-brand-500/10 hover:text-brand-500 rounded-lg p-2 text-slate-400 transition-all dark:text-slate-500"
              title={t('edit')}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(role.id);
              }}
              className="hover:bg-cinnabar-500/10 hover:text-cinnabar-500 rounded-lg p-2 text-slate-400 transition-all dark:text-slate-500"
              title={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, onEdit, onDelete, onViewMembers],
  );

  return (
    <DataTable
      data={roles}
      columns={columns}
      getRowKey={(role) => role.id}
      loading={loading}
      hasError={hasError}
      errorType={errorType}
      onRetry={onRetry}
      emptyConfig={{
        icon: Shield,
        title: t('emptyTargetIndex'),
        description: t('emptyTargetDesc'),
      }}
      paginationConfig={paginationConfig}
    />
  );
};

export default RoleTable;
