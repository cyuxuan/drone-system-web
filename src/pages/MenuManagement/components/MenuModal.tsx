import React, { useState, useMemo } from 'react';
import {
  X,
  Layout,
  Link as LinkIcon,
  Plus,
  MousePointer2,
  ChevronDown,
  Search,
  Zap,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '../../../types';
import { useAppContext } from '../../../context';
import * as LucideIcons from 'lucide-react';
import Modal from '../../../components/Modal';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MenuItem>) => Promise<void>;
  initialData: Partial<MenuItem>;
  isEditing: boolean;
  menus: MenuItem[];
}

const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing,
  menus,
}) => {
  const { t } = useAppContext();
  const [formData, setFormData] = useState<Partial<MenuItem>>(initialData);
  const [newAction, setNewAction] = useState({ key: '', label: '' });
  const [iconSearch, setIconSearch] = useState('');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isParentPickerOpen, setIsParentPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync formData with initialData using a simpler effect
  const [lastInitialData, setLastInitialData] = useState(initialData);

  if (isOpen && initialData !== lastInitialData) {
    setFormData(initialData);
    setLastInitialData(initialData);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAction = () => {
    if (newAction.key && newAction.label) {
      const actions = [...(formData.actions || []), { ...newAction }];
      setFormData({ ...formData, actions });
      setNewAction({ key: '', label: '' });
    }
  };

  const handleRemoveAction = (key: string) => {
    const actions = (formData.actions || []).filter((a) => a.key !== key);
    setFormData({ ...formData, actions });
  };

  const availableIcons = useMemo(() => {
    const searchLower = iconSearch.toLowerCase();
    return Object.keys(LucideIcons)
      .filter((name) => {
        // Only include actual icon components (PascalCase and function/object)
        const isIcon =
          /^[A-Z]/.test(name) &&
          (typeof (LucideIcons as Record<string, unknown>)[name] === 'function' ||
            typeof (LucideIcons as Record<string, unknown>)[name] === 'object');

        if (!isIcon) return false;
        if (!searchLower) return true;
        return name.toLowerCase().includes(searchLower);
      })
      .slice(0, 100);
  }, [iconSearch]);

  const renderIcon = (iconName: string, className = 'h-4 w-4') => {
    const Icon =
      (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[iconName] ||
      Layout;
    return <Icon className={className} />;
  };

  // Flatten menus for parent selection
  const flatMenus = useMemo(() => {
    const result: { id: string; label: string; level: number }[] = [];

    // 递归检查是否是自身或其后代
    const isDescendant = (parent: MenuItem, targetId: string): boolean => {
      if (parent.id === targetId) return true;
      if (parent.children) {
        return parent.children.some((child) => isDescendant(child, targetId));
      }
      return false;
    };

    const traverse = (items: MenuItem[], level: number) => {
      items.forEach((item) => {
        // 如果正在编辑，排除自身及其所有子菜单，防止循环引用
        if (isEditing && formData.id && isDescendant(item, formData.id)) {
          return;
        }

        result.push({ id: item.id, label: item.label, level });
        if (item.children) traverse(item.children, level + 1);
      });
    };

    traverse(menus, 0);
    return result;
  }, [menus, formData.id, isEditing]);

  const getSelectedParentLabel = () => {
    if (!formData.parentId) return t('all');
    const parent = flatMenus.find((m) => m.id === formData.parentId);
    return parent ? parent.label : t('all');
  };

  const renderParentTree = (items: MenuItem[], level: number = 0, parentLasts: boolean[] = []) => {
    return items
      .filter((item) => {
        // 递归检查是否是自身或其后代
        const isDescendant = (parent: MenuItem, targetId: string): boolean => {
          if (parent.id === targetId) return true;
          if (parent.children) {
            return parent.children.some((child) => isDescendant(child, targetId));
          }
          return false;
        };

        // 如果正在编辑，排除自身及其所有子菜单
        if (isEditing && formData.id && isDescendant(item, formData.id)) {
          return false;
        }
        return true;
      })
      .map((item, index, filteredItems) => {
        const isLast = index === filteredItems.length - 1;
        const isSelected = formData.parentId === item.id;

        return (
          <React.Fragment key={item.id}>
            <div className="relative">
              {/* Tree Lines */}
              {level > 0 && (
                <div className="pointer-events-none absolute top-0 right-full bottom-0 flex h-full flex-row-reverse items-stretch">
                  <div className="relative w-6 shrink-0">
                    <div
                      className={`absolute left-3 w-px bg-slate-200 dark:bg-white/10 ${
                        isLast ? 'top-0 h-4' : 'top-0 bottom-0'
                      }`}
                    />
                    <div className="absolute top-4 left-3 h-px w-3 bg-slate-200 dark:bg-white/10" />
                  </div>
                  {parentLasts
                    .slice()
                    .reverse()
                    .map((isParentLast, idx) => (
                      <div key={idx} className="relative w-6 shrink-0">
                        {!isParentLast && (
                          <div className="absolute top-0 bottom-0 left-3 w-px bg-slate-200 dark:bg-white/10" />
                        )}
                      </div>
                    ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, parentId: item.id });
                  setIsParentPickerOpen(false);
                }}
                className={`group relative mb-1 flex w-full items-center gap-2 rounded-xl p-2 text-left transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 text-brand-500 shadow-sm'
                    : 'hover:text-brand-500 hover:bg-brand-500/5 text-slate-500 dark:text-slate-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isSelected ? 'bg-brand-500 text-white' : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {renderIcon(item.icon, 'h-3.5 w-3.5')}
                </div>
                <span className="text-xs font-bold tracking-tight">{item.label}</span>
              </button>
            </div>
            {item.children && item.children.length > 0 && (
              <div className="pl-6">
                {renderParentTree(item.children, level + 1, [...parentLasts, isLast])}
              </div>
            )}
          </React.Fragment>
        );
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('editMenuItem') : t('addMenuItem')}
      maxWidth="max-w-2xl"
      onSave={handleSubmit}
      isSaving={isSaving}
      saveText={isEditing ? t('saveChanges') : t('confirmAdd')}
      formId="menu-form"
    >
      <form id="menu-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Label */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Layout className="h-3.5 w-3.5" /> {t('btnLabel')}
            </label>
            <input
              type="text"
              required
              disabled={isSaving}
              value={formData.label || ''}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('categoryNamePlaceholder')}
            />
          </div>

          {/* Path */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <LinkIcon className="h-3.5 w-3.5" /> {t('path')}
            </label>
            <input
              type="text"
              required
              disabled={isSaving}
              value={formData.path || ''}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder="/path/to/page"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Parent ID */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Plus className="h-3.5 w-3.5" /> {t('structureTree')}
            </label>
            <div className="relative">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsParentPickerOpen(!isParentPickerOpen)}
                className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 flex w-full items-center gap-3 rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              >
                <div className="bg-brand-500/10 text-brand-500 flex h-6 w-6 items-center justify-center rounded">
                  <Layout className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm">{getSelectedParentLabel()}</span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 text-slate-400 transition-transform duration-300 ${
                    isParentPickerOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isParentPickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsParentPickerOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="glass-hud absolute top-full right-0 left-0 z-20 mt-2 max-h-80 overflow-hidden rounded-2xl border border-white/10 p-4 shadow-2xl"
                    >
                      <div className="scrollbar-hide max-h-64 overflow-y-auto p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, parentId: undefined });
                            setIsParentPickerOpen(false);
                          }}
                          className={`group mb-2 flex w-full items-center gap-2 rounded-xl p-2 text-left transition-all ${
                            !formData.parentId
                              ? 'bg-brand-500/10 text-brand-500 shadow-sm'
                              : 'hover:text-brand-500 hover:bg-brand-500/5 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                              !formData.parentId
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}
                          >
                            <Layout className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-bold tracking-tight">{t('all')}</span>
                        </button>
                        <div className="mt-2 space-y-1">{renderParentTree(menus)}</div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Layout className="h-3.5 w-3.5" /> {t('icon')}
            </label>
            <div className="relative">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  if (isIconPickerOpen) {
                    setIconSearch('');
                  }
                  setIsIconPickerOpen(!isIconPickerOpen);
                }}
                className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 flex w-full items-center gap-3 rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              >
                <div className="bg-brand-500/10 text-brand-500 flex h-6 w-6 items-center justify-center rounded">
                  {renderIcon(formData.icon || 'Layout')}
                </div>
                <span className="text-sm">{formData.icon || 'Select Icon'}</span>
                <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
              </button>

              <AnimatePresence>
                {isIconPickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => {
                        setIsIconPickerOpen(false);
                        setIconSearch('');
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="glass-hud absolute top-full right-0 left-0 z-20 mt-2 max-h-80 overflow-hidden rounded-2xl border border-white/10 p-4 shadow-2xl"
                    >
                      <div className="relative mb-4">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          value={iconSearch}
                          onChange={(e) => {
                            e.stopPropagation();
                            setIconSearch(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-brand-500/5 border-brand-500/10 focus:border-brand-500 w-full rounded-xl border-b px-10 py-3 text-xs font-bold outline-none dark:bg-slate-800/50"
                          placeholder={t('searchIcons')}
                        />
                      </div>
                      <div className="scrollbar-hide grid max-h-48 grid-cols-6 gap-2 overflow-y-auto p-1">
                        {availableIcons.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, icon: name });
                              setIsIconPickerOpen(false);
                              setIconSearch('');
                            }}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                              formData.icon === name
                                ? 'bg-brand-500 shadow-brand-500/20 text-white shadow-lg'
                                : 'hover:bg-brand-500/10 hover:text-brand-500 text-slate-400'
                            }`}
                            title={name}
                          >
                            {renderIcon(name, 'h-5 w-5')}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Actions Management */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
                <Zap className="h-3.5 w-3.5" /> {t('menuActions')}
              </label>
              <p className="text-[9px] font-medium tracking-widest text-slate-400 uppercase dark:text-slate-500">
                {t('capabilityMatrix')}
              </p>
            </div>
          </div>

          <div className="glass-hud border-brand-500/10 overflow-hidden rounded-2xl border">
            <div className="bg-brand-500/5 border-brand-500/10 grid grid-cols-1 gap-4 border-b p-5 md:grid-cols-3">
              <div className="relative">
                <Shield className="absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  disabled={isSaving}
                  value={newAction.key}
                  onChange={(e) => setNewAction({ ...newAction, key: e.target.value })}
                  className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-xl border-b px-10 py-3 text-xs font-bold outline-none disabled:opacity-50 dark:bg-slate-800/50"
                  placeholder={t('btnKey')}
                />
              </div>
              <div className="relative">
                <MousePointer2 className="absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  disabled={isSaving}
                  value={newAction.label}
                  onChange={(e) => setNewAction({ ...newAction, label: e.target.value })}
                  className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-xl border-b px-10 py-3 text-xs font-bold outline-none disabled:opacity-50 dark:bg-slate-800/50"
                  placeholder={t('btnLabel')}
                />
              </div>
              <button
                type="button"
                onClick={handleAddAction}
                disabled={isSaving || !newAction.key || !newAction.label}
                className="btn-jade flex items-center justify-center gap-2 rounded-xl text-[10px] font-black tracking-widest uppercase disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> {t('addAction')}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 p-5">
              <AnimatePresence mode="popLayout">
                {formData.actions?.map((action) => (
                  <motion.div
                    key={action.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400 flex items-center gap-3 rounded-xl border p-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">
                        {action.key}
                      </span>
                      <span className="text-[10px] font-black tracking-wider uppercase">
                        {action.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(action.key)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!formData.actions || formData.actions.length === 0) && (
                <div className="flex w-full flex-col items-center justify-center py-6 text-slate-500">
                  <Zap className="mb-2 h-8 w-8 opacity-20" />
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-40">
                    No custom actions defined
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default MenuModal;
