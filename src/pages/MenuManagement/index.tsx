import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Zap, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { MenuItem } from '../../types';
import { useAppContext } from '../../context';
import { useAuth } from '../../context/AuthContext';
import { getErrorType, ErrorType } from '../../utils/error';
import MenuTree from './components/MenuTree';
import MenuModal from './components/MenuModal';

const MenuManagement = () => {
  const { t, showMessage, confirm } = useAppContext();
  const { refreshMenus } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Handle global expansion
  const handleToggleExpand = (id: string) => {
    const newKeys = new Set(expandedKeys);
    if (newKeys.has(id)) {
      newKeys.delete(id);
    } else {
      newKeys.add(id);
    }
    setExpandedKeys(newKeys);
  };

  const handleExpandAll = () => {
    const allKeys = new Set<string>();
    const collectKeys = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allKeys.add(item.id);
          collectKeys(item.children);
        }
      });
    };
    collectKeys(menus);
    setExpandedKeys(allKeys);
  };

  const handleCollapseAll = () => {
    setExpandedKeys(new Set());
  };

  // Menu Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    label: '',
    path: '',
    icon: '',
    parentId: undefined,
    actions: [],
  });

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorType(null);
    try {
      const data = await api.getMenu();
      setMenus(data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      setErrorType(getErrorType(error));
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = (parentId?: string) => {
    setEditingItem(null);
    setFormData({
      label: '',
      path: '',
      icon: '',
      parentId,
      actions: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<MenuItem>) => {
    try {
      await api.saveMenuItem(data);
      setIsModalOpen(false);
      await fetchData(true);
      await refreshMenus();
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingItem ? t('categoryUpdateSuccess') : t('categoryCreateSuccess'),
      });
    } catch (error) {
      console.error('Failed to save menu item:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm(t('confirmDelete'), {
      type: 'warning',
      title: t('delete'),
    });

    if (isConfirmed) {
      try {
        await api.deleteMenuItem(id);
        await fetchData(true);
        await refreshMenus();
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  return (
    <div className="relative flex flex-1 flex-col space-y-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="flex items-center gap-6">
          <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
            <Layout className="text-brand-500 h-8 w-8 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('menuMgmt')}
            </h1>
            <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
              <Zap className="h-3 w-3 animate-pulse" /> {t('menuMgmtDesc')}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-4 lg:w-auto">
          <div className="group relative w-full lg:w-72">
            <Search className="group-focus-within:text-brand-500 absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-tactical-small w-full rounded-2xl py-3 pr-4 pl-10 text-xs font-black tracking-widest text-slate-900 outline-none dark:text-white"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenAdd()}
            className="btn-jade flex shrink-0 items-center gap-3 rounded-2xl px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg"
          >
            <Plus className="h-4 w-4" /> {t('addRootItem')}
          </motion.button>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExpandAll}
            className="glass-hud hover:bg-brand-500/10 hover:text-brand-500 flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all dark:text-slate-400"
          >
            <ChevronDown className="h-3 w-3" />
            {t('expandAll')}
          </button>
          <button
            onClick={handleCollapseAll}
            className="glass-hud hover:bg-brand-500/10 hover:text-brand-500 flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all dark:text-slate-400"
          >
            <ChevronUp className="h-3 w-3" />
            {t('collapseAll')}
          </button>
        </div>
        <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          {menus.length} {t('rootItems')}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-[400px] flex-1 flex-col">
        <MenuTree
          menus={menus}
          searchTerm={searchTerm}
          loading={loading && isFirstLoad}
          hasError={!!errorType}
          errorType={errorType || 'generic'}
          onRetry={() => fetchData()}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAddChild={handleOpenAdd}
          expandedKeys={expandedKeys}
          onToggleExpand={handleToggleExpand}
        />
      </div>

      {/* Modals */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={formData}
        isEditing={!!editingItem}
        menus={menus}
      />
    </div>
  );
};

export default MenuManagement;
