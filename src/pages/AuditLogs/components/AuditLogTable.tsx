import React, { useState } from 'react';
import { Globe, Clock, History, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { AuditLog } from '../../../types';
import { ErrorType } from '../../../utils/error';
import DataTable, { PaginationConfig } from '../../../components/DataTable';
import Modal from '../../../components/Modal';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  hasError?: boolean;
  errorType?: ErrorType;
  onRetry?: () => void;
  paginationConfig?: PaginationConfig;
  t: (key: string) => string;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  loading,
  hasError,
  errorType,
  onRetry,
  paginationConfig,
  t,
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const columns = React.useMemo(
    () => [
      {
        header: t('logUser'),
        className: 'pl-4',
        render: (log: AuditLog) => (
          <div className="flex items-center gap-4">
            <div className="bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-black shadow-inner">
              {log.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900 uppercase dark:text-slate-100">
              {log.username}
            </span>
          </div>
        ),
      },
      {
        header: t('logAction'),
        render: (log: AuditLog) => (
          <div className="flex flex-col gap-1">
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-xl px-3 py-1 text-[10px] font-black tracking-widest uppercase ${log.status === 1 ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-cinnabar-500/10 text-cinnabar-600 border-cinnabar-500/20 border'}`}
            >
              {log.status === 1 ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {t(log.operation)}
            </div>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
              {log.method}
            </span>
          </div>
        ),
      },
      {
        header: t('module'),
        render: (log: AuditLog) => (
          <span className="border-brand-500/20 border-b pb-1 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
            {t(log.module)}
          </span>
        ),
      },
      {
        header: t('executionTime'),
        render: (log: AuditLog) => (
          <div className="flex items-center gap-2 text-xs font-black tracking-tighter text-slate-500 dark:text-slate-400">
            <Clock className="text-brand-500 h-3.5 w-3.5 opacity-50" />
            {log.executionTime} {t('ms')}
          </div>
        ),
      },
      {
        header: t('ipAddress'),
        render: (log: AuditLog) => (
          <div className="flex items-center gap-2.5 font-mono text-xs tracking-tighter text-slate-400 dark:text-slate-500">
            <Globe className="text-brand-500 h-3.5 w-3.5 opacity-50" /> {log.ip}
          </div>
        ),
      },
      {
        header: t('timestamp'),
        render: (log: AuditLog) => (
          <div className="text-xs font-black tracking-tighter text-slate-500 uppercase dark:text-slate-400">
            {new Date(log.createTime).toLocaleString()}
          </div>
        ),
      },
      {
        header: t('actions'),
        className: 'pr-10',
        align: 'right' as const,
        render: (log: AuditLog) => (
          <button
            onClick={() => setSelectedLog(log)}
            className="hover:bg-brand-500/10 text-brand-500 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            title={t('viewDetails')}
          >
            <Eye className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [t],
  );

  return (
    <>
      <DataTable
        data={logs}
        columns={columns}
        getRowKey={(log) => log.id}
        loading={loading}
        hasError={hasError}
        errorType={errorType}
        onRetry={onRetry}
        emptyConfig={{
          icon: History,
          title: t('noAuditLogsFound'),
          description: t('noAuditLogsFoundDesc'),
        }}
        paginationConfig={paginationConfig}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={t('viewDetails')}
        maxWidth="max-w-3xl"
      >
        {selectedLog && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              <div className="glass-hud border-brand-500/10 flex flex-col gap-1 rounded-2xl border p-4 shadow-sm">
                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  {t('logUser')}
                </label>
                <p className="font-black text-slate-900 uppercase dark:text-white">
                  {selectedLog.username}
                </p>
              </div>
              <div className="glass-hud border-brand-500/10 flex flex-col gap-1 rounded-2xl border p-4 shadow-sm">
                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  {t('logAction')}
                </label>
                <p className="font-black text-slate-900 uppercase dark:text-white">
                  {t(selectedLog.operation)}
                </p>
              </div>
              <div className="glass-hud border-brand-500/10 flex flex-col gap-1 rounded-2xl border p-4 shadow-sm">
                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  {t('timestamp')}
                </label>
                <p className="font-mono text-xs text-slate-500">
                  {new Date(selectedLog.createTime).toLocaleString()}
                </p>
              </div>
              <div className="glass-hud border-brand-500/10 flex flex-col gap-1 rounded-2xl border p-4 shadow-sm">
                <label className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  {t('ipAddress')}
                </label>
                <p className="font-mono text-xs text-slate-500">{selectedLog.ip}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-500 h-1 w-4 rounded-full" />
                  <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    {t('params')}
                  </label>
                </div>
                <div className="glass-hud border-brand-500/10 relative overflow-hidden rounded-2xl border shadow-inner">
                  <div className="absolute top-0 right-0 left-0 h-8 border-b border-slate-900/5 bg-slate-900/5 px-4 py-2 dark:border-white/5 dark:bg-white/5">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                  </div>
                  <pre className="custom-scrollbar mt-8 max-h-64 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {JSON.stringify(JSON.parse(selectedLog.params || '{}'), null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-4 rounded-full bg-emerald-500" />
                  <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                    {t('result')}
                  </label>
                </div>
                <div className="glass-hud border-brand-500/10 relative overflow-hidden rounded-2xl border shadow-inner">
                  <div className="absolute top-0 right-0 left-0 h-8 border-b border-slate-900/5 bg-slate-900/5 px-4 py-2 dark:border-white/5 dark:bg-white/5">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                    </div>
                  </div>
                  <pre className="custom-scrollbar mt-8 max-h-64 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {selectedLog.result
                      ? (() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedLog.result!), null, 2);
                          } catch {
                            return selectedLog.result;
                          }
                        })()
                      : 'N/A'}
                  </pre>
                </div>
              </div>
            </div>

            {selectedLog.status === 0 && selectedLog.errorMsg && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-cinnabar-500 h-1 w-4 rounded-full" />
                  <label className="text-cinnabar-500 text-[10px] font-black tracking-[0.3em] uppercase">
                    Error Diagnostics
                  </label>
                </div>
                <div className="border-cinnabar-500/20 bg-cinnabar-500/5 rounded-2xl border p-6 shadow-inner">
                  <p className="text-cinnabar-600 dark:text-cinnabar-400 font-mono text-xs leading-relaxed">
                    {selectedLog.errorMsg}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-tactical-secondary rounded-2xl px-10 py-3 text-xs font-black tracking-[0.2em] uppercase"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AuditLogTable;
