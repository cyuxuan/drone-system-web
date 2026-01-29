import React, { useMemo } from 'react';
import {
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  Layout,
  MousePointer2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '../../../types';
import { useAppContext } from '../../../context';
import * as LucideIcons from 'lucide-react';

interface MenuTreeProps {
  menus: MenuItem[];
  searchTerm: string;
  loading: boolean;
  hasError: boolean;
  errorType: 'network' | 'api' | 'generic';
  onRetry: () => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  expandedKeys: Set<string>;
  onToggleExpand: (id: string) => void;
}

const renderIcon = (iconName: string) => {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const Icon = icons[iconName] || Layout;
  return <Icon className="h-5 w-5" />;
};

const HighlightText = React.memo<{ text: string; highlight: string }>(({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const parts = text.split(
    new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
  );
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-brand-500/20 text-brand-600 dark:text-brand-400">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
});

interface TreeNodeProps {
  item: MenuItem;
  level: number;
  isLast: boolean;
  parentLasts: boolean[];
  searchTerm: string;
  expandedKeys: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  t: (key: string) => string;
}

const TreeNode = React.memo<TreeNodeProps>(
  ({
    item,
    level,
    isLast,
    parentLasts,
    searchTerm,
    expandedKeys,
    onToggleExpand,
    onEdit,
    onDelete,
    onAddChild,
    t,
  }) => {
    const isExpanded = expandedKeys.has(item.id) || !!searchTerm;
    const hasChildren = !!(item.children && item.children.length > 0);
    const matchesSearch =
      searchTerm &&
      (item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.path.toLowerCase().includes(searchTerm.toLowerCase()));

    const shouldRender = useMemo(() => {
      if (!searchTerm) return true;
      if (matchesSearch) return true;
      const checkChildren = (children: MenuItem[]): boolean => {
        return children.some(
          (child) =>
            child.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            child.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (child.children && checkChildren(child.children)),
        );
      };
      return hasChildren && checkChildren(item.children!);
    }, [item.children, matchesSearch, hasChildren, searchTerm]);

    if (!shouldRender) return null;

    return (
      <div className="relative">
        {/* Tree Lines - Fixed positioning to prevent overlapping with icon */}
        {level > 0 && (
          <div className="pointer-events-none absolute top-0 right-full bottom-0 flex h-full flex-row-reverse items-stretch">
            <div className="relative w-8 shrink-0">
              {/* Vertical line from top to mid-point (for the horizontal branch) */}
              <div
                className={`absolute left-4 w-px bg-slate-300 dark:bg-white/20 ${
                  isLast ? 'top-0 h-8' : 'top-0 bottom-0'
                }`}
              />
              {/* Horizontal branch line - stops exactly at the card edge */}
              <div className="absolute top-8 left-4 h-px w-8 bg-slate-300 dark:bg-white/20" />
            </div>
            {parentLasts
              .slice()
              .reverse()
              .map((isParentLast, idx) => (
                <div key={idx} className="relative w-8 shrink-0">
                  {!isParentLast && (
                    <div className="absolute top-0 bottom-0 left-4 w-px bg-slate-300 dark:bg-white/20" />
                  )}
                </div>
              ))}
          </div>
        )}

        <div
          onClick={() => hasChildren && onToggleExpand(item.id)}
          className={`group data-[entering=true]:animate-in data-[entering=true]:fade-in data-[entering=true]:slide-in-from-left-4 relative mb-2 flex items-center gap-4 rounded-2xl border p-3 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[transform,opacity] ${
            hasChildren ? 'cursor-pointer active:scale-[0.995]' : ''
          } ${
            matchesSearch
              ? 'border-brand-500/50 bg-brand-500/5 shadow-brand-500/10 shadow-lg'
              : level === 0
                ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 active:bg-white/15'
                : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5 active:bg-white/8'
          }`}
          data-entering={true}
        >
          {/* Icon & Label */}
          <div className="flex flex-1 items-center gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-[background-color,color,transform] duration-300 ${
                level === 0
                  ? 'bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white'
                  : 'bg-slate-500/10 text-slate-400 group-hover:bg-slate-500 group-hover:text-white'
              }`}
            >
              {renderIcon(item.icon)}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold tracking-tight text-slate-900 dark:text-white ${
                    level === 0 ? 'text-sm' : 'text-xs'
                  }`}
                >
                  <HighlightText text={item.label} highlight={searchTerm} />
                </span>
                {hasChildren && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    {item.children?.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <Hash className="h-3 w-3" />
                  <HighlightText text={item.path} highlight={searchTerm} />
                </div>
                {item.actions && item.actions.length > 0 && (
                  <div className="text-brand-500/60 flex items-center gap-1 text-[10px]">
                    <MousePointer2 className="h-3 w-3" />
                    <span>
                      {item.actions.length} {t('actions')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(item.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              title={t('addSubmenu')}
            >
              <Plus className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white"
              title={t('edit')}
            >
              <Edit2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
              title={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Toggle Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(item.id);
              }}
              className="hover:text-brand-500 ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10"
            >
              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-5 w-5" />
              </motion.div>
            </button>
          )}
        </div>
      </div>
    );
  },
);

const MenuTree: React.FC<MenuTreeProps> = ({
  menus,
  searchTerm,
  loading,
  hasError,
  errorType,
  onRetry,
  onEdit,
  onDelete,
  onAddChild,
  expandedKeys,
  onToggleExpand,
}) => {
  const { t } = useAppContext();

  // Filter menus based on search term
  const filteredMenus = useMemo(() => {
    if (!searchTerm) return menus;
    const filter = (items: MenuItem[]): MenuItem[] => {
      return items
        .map((item) => ({
          ...item,
          children: item.children ? filter(item.children) : [],
        }))
        .filter(
          (item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.children && item.children.length > 0),
        );
    };
    return filter(menus);
  }, [menus, searchTerm]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-brand-500 shadow-brand-500/20 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="glass-hud flex flex-col items-center justify-center rounded-3xl p-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-rose-500" />
        <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
          {t('loadError')}
        </h3>
        <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {t(`${errorType}ErrorDesc`)}
        </p>
        <button
          onClick={onRetry}
          className="btn-tactical rounded-xl px-8 py-3 text-[10px] font-black tracking-widest uppercase"
        >
          {t('retryLoad')}
        </button>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="glass-hud flex flex-col items-center justify-center rounded-3xl p-12 text-center">
        <Layout className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-700" />
        <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
          {t('noMenuData')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('emptyTargetDesc')}</p>
      </div>
    );
  }

  // 递归渲染子节点
  const renderTreeNodes = (items: MenuItem[], level: number = 0, parentLasts: boolean[] = []) => {
    return items.map((item, index) => {
      const isExpanded = expandedKeys.has(item.id) || !!searchTerm;
      const hasChildren = item.children && item.children.length > 0;

      return (
        <React.Fragment key={item.id}>
          <TreeNode
            item={item}
            level={level}
            isLast={index === items.length - 1}
            parentLasts={parentLasts}
            searchTerm={searchTerm}
            expandedKeys={expandedKeys}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            t={t}
          />
          <AnimatePresence initial={false}>
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: {
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    opacity: {
                      duration: 0.25,
                      delay: 0.1,
                    },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: {
                      duration: 0.3,
                      ease: [0.4, 0, 1, 1],
                    },
                    opacity: {
                      duration: 0.2,
                    },
                  },
                }}
                className="overflow-hidden pl-8 will-change-[height]"
              >
                {renderTreeNodes(item.children!, level + 1, [
                  ...parentLasts,
                  index === items.length - 1,
                ])}
              </motion.div>
            )}
          </AnimatePresence>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <div className="space-y-1">{renderTreeNodes(filteredMenus)}</div>
    </div>
  );
};

export default MenuTree;
