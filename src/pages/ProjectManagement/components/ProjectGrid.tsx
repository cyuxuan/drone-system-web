import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Edit3,
  Trash2,
  AlertCircle,
  Activity,
  ShieldCheck,
  Zap,
  Target,
  Package,
  ChevronDown,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import { DroneProject } from '../../../types';
import { ErrorType } from '../../../utils/error';
import EmptyState from '../../../components/EmptyState';

import { PaginationConfig } from '../../../components/DataTable';

interface ProjectGridProps {
  projects: DroneProject[];
  loading: boolean;
  hasError?: boolean;
  errorType?: ErrorType;
  onRetry?: () => void;
  typeConfig: Record<
    string,
    { icon: LucideIcon; gradient: string; text: string; labelKey: string }
  >;
  onEdit: (project: DroneProject) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (project: DroneProject) => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
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
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const displayProjects = React.useMemo(() => {
    if (!paginationConfig?.enabled) return projects;
    const { currentPage = 1, pageSize = 9 } = paginationConfig;
    // Load More mode: show everything from page 1 to current page
    return projects.slice(0, currentPage * pageSize);
  }, [projects, paginationConfig]);

  const hasMore = React.useMemo(() => {
    if (!paginationConfig?.enabled) return false;
    const { currentPage = 1, pageSize = 9, totalItems = 0 } = paginationConfig;
    return currentPage * pageSize < totalItems;
  }, [paginationConfig]);

  const handleLoadMore = React.useCallback(() => {
    if (hasMore && !loading && paginationConfig?.onPageChange) {
      paginationConfig.onPageChange((paginationConfig.currentPage || 1) + 1);
    }
  }, [hasMore, loading, paginationConfig]);

  // Infinite Scroll Observer
  React.useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, handleLoadMore]);

  if (hasError) {
    return (
      <EmptyState
        isError={true}
        icon={AlertCircle}
        title={
          errorType === 'network'
            ? t('networkError')
            : errorType === 'api'
              ? t('apiError')
              : t('loadError')
        }
        description={
          errorType === 'network'
            ? t('networkErrorDesc')
            : errorType === 'api'
              ? t('apiErrorDesc')
              : t('loadErrorDesc')
        }
        actionLabel={t('retryLoad')}
        onAction={onRetry}
      />
    );
  }

  if (!loading && projects.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={t('emptyTargetIndex')}
        description={t('emptyTargetDesc')}
        actionLabel={t('resetSearch')}
        onAction={onRetry}
      />
    );
  }

  return (
    <div className="relative grid min-h-[400px] grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {loading
          ? [...Array(6)].map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                willChange: 'opacity, transform',
              }}
              className="glass-hud bg-brand-500/5 border-brand-500/10 relative flex min-h-[450px] flex-col overflow-hidden rounded-[2.5rem] border p-8"
            >
              <div className="mb-8 flex items-start justify-between">
                <div className="bg-brand-500/10 h-14 w-14 animate-pulse rounded-2xl" />
                <div className="bg-brand-500/10 h-6 w-24 animate-pulse rounded-lg" />
              </div>
              <div className="space-y-4">
                <div className="bg-brand-500/10 h-8 w-3/4 animate-pulse rounded-lg" />
                <div className="bg-brand-500/5 h-24 w-full animate-pulse rounded-2xl" />
              </div>
              <div className="border-brand-500/5 mt-auto border-t pt-8">
                <div className="bg-brand-500/10 h-20 w-full animate-pulse rounded-4xl" />
              </div>
            </motion.div>
          ))
          : displayProjects.map((p, index) => {
            const config = typeConfig[p.typeNo] || Object.values(typeConfig)[0] || {
              icon: Package,
              gradient: 'from-slate-400/10 to-slate-600/10',
              text: 'text-slate-600 dark:text-slate-400',
              labelKey: 'unknown',
            };
            const isActive = p.isActive === 1;

            return (
              <motion.div
                key={p.projectNo}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.03,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group glass-hud hover:border-brand-500/30 relative flex min-h-[450px] flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white/40 transition-all duration-500 dark:border-slate-800/50 dark:bg-slate-950/40"
              >
                {/* Background Accents */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${config.gradient} opacity-0 transition-opacity duration-700 group-hover:opacity-10`}
                />
                <div className="bg-brand-500/10 absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 blur-[100px] transition-transform duration-1000 group-hover:scale-150" />

                {/* Header Section */}
                <div className="relative z-10 p-8 pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div
                        className={`group-hover:border-brand-500/50 relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-inner transition-all duration-500 group-hover:rotate-10 dark:border-slate-800 dark:bg-slate-900 ${config.text}`}
                      >
                        <Package className="relative z-10 h-8 w-8" />
                        <div className="bg-brand-500/10 absolute inset-0 scale-0 rounded-2xl transition-transform duration-500 group-hover:scale-100" />
                      </div>
                      <div
                        className={`h-16 w-16 rounded-2xl bg-linear-to-br ${config.gradient} flex items-center justify-center border border-white/20 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 dark:border-slate-800/20`}
                      >
                        <config.icon className={`h-8 w-8 ${config.text}`} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div
                        className={`rounded-full border px-4 py-1.5 text-[9px] font-black tracking-[0.2em] uppercase shadow-sm ${isActive
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                            : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                          }`}
                      >
                        {isActive ? t('operational') : t('disabled')}
                      </div>
                      <span className="mt-2 text-[8px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-600">
                        ID: {p.projectCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="relative z-10 flex-1 px-8 py-6">
                  <h3 className="group-hover:text-brand-500 mb-3 text-xl font-black tracking-tight text-slate-900 uppercase transition-colors dark:text-white">
                    {p.projectName}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed font-medium text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                    {p.description}
                  </p>

                  {/* Tactical Metrics (Decorations) */}
                  <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-8 dark:border-slate-900">
                    <div className="space-y-1">
                      <Activity className="text-brand-500/50 h-3 w-3" />
                      <div className="text-[8px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-600">
                        Efficiency
                      </div>
                      <div className="text-xs font-black tracking-tight text-slate-700 dark:text-slate-300">
                        98.2%
                      </div>
                    </div>
                    <div className="space-y-1 border-x border-slate-100 px-4 dark:border-slate-900">
                      <ShieldCheck className="h-3 w-3 text-emerald-500/50" />
                      <div className="text-[8px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-600">
                        Safety
                      </div>
                      <div className="text-xs font-black tracking-tight text-slate-700 dark:text-slate-300">
                        Level A
                      </div>
                    </div>
                    <div className="space-y-1 pl-2">
                      <Zap className="h-3 w-3 text-amber-500/50" />
                      <div className="text-[8px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-600">
                        Response
                      </div>
                      <div className="text-xs font-black tracking-tight text-slate-700 dark:text-slate-300">
                        Fast
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer / Price Section */}
                <div className="relative z-10 mt-auto p-8 pt-0">
                  <div className="group-hover:border-brand-500/20 flex items-center justify-between rounded-4xl border border-slate-100 bg-slate-50 p-6 transition-all duration-500 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-500/10 border-brand-500/10 flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110">
                        <DollarSign className="text-brand-500 h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                          {t('projectPrice')} / {p.unit}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black tracking-tighter text-slate-900 tabular-nums dark:text-white">
                            {p.projectPrice.toLocaleString()}
                          </span>
                          <span className="text-brand-500 text-[10px] font-black uppercase">
                            CNY
                          </span>
                        </div>
                      </div>
                    </div>
                    <Target className="text-brand-500/20 group-hover:text-brand-500/50 h-5 w-5 transition-colors" />
                  </div>

                  {/* Actions Overlay */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => onToggleStatus(p)}
                      className={`group/status relative h-14 flex-1 overflow-hidden rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${isActive
                          ? 'hover:text-brand-500 bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                          : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95'
                        }`}
                    >
                      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover/status:translate-x-full" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${isActive
                              ? 'group-hover/status:bg-brand-500 bg-slate-400 dark:bg-slate-600'
                              : 'animate-pulse bg-white'
                            }`}
                        />
                        {isActive ? t('disable') : t('enable')}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="hover:border-brand-500 hover:text-brand-500 group/edit relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                      >
                        <div className="bg-brand-500/0 group-hover/edit:bg-brand-500/5 absolute inset-0 transition-colors" />
                        <Edit3 className="relative z-10 mx-auto h-5 w-5 transition-transform group-hover/edit:scale-110 group-hover/edit:rotate-12" />
                        <div className="bg-brand-500 absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full transition-transform group-hover/edit:scale-100" />
                      </button>

                      <button
                        onClick={() => onDelete(p.projectNo)}
                        className="group/del relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 transition-all duration-300 hover:border-rose-500 hover:text-rose-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                      >
                        <div className="absolute inset-0 bg-rose-500/0 transition-colors group-hover/del:bg-rose-500/5" />
                        <Trash2 className="relative z-10 mx-auto h-5 w-5 transition-transform group-hover/del:scale-110 group-hover/del:rotate-12" />
                        <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-rose-500 transition-transform group-hover/del:scale-100" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* Load More Section */}
      {paginationConfig?.enabled && (
        <div
          ref={loadMoreRef}
          className="col-span-1 mt-16 flex flex-col items-center gap-6 md:col-span-2 xl:col-span-3"
        >
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="group relative flex flex-col items-center gap-4 transition-all duration-500"
            >
              {/* Load More Arrow Button */}
              <div className="glass-hud border-brand-500/10 group-hover:border-brand-500 group-hover:text-brand-500 relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border text-slate-400 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(var(--brand-500-rgb),0.2)] dark:text-slate-500">
                <div className="bg-brand-500/0 group-hover:bg-brand-500/5 absolute inset-0 transition-colors" />
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <ChevronDown className="h-8 w-8 transition-transform duration-500 group-hover:translate-y-1" />
                )}
              </div>

              {/* Status Text */}
              <div className="flex flex-col items-center gap-1">
                <span className="group-hover:text-brand-500 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase transition-colors dark:text-slate-500">
                  {loading ? t('loading') : t('loadMore')}
                </span>
                <div className="bg-brand-500/5 border-brand-500/10 rounded-full border px-4 py-1.5">
                  <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
                    {displayProjects.length} / {paginationConfig.totalItems || 0}
                  </span>
                </div>
              </div>
            </button>
          ) : projects.length > 0 ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="bg-brand-500/20 h-1.5 w-1.5 rounded-full" />
              <span className="text-[10px] font-black tracking-[0.4em] text-slate-300 uppercase dark:text-slate-600">
                {t('allLoaded')}
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProjectGrid;
