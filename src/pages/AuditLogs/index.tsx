import React, { useState, useEffect, useCallback } from 'react';
import { History, Zap, Search, RefreshCcw } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import { useAppContext } from '../../context';
import { getErrorType, ErrorType } from '../../utils/error';
import AuditLogTable from './components/AuditLogTable';

const PAGE_SIZE = 10;

const AuditLogs = () => {
  const { t } = useAppContext();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = useCallback(
    async (page: number = currentPage, isSilent = false) => {
      if (!isSilent) setLoading(true);
      setErrorType(null);
      try {
        const data = await api.getLogs(page, pageSize);
        setLogs(data.list);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        setErrorType(getErrorType(error));
      } finally {
        setLoading(false);
        setIsFirstLoad(false);
      }
    },
    [currentPage, pageSize],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, currentPage, pageSize]);

  // Filter logs based on search query (Note: ideally this should be server-side search)
  const filteredLogs = logs.filter(
    (log) =>
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="flex flex-1 flex-col space-y-12 pb-20">
      <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="flex items-center gap-6">
          <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
            <History className="text-brand-500 h-8 w-8 transition-transform duration-1000 group-hover:rotate-180" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('auditLogs')}
            </h1>
            <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
              <Zap className="h-3 w-3 animate-pulse" /> {t('operationArchive')}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-4 lg:w-auto">
          <div className="group relative w-full lg:w-72">
            <Search className="group-focus-within:text-brand-500 absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('searchLogs')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-tactical-small w-full rounded-2xl py-3 pr-4 pl-10 text-xs font-black tracking-widest outline-none"
            />
          </div>
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="hover:bg-brand-500/10 hover:text-brand-600 border-brand-500/10 group rounded-2xl border bg-slate-500/5 p-3 text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400"
            title={t('refresh')}
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? 'animate-spin' : 'transition-transform duration-500 group-hover:rotate-180'}`}
            />
          </button>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        <div className="glass-hud border-brand-500/10 relative overflow-hidden rounded-[3.5rem] border shadow-2xl">
          <AuditLogTable
            logs={filteredLogs}
            loading={loading && isFirstLoad}
            hasError={!!errorType}
            errorType={errorType || undefined}
            onRetry={() => fetchLogs()}
            paginationConfig={{
              enabled: true,
              currentPage: currentPage,
              pageSize: pageSize,
              totalItems: total,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
              showPageSizeChanger: true,
            }}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
