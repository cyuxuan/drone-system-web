import React, { useState } from 'react';
import { LucideIcon, AlertCircle, Inbox, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useAppContext } from '../context';
import Pagination from './Pagination';

export interface Column<T> {
  header: React.ReactNode;
  key?: string;
  className?: string;
  cellClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  useBaseHeaderClass?: boolean;
  useBaseCellClass?: boolean;
}

const DEFAULT_HEADER_CLASS =
  'px-6 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em]';

export interface PaginationConfig {
  enabled: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeChanger?: boolean;
  pageSizeOptions?: number[];
  mode?: 'client' | 'server';
}

export interface FetchConfig<T> {
  url?: string;
  params?: Record<string, unknown>;
  onFetch?: (params: Record<string, unknown>) => Promise<{ data: T[]; total: number }>;
  autoFetch?: boolean;
  refreshKey?: string | number;
}

export interface DataTableProps<T> {
  // Data
  data?: T[];
  columns: Column<T>[];
  getRowKey: (item: T, index: number) => string | number;

  // Fetching
  fetchConfig?: FetchConfig<T>;

  // State
  loading?: boolean;
  hasError?: boolean;
  errorType?: 'network' | 'api' | 'generic';
  onRetry?: () => void;
  onDataChange?: (data: T[], total: number) => void;

  // Selection
  selectionConfig?: {
    selectedIds: (string | number)[];
    onSelectAll: () => void;
    onToggleSelect: (id: string | number) => void;
    allSelected: boolean;
  };

  // Pagination
  paginationConfig?: PaginationConfig;

  // Customization
  emptyConfig?: {
    icon?: LucideIcon;
    title?: string;
    description?: string;
  };
  errorConfig?: {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    actionLabel?: string;
  };

  // Row Props
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  rowProps?: (item: T, index: number) => HTMLMotionProps<'tr'>;

  // Table Styling
  className?: string;
  tableClassName?: string;

  // Loader
  loaderRows?: number;
}

const DataTable = <T,>({
  data = [],
  columns,
  getRowKey,
  fetchConfig,
  loading: externalLoading,
  hasError: externalHasError,
  errorType: externalErrorType = 'generic',
  onRetry: externalOnRetry,
  onDataChange,
  selectionConfig,
  paginationConfig,
  emptyConfig,
  errorConfig,
  onRowClick,
  rowClassName,
  rowProps,
  className = '',
  tableClassName = '',
  loaderRows = 6,
}: DataTableProps<T>) => {
  const { t } = useAppContext();
  const [internalData, setInternalData] = useState<T[]>([]);
  const [internalTotal, setInternalTotal] = useState(0);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<{
    hasError: boolean;
    type: 'network' | 'api' | 'generic';
  }>({ hasError: false, type: 'generic' });

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(paginationConfig?.pageSize || 10);

  // Determine if we are using external data or fetching internally
  const isFetching = !!fetchConfig?.onFetch || !!fetchConfig?.url;
  const currentData = isFetching ? internalData : data;

  // Fetching logic
  const fetchData = React.useCallback(async () => {
    if (!isFetching) return;

    setInternalLoading(true);
    setInternalError({ hasError: false, type: 'generic' });

    try {
      const params = {
        page: internalPage,
        pageSize: internalPageSize,
        ...fetchConfig?.params,
      };

      let result: { data: T[]; total: number };

      if (fetchConfig?.onFetch) {
        result = await fetchConfig.onFetch(params);
      } else if (fetchConfig?.url) {
        // Here you would normally use your API client
        // For now, we'll assume a generic fetch or throw error as placeholder
        // result = await apiClient.get(fetchConfig.url, { params });
        throw new Error('API Client not implemented in DataTable. Please use onFetch for now.');
      } else {
        result = { data: [], total: 0 };
      }

      setInternalData(result.data);
      setInternalTotal(result.total);
      onDataChange?.(result.data, result.total);
    } catch (error: unknown) {
      console.error('DataTable Fetch Error:', error);
      const isNetworkError = error instanceof Error && error.name === 'NetworkError';
      setInternalError({
        hasError: true,
        type: isNetworkError ? 'network' : 'api',
      });
    } finally {
      setInternalLoading(false);
    }
  }, [isFetching, internalPage, internalPageSize, fetchConfig, onDataChange]);

  // Trigger fetch
  React.useEffect(() => {
    if (isFetching && fetchConfig?.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, fetchConfig?.autoFetch, fetchConfig?.refreshKey, isFetching]);

  // Loading & Error states
  const loading = externalLoading || internalLoading;
  const hasError = externalHasError || internalError.hasError;
  const errorType = externalHasError ? externalErrorType : internalError.type;
  const onRetry = externalOnRetry || fetchData;

  // Sync internal state with props if they change
  React.useEffect(() => {
    if (paginationConfig?.currentPage !== undefined) {
      setInternalPage(paginationConfig.currentPage);
    }
  }, [paginationConfig?.currentPage]);

  React.useEffect(() => {
    if (paginationConfig?.pageSize !== undefined) {
      setInternalPageSize(paginationConfig.pageSize);
    }
  }, [paginationConfig?.pageSize]);

  // Determine if we are in server-side or client-side mode
  const isServerSide = React.useMemo(() => {
    if (isFetching) return true; // Fetched data is always server-side pagination
    if (paginationConfig?.mode) return paginationConfig.mode === 'server';

    // If parent provides onPageChange callback, treat as server-side pagination
    // This allows parent to control page changes and fetch new data accordingly
    return !!paginationConfig?.onPageChange;
  }, [isFetching, paginationConfig?.mode, paginationConfig?.onPageChange]);

  const currentPage = isServerSide
    ? isFetching
      ? internalPage
      : paginationConfig?.currentPage || 1
    : internalPage;

  const pageSize = isServerSide
    ? isFetching
      ? internalPageSize
      : paginationConfig?.pageSize || 10
    : internalPageSize;

  const totalItems = isServerSide
    ? isFetching
      ? internalTotal
      : paginationConfig?.totalItems || 0
    : currentData.length;

  const displayData = React.useMemo(() => {
    if (!paginationConfig?.enabled || isServerSide) return currentData;
    const start = (currentPage - 1) * pageSize;
    return currentData.slice(start, start + pageSize);
  }, [currentData, paginationConfig?.enabled, isServerSide, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (isFetching) {
      // fetchConfig mode: update internal state to trigger refetch
      setInternalPage(page);
    } else if (isServerSide) {
      // External data with server-side pagination: call parent callback
      paginationConfig?.onPageChange?.(page);
    } else {
      // Client-side pagination: update internal state
      setInternalPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (isFetching) {
      // fetchConfig mode: update internal state to trigger refetch
      setInternalPageSize(size);
      setInternalPage(1);
    } else if (isServerSide) {
      // External data with server-side pagination: call parent callback
      paginationConfig?.onPageSizeChange?.(size);
    } else {
      // Client-side pagination: update internal state
      setInternalPageSize(size);
      setInternalPage(1);
    }
  };

  const getErrorContent = () => {
    if (errorConfig?.title && errorConfig?.description) {
      return { title: errorConfig.title, description: errorConfig.description };
    }

    switch (errorType) {
      case 'network':
        return {
          title: t('networkError'),
          description: t('networkErrorDesc'),
        };
      case 'api':
        return {
          title: t('apiError'),
          description: t('apiErrorDesc'),
        };
      case 'generic':
      default:
        return {
          title: t('loadError'),
          description: t('loadErrorDesc'),
        };
    }
  };

  const { title, description } = getErrorContent();

  const finalColumns = React.useMemo(() => {
    if (!selectionConfig) return columns;

    const selectionColumn: Column<T> = {
      header: (
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectionConfig.onSelectAll();
          }}
          className="text-brand-500 hover:bg-brand-500/10 rounded-lg p-2 transition-all"
        >
          {selectionConfig.allSelected ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
      ),
      className: 'pl-10 pr-6 w-24',
      useBaseHeaderClass: false,
      useBaseCellClass: false,
      cellClassName: 'p-0',
      render: (item, index) => {
        const id = getRowKey(item, index);
        const isSelected = selectionConfig.selectedIds.includes(id);
        return (
          <div className="relative flex h-16.25 items-center pr-6 pl-10">
            {isSelected && (
              <div className="bg-brand-500 absolute top-0 bottom-0 left-0 w-1 shadow-[0_0_8px_#14b8a6]" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectionConfig.onToggleSelect(id);
              }}
              className={`rounded-lg p-2 transition-all ${isSelected ? 'text-brand-500' : 'text-slate-300 dark:text-slate-700'}`}
            >
              {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
            </button>
          </div>
        );
      },
    };

    return [selectionColumn, ...columns];
  }, [columns, selectionConfig, getRowKey]);

  return (
    <div
      className={`glass-hud rounded-5xl border-brand-500/10 relative w-full min-w-0 overflow-hidden border shadow-2xl ${className}`}
    >
      <div className="custom-scrollbar w-full min-w-0 overflow-x-auto">
        <table className={`w-full min-w-max border-collapse text-left ${tableClassName}`}>
          <thead>
            <tr className="bg-brand-500/5 border-brand-500/10 h-16.25 border-b dark:bg-slate-900/50">
              {finalColumns.map((col, index) => (
                <th
                  key={index}
                  className={`${col.useBaseHeaderClass !== false ? DEFAULT_HEADER_CLASS : ''} ${col.className || ''} ${index === 0 && !selectionConfig ? 'pl-10' : ''} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                  style={{ width: col.width }}
                >
                  <div
                    className={`flex h-full items-center ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}
                  >
                    {col.header}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-brand-500/5 relative min-h-100 transform-gpu divide-y">
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.tr
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td colSpan={finalColumns.length} className="p-0">
                    <div className="flex flex-col">
                      {[...Array(loaderRows)].map((_, i) => (
                        <div
                          key={`skeleton-row-${i}`}
                          className="border-brand-500/5 flex h-16.25 w-full items-center border-b last:border-0"
                        >
                          {finalColumns.map((col, j) => (
                            <div
                              key={`skeleton-cell-${j}`}
                              className={`${col.useBaseCellClass !== false ? 'px-6' : ''} ${col.cellClassName || ''} ${j === 0 && !selectionConfig ? 'pl-10' : ''} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} flex flex-1 items-center`}
                              style={{ width: col.width }}
                            >
                              <div
                                className={`flex h-16.25 w-full items-center ${j === 0 && selectionConfig ? 'pr-6 pl-10' : ''}`}
                              >
                                <div className="relative h-3 w-full animate-pulse overflow-hidden rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ) : hasError ? (
                <motion.tr
                  key="error"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  className="transform-gpu hover:bg-transparent!"
                >
                  <td colSpan={finalColumns.length} className="relative overflow-hidden py-32">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-brand-500)_1px,transparent_1px)] bg-size-[32px_32px]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 scale-150 rounded-full bg-red-500/20 blur-3xl" />
                        <div className="group flex h-20 w-20 rotate-3 items-center justify-center rounded-[2.5rem] border border-red-200/50 bg-linear-to-br from-red-50 to-white shadow-2xl shadow-red-500/5 transition-transform duration-700 hover:rotate-0 dark:border-red-500/20 dark:from-red-950/20 dark:to-slate-900">
                          {React.createElement(errorConfig?.icon || AlertCircle, {
                            className: 'w-10 h-10 text-red-500/80',
                          })}
                        </div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-red-500 shadow-sm dark:border-slate-900" />
                      </div>

                      <h3 className="mb-3 font-sans text-2xl font-light tracking-widest text-slate-900 uppercase dark:text-white">
                        {title}
                      </h3>
                      <p className="mb-10 max-w-sm text-sm leading-relaxed font-light tracking-wide text-slate-400 dark:text-slate-500">
                        {description}
                      </p>

                      {onRetry && (
                        <button
                          onClick={onRetry}
                          className="group/retry flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 px-8 py-3 shadow-inner transition-all outline-none hover:bg-red-500/10 active:scale-95"
                        >
                          <RefreshCw className="h-4 w-4 text-red-500 transition-transform duration-700 group-hover/retry:rotate-180" />
                          <span className="text-[9px] font-black tracking-[0.25em] text-red-600 uppercase dark:text-red-400">
                            {errorConfig?.actionLabel || t('retryLoad')}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ) : displayData.length === 0 ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  className="transform-gpu hover:bg-transparent!"
                >
                  <td colSpan={finalColumns.length} className="relative overflow-hidden py-32">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-brand-500)_1px,transparent_1px)] bg-size-[32px_32px]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
                      <div className="relative mb-8">
                        <div className="bg-brand-500/20 absolute inset-0 scale-150 rounded-full blur-3xl" />
                        <div className="from-brand-50 dark:from-brand-950/20 border-brand-200/50 dark:border-brand-500/20 shadow-brand-500/5 group flex h-20 w-20 -rotate-3 items-center justify-center rounded-[2.5rem] border bg-linear-to-br to-white shadow-2xl transition-transform duration-700 hover:rotate-0 dark:to-slate-900">
                          {React.createElement(emptyConfig?.icon || Inbox, {
                            className: 'w-10 h-10 text-brand-500/80',
                          })}
                        </div>
                        <div className="border-brand-500/20 absolute -bottom-2 -left-2 h-6 w-6 animate-pulse rounded-full border" />
                      </div>

                      <h3 className="mb-3 font-sans text-2xl font-light tracking-widest text-slate-900 uppercase dark:text-white">
                        {emptyConfig?.title || t('noData')}
                      </h3>
                      <p className="max-w-sm text-sm leading-relaxed font-light tracking-wide text-slate-400 italic dark:text-slate-500">
                        {emptyConfig?.description || t('noDataDesc')}
                      </p>
                      <div className="via-brand-500/30 mt-12 h-px w-12 bg-linear-to-r from-transparent to-transparent" />
                    </div>
                  </td>
                </motion.tr>
              ) : (
                displayData.map((item, index) => {
                  const key = getRowKey(item, index);
                  const isSelected = selectionConfig?.selectedIds.includes(key);
                  const baseRowProps = rowProps ? rowProps(item, index) : {};
                  const computedRowClassName =
                    typeof rowClassName === 'function'
                      ? rowClassName(item, index)
                      : rowClassName || '';

                  return (
                    <motion.tr
                      key={key}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.02,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      onClick={() => onRowClick?.(item, index)}
                      className={`hover:bg-brand-500/2 group border-brand-500/5 transform-gpu border-b transition-colors last:border-0 ${isSelected ? 'bg-brand-500/5' : ''} ${onRowClick ? 'cursor-pointer' : ''} ${computedRowClassName}`}
                      {...baseRowProps}
                    >
                      {finalColumns.map((col, colIndex) => (
                        <td
                          key={`${key}-col-${colIndex}`}
                          className={`${col.useBaseCellClass !== false ? 'px-6' : ''} ${col.cellClassName || ''} ${colIndex === 0 && !selectionConfig ? 'pl-10' : ''} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} h-16.25`}
                          style={{ width: col.width }}
                        >
                          <div
                            className={`flex h-full items-center ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}
                          >
                            {col.render
                              ? col.render(item, index)
                              : ((item as Record<string, unknown>)[
                                  col.key || ''
                                ] as React.ReactNode)}
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {paginationConfig?.enabled && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeChanger={paginationConfig.showPageSizeChanger}
          pageSizeOptions={paginationConfig.pageSizeOptions}
        />
      )}
    </div>
  );
};

export default DataTable;
