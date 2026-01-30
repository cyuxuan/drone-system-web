import React from 'react';
import { DollarSign, Edit3, Trash2, Package, LucideIcon } from 'lucide-react';
import { DroneProject } from '../../../types';
import { ErrorType } from '../../../utils/error';
import DataTable, { PaginationConfig } from '../../../components/DataTable';

interface ProjectTableProps {
  projects: DroneProject[];
  loading?: boolean;
  hasError?: boolean;
  errorType?: ErrorType;
  onRetry?: () => void;
  typeConfig: Record<string, { icon: LucideIcon; text: string; labelKey: string }>;
  onEdit: (project: DroneProject) => void;
  onDelete: (projectNo: string) => void;
  onToggleStatus: (project: DroneProject) => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading,
  hasError,
  errorType,
  onRetry,
  typeConfig,
  onEdit,
  onDelete,
  onToggleStatus,
  paginationConfig,
  t,
}) => {
  const columns = React.useMemo(
    () => [
      {
        header: t('projectTitle'),
        className: 'pl-4',
        render: (p: DroneProject) => {
          const config = typeConfig[p.typeNo] ||
            Object.values(typeConfig)[0] || {
              icon: Package,
              gradient: 'from-slate-400/10 to-slate-600/10',
              text: 'text-slate-600 dark:text-slate-400',
              labelKey: 'unknown',
            };
          return (
            <div className="flex items-center gap-4">
              <div
                className={`bg-brand-500/10 border-brand-500/10 rounded-xl border p-2.5 ${config.text}`}
              >
                <config.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-slate-900 uppercase dark:text-white">
                  {p.projectName}
                </p>
                <p className="mt-0.5 text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  {t(config.labelKey)} | {p.projectCode}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: t('clientInformation'),
        render: (p: DroneProject) => (
          <p className="max-w-xs truncate text-[11px] leading-relaxed font-bold text-slate-500 dark:text-slate-400">
            {p.description}
          </p>
        ),
      },
      {
        header: t('status'),
        align: 'center' as const,
        render: (p: DroneProject) => (
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(p);
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all ${p.isActive === 1 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600' : 'border-amber-500/20 bg-amber-500/10 text-amber-600'}`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${p.isActive === 1 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}
              />
              {p.isActive === 1 ? t('disable') : t('enable')}
            </button>
          </div>
        ),
      },
      {
        header: t('projectPrice'),
        render: (p: DroneProject) => (
          <div className="flex items-center gap-1.5 tabular-nums">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100">
              {p.projectPrice}
            </span>
            <span className="ml-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
              / {p.unit}
            </span>
          </div>
        ),
      },
      {
        header: t('managementControl'),
        className: 'pr-14',
        align: 'right' as const,
        render: (p: DroneProject) => (
          <div className="flex translate-x-2 transform items-center justify-end gap-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(p);
              }}
              className="hover:text-brand-500 hover:bg-brand-500/5 rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p.projectNo);
              }}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-rose-500/5 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, typeConfig, onEdit, onDelete, onToggleStatus],
  );

  return (
    <DataTable
      data={projects}
      columns={columns}
      getRowKey={(p) => p.projectNo}
      loading={loading}
      hasError={hasError}
      errorType={errorType}
      onRetry={onRetry}
      emptyConfig={{
        icon: Package,
        title: t('noProjectsFound'),
        description: t('noProjectsFoundDesc'),
      }}
      paginationConfig={paginationConfig}
    />
  );
};

export default ProjectTable;
