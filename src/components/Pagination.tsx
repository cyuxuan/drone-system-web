import React from 'react';
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { useAppContext } from '../context';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeChanger?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showPageSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) => {
  const { t } = useAppContext();
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 0) return null;

  return (
    <div
      className={`bg-brand-500/1 border-brand-500/5 flex items-center justify-between border-t px-10 py-5 ${className}`}
    >
      <div className="flex items-center gap-6">
        <div className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
          {t('showingResultsCount', {
            count: Math.min(pageSize, totalItems - (currentPage - 1) * pageSize),
            total: totalItems,
          })}
        </div>

        {showPageSizeChanger && onPageSizeChange && (
          <div className="border-brand-500/10 flex items-center gap-3 border-l pl-6">
            <Settings2 className="h-3.5 w-3.5 text-slate-400" />
            <div className="flex gap-1.5">
              {pageSizeOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onPageSizeChange(option)}
                  className={`rounded-lg px-2 py-1 text-[9px] font-black transition-all ${
                    pageSize === option
                      ? 'bg-brand-500/10 text-brand-500 border-brand-500/20 border'
                      : 'hover:text-brand-500 text-slate-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="glass-hud border-brand-500/10 hover:text-brand-500 rounded-xl p-2.5 text-slate-400 shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3">
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            // Ellipsis logic
            if (
              totalPages > 7 &&
              pageNum !== 1 &&
              pageNum !== totalPages &&
              Math.abs(pageNum - currentPage) > 2
            ) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="px-1 text-slate-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                  currentPage === pageNum
                    ? 'btn-jade text-white shadow-lg'
                    : 'hover:text-brand-500 hover:bg-brand-500/5 text-slate-400 dark:text-slate-500'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="glass-hud border-brand-500/10 hover:text-brand-500 rounded-xl p-2.5 text-slate-400 shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-500"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
