import React from 'react';
import { Package } from 'lucide-react';

interface ProjectTypeFilterProps {
  typeFilter: string;
  onFilterChange: (type: string) => void;
  typeConfig: Record<string, { labelKey: string }>;
  t: (key: string) => string;
}

const ProjectTypeFilter: React.FC<ProjectTypeFilterProps> = ({
  typeFilter,
  onFilterChange,
  typeConfig,
  t,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
          <Package className="text-brand-500 h-3.5 w-3.5" /> {t('projectCategory')}
        </span>
        <div className="flex gap-2">
          {['All', ...Object.keys(typeConfig)].map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`rounded-xl border px-4 py-2 text-[9px] font-black tracking-widest uppercase transition-all ${
                typeFilter === type
                  ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                  : 'bg-brand-500/5 border-brand-500/10 hover:bg-brand-500/10 text-slate-500 dark:text-slate-400'
              }`}
            >
              {type === 'All' ? t('allViews') : t(typeConfig[type].labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTypeFilter;
