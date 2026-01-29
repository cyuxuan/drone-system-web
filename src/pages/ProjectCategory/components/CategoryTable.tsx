import React from 'react';
import { Edit2, Trash2, Hash, Layers } from 'lucide-react';
import { ProjectType } from '../../../types';
import { ErrorType } from '../../../utils/error';
import DataTable, { PaginationConfig } from '../../../components/DataTable';

interface CategoryTableProps {
  categories: ProjectType[];
  loading?: boolean;
  hasError?: boolean;
  errorType?: ErrorType;
  onRetry?: () => void;
  onEdit: (category: ProjectType) => void;
  onDelete: (typeNo: string) => void;
  onToggleStatus: (category: ProjectType) => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
  categoryTypeConfig: Record<number, { labelKey: string }>;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  loading,
  hasError,
  errorType,
  onRetry,
  onEdit,
  onDelete,
  onToggleStatus,
  paginationConfig,
  t,
  categoryTypeConfig,
}) => {
  const columns = React.useMemo(
    () => [
      {
        header: (
          <div className="flex items-center gap-2">
            <Hash className="text-brand-500 h-3 w-3" />
            {t('categoryNo')}
          </div>
        ),
        className: 'pl-4',
        render: (category: ProjectType) => (
          <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">
            #{category.typeNo}
          </span>
        ),
      },
      {
        header: t('categoryName'),
        render: (category: ProjectType) => (
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                {category.name}
              </div>
              <div className="mt-1 line-clamp-1 max-w-xs text-[10px] text-slate-400">
                {category.description}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: t('categoryCode'),
        render: (category: ProjectType) => (
          <span className="text-sm font-black tracking-wider text-slate-600 dark:text-slate-400">
            {category.code}
          </span>
        ),
      },
      {
        header: (
          <div className="flex items-center gap-2">
            <Layers className="text-brand-500 h-3 w-3" />
            {t('categoryType')}
          </div>
        ),
        render: (category: ProjectType) => (
          <span className="text-sm font-black text-slate-600 dark:text-slate-400">
            {categoryTypeConfig[category.category]?.labelKey
              ? t(categoryTypeConfig[category.category].labelKey)
              : category.category}
          </span>
        ),
      },
      {
        header: t('status'),
        render: (category: ProjectType) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(category);
            }}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all ${
              category.isActive === 1
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                category.isActive === 1
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
              }`}
            />
            {category.isActive === 1 ? t('disable') : t('enable')}
          </button>
        ),
      },
      {
        header: t('actions'),
        className: 'pr-14',
        align: 'right' as const,
        render: (category: ProjectType) => (
          <div className="flex items-center justify-end gap-2 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="hover:bg-brand-500/10 hover:text-brand-500 rounded-lg p-2 text-slate-400 transition-colors"
              title={t('edit')}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.typeNo);
              }}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
              title={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, onEdit, onDelete, onToggleStatus, categoryTypeConfig],
  );

  return (
    <DataTable
      data={categories}
      columns={columns}
      getRowKey={(category) => category.typeNo}
      loading={loading}
      hasError={hasError}
      errorType={errorType}
      onRetry={onRetry}
      emptyConfig={{
        icon: Layers,
        title: t('emptyTargetIndex'),
        description: t('emptyTargetDesc'),
      }}
      paginationConfig={paginationConfig}
    />
  );
};

export default CategoryTable;
