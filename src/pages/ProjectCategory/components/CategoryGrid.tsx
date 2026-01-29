import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Edit2, Trash2, AlertCircle, Package, ChevronDown, Loader2 } from 'lucide-react';
import { ProjectType } from '../../../types';
import { ErrorType } from '../../../utils/error';
import EmptyState from '../../../components/EmptyState';

import { PaginationConfig } from '../../../components/DataTable';

interface CategoryGridProps {
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

const CategoryGrid: React.FC<CategoryGridProps> = ({
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
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const displayCategories = React.useMemo(() => {
    if (!paginationConfig?.enabled) return categories;
    const currentPage = paginationConfig.currentPage || 1;
    const pageSize = paginationConfig.pageSize || 10;
    // Load More mode: show everything from page 1 to current page
    return categories.slice(0, currentPage * pageSize);
  }, [categories, paginationConfig]);

  const hasMore = React.useMemo(() => {
    if (!paginationConfig?.enabled) return false;
    const currentPage = paginationConfig.currentPage || 1;
    const pageSize = paginationConfig.pageSize || 10;
    const totalItems = paginationConfig.totalItems || 0;
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

  if (!loading && categories.length === 0) {
    return <EmptyState icon={Package} title={t('noData')} description={t('noDataDesc')} />;
  }

  return (
    <div className="space-y-12">
      <div className="grid transform-gpu grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <motion.div
                  key={`skeleton-${idx}`}
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
                  className="glass-hud border-brand-500/10 bg-brand-500/5 flex min-h-[320px] animate-pulse flex-col rounded-[2.5rem] border p-7"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="bg-brand-500/10 h-14 w-14 rounded-2xl" />
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-brand-500/5 h-7 w-20 rounded-xl" />
                      <div className="bg-brand-500/5 h-3 w-10 rounded" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="bg-brand-500/10 h-6 w-2/3 rounded-lg" />
                    <div className="bg-brand-500/10 h-0.5 w-10" />
                    <div className="space-y-2 pt-2">
                      <div className="bg-brand-500/5 h-3 w-full rounded-lg" />
                      <div className="bg-brand-500/5 h-3 w-4/5 rounded-lg" />
                      <div className="bg-brand-500/5 h-3 w-2/3 rounded-lg" />
                    </div>
                  </div>
                  <div className="border-brand-500/10 mt-auto flex items-center justify-between border-t pt-8">
                    <div className="flex gap-8">
                      <div className="space-y-2">
                        <div className="bg-brand-500/5 h-2.5 w-12 rounded" />
                        <div className="bg-brand-500/5 h-8 w-20 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <div className="bg-brand-500/5 h-2.5 w-12 rounded" />
                        <div className="bg-brand-500/5 h-8 w-20 rounded-xl" />
                      </div>
                    </div>
                    <div className="bg-brand-500/5 h-10 w-10 rounded-2xl" />
                  </div>
                </motion.div>
              ))
            : displayCategories.map((category, index) => (
                <motion.div
                  key={category.typeNo}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -8 }}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, opacity',
                  }}
                  className="group glass-hud border-brand-500/10 hover:border-brand-500/30 relative flex min-h-[320px] flex-col overflow-hidden rounded-[2.5rem] border shadow-2xl transition-colors"
                >
                  {/* Background Impact - Mesh Gradient & Noise */}
                  <div className="from-brand-500/3 to-brand-600/3 absolute inset-0 bg-linear-to-br via-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay dark:opacity-[0.05]"
                    style={{
                      backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
                    }}
                  />

                  <div className="bg-brand-500/10 absolute -top-32 -right-32 h-80 w-80 rounded-full blur-[120px] transition-transform duration-1000 group-hover:scale-125" />
                  <div className="bg-brand-600/5 absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-150" />

                  {/* Border Glow */}
                  <div className="border-brand-500/0 group-hover:border-brand-500/20 absolute inset-0 rounded-[2.5rem] border transition-colors duration-500" />

                  <div className="relative z-10 flex flex-1 flex-col p-8">
                    {/* Header Section */}
                    <div className="mb-8 flex items-start justify-between">
                      <div className="relative">
                        <div className="bg-brand-500/20 absolute inset-0 scale-0 rounded-3xl opacity-0 blur-2xl transition-transform duration-700 group-hover:scale-150 group-hover:opacity-100" />
                        <div className="from-brand-500/20 to-brand-600/5 border-brand-500/20 text-brand-500 group-hover:from-brand-500 group-hover:to-brand-600 relative flex h-16 w-16 items-center justify-center rounded-3xl border bg-linear-to-br transition-all duration-500 group-hover:-rotate-6 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(var(--brand-500-rgb),0.3)]">
                          <Tag className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <button
                          onClick={() => onToggleStatus(category)}
                          className={`rounded-2xl border px-4 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${
                            category.isActive === 1
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/40'
                              : 'border-slate-500/20 bg-slate-500/10 text-slate-500 group-hover:border-slate-500/40'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                category.isActive === 1
                                  ? 'animate-pulse bg-emerald-500 shadow-[0_0_10px_#10b981]'
                                  : 'bg-slate-500'
                              }`}
                            />
                            {category.isActive === 1 ? t('operational') : t('disabled')}
                          </span>
                        </button>
                        <div className="bg-brand-500/5 border-brand-500/10 rounded-lg border px-3 py-1">
                          <span className="text-brand-500/40 font-mono text-[11px] font-black tracking-widest">
                            #{category.typeNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <h3 className="group-hover:text-brand-500 text-2xl leading-none font-black tracking-tighter text-slate-900 uppercase transition-colors duration-300 dark:text-white">
                          {category.name}
                        </h3>
                        <div className="bg-brand-500/20 h-1 w-12 rounded-full transition-all duration-700 group-hover:w-24" />
                      </div>
                      <p className="line-clamp-3 text-[13px] leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                        {category.description ||
                          'No description available for this category. This section provides an overview of the category purposes and scope.'}
                      </p>
                    </div>

                    {/* Footer Section - Integrated Reveal */}
                    <div className="border-brand-500/10 relative mt-10 overflow-hidden border-t pt-8">
                      {/* Default State: Metadata */}
                      <div className="flex items-center justify-between transition-all duration-500 group-hover:-translate-y-6 group-hover:opacity-0">
                        <div className="flex gap-8">
                          <div className="flex flex-col">
                            <span className="mb-1.5 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
                              {t('categoryCode')}
                            </span>
                            <span className="group-hover:text-brand-500 font-mono text-sm font-black tracking-tight text-slate-700 transition-colors duration-300 dark:text-slate-300">
                              {category.code}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="mb-1.5 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">
                              {t('categoryType')}
                            </span>
                            <span className="group-hover:text-brand-500 text-sm font-black tracking-tight text-slate-700 transition-colors duration-300 dark:text-slate-300">
                              {categoryTypeConfig[category.category]?.labelKey
                                ? t(categoryTypeConfig[category.category].labelKey)
                                : category.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center">
                          <div className="bg-brand-500/20 group-hover:bg-brand-500 h-2 w-2 rounded-full transition-colors duration-500" />
                        </div>
                      </div>

                      {/* Hover State: Actions */}
                      <div className="pointer-events-none absolute inset-0 top-8 flex translate-y-6 items-center justify-between opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="text-brand-500/60 text-[10px] font-black tracking-[0.3em] uppercase">
                          {t('quickActions')}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(category);
                            }}
                            className="bg-brand-500/10 border-brand-500/20 text-brand-500 hover:bg-brand-500 group/btn flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 hover:text-white"
                          >
                            <Edit2 className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(category.typeNo);
                            }}
                            className="group/btn flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 transition-all duration-300 hover:bg-rose-500 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* Load More Section */}
      {paginationConfig?.enabled && (
        <div ref={loadMoreRef} className="mt-16 flex flex-col items-center gap-6">
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
                    {displayCategories.length} / {paginationConfig.totalItems || 0}
                  </span>
                </div>
              </div>
            </button>
          ) : categories.length > 0 ? (
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

export default CategoryGrid;
