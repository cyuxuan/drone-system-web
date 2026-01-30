import React from 'react';
import { Edit2, Trash2, Key, Tag } from 'lucide-react';
import { Permission } from '../../../types';
import DataTable, { PaginationConfig } from '../../../components/DataTable';
import { useAuth } from '../../../context/AuthContext';

interface PermissionTableProps {
  permissions: Permission[];
  loading: boolean;
  hasError?: boolean;
  errorType?: 'network' | 'api' | 'generic';
  onRetry?: () => void;
  onEdit: (permission: Permission) => void;
  onDelete: (id: string) => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  loading,
  hasError,
  errorType = 'generic',
  onRetry,
  onEdit,
  onDelete,
  paginationConfig,
  t,
}) => {
  const { hasPermission } = useAuth();

  const columns = React.useMemo(
    () => [
      {
        header: t('permissionName'),
        className: 'pl-4',
        render: (perm: Permission) => (
          <div className="flex items-center gap-4">
            <div className="border-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-400 flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-black shadow-inner">
              <Key className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-slate-900 uppercase dark:text-white">
                {t(perm.permissionName)}
              </span>
              <span className="[10px] font-medium tracking-tight text-slate-400">
                {perm.permissionCode}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t('module'),
        render: (perm: Permission) => (
          <div className="flex w-fit items-center gap-2 rounded-lg border border-slate-500/10 bg-slate-500/5 px-3 py-1">
            <Tag className="h-3 w-3 text-slate-500/60" />
            <span className="[9px] font-black tracking-widest text-slate-600 uppercase dark:text-slate-400">
              {perm.module ? t(perm.module) : t('none')}
            </span>
          </div>
        ),
      },
      {
        header: t('description'),
        render: (perm: Permission) => (
          <p className="line-clamp-1 max-w-xs text-sm font-medium text-slate-500 dark:text-slate-400">
            {perm.description || t('noDescription')}
          </p>
        ),
      },
      {
        header: t('createTime'),
        render: (perm: Permission) => (
          <span className="text-xs font-medium text-slate-400">
            {perm.createTime ? new Date(perm.createTime).toLocaleDateString() : '-'}
          </span>
        ),
      },
      {
        header: t('actions'),
        className: 'pr-14',
        align: 'right' as const,
        render: (perm: Permission) => (
          <div className="flex items-center justify-end gap-2">
            {hasPermission('system:permission:edit') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(perm);
                }}
                className="hover:bg-brand-500/10 hover:text-brand-500 rounded-lg p-2 text-slate-400 transition-all dark:text-slate-500"
                title={t('edit')}
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {hasPermission('system:permission:delete') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(perm.id);
                }}
                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-500"
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
      data={permissions}
      columns={columns}
      getRowKey={(perm) => perm.id}
      loading={loading}
      hasError={hasError}
      errorType={errorType}
      onRetry={onRetry}
      paginationConfig={paginationConfig}
      emptyConfig={{
        title: t('noPermissionsFound'),
      }}
    />
  );
};

export default PermissionTable;
