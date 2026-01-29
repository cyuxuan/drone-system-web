import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Settings, Sparkles, LayoutGrid, List } from 'lucide-react';
import { api } from '../../services/api';
import { ProjectType } from '../../types';
import { useAppContext } from '../../context';
import { getErrorType, ErrorType } from '../../utils/error';
import CategoryModal from './components/CategoryModal';
import CategoryTable from './components/CategoryTable';
import CategoryGrid from './components/CategoryGrid';

const CATEGORY_TYPE_CONFIG: Record<number, { labelKey: string }> = {
  1: { labelKey: 'photographyMapping' },
  2: { labelKey: 'agriculturalProtection' },
  3: { labelKey: 'inspectionPower' },
  4: { labelKey: 'deliveryLogistics' },
};

const ProjectCategory = () => {
  const { t, showMessage, confirm } = useAppContext();
  const [categories, setCategories] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<ProjectType> | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectType>>({
    name: '',
    code: '',
    category: 0,
    description: '',
    isActive: 1,
  });

  const fetchCategories = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorType(null);
    try {
      const data = await api.getProjectTypes();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setErrorType(getErrorType(error));
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      code: '',
      category: 0,
      description: '',
      isActive: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: ProjectType) => {
    setEditingCategory(category);
    setFormData({ ...category });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveProjectType(formData);
      setIsModalOpen(false);
      fetchCategories(true);
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingCategory ? t('categoryUpdateSuccess') : t('categoryCreateSuccess'),
      });
    } catch (error) {
      console.error('Failed to save category:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const toggleCategoryStatus = async (category: ProjectType) => {
    try {
      await api.saveProjectType({ ...category, isActive: category.isActive === 1 ? 0 : 1 });
      fetchCategories(true);
      showMessage({
        type: 'success',
        title: t('success'),
        message: t('authModification'),
      });
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const handleDeleteCategory = async (typeNo: string) => {
    const isConfirmed = await confirm(t('categoryDeleteConfirm'), {
      type: 'warning',
      title: t('delete'),
    });

    if (isConfirmed) {
      try {
        await api.deleteProjectType(typeNo);
        fetchCategories(true);
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to delete category:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  const paginationConfig = {
    enabled: true,
    currentPage,
    pageSize,
    totalItems: filteredCategories.length,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    showPageSizeChanger: true,
  };

  return (
    <div className="flex flex-1 flex-col space-y-12 pb-24">
      {/* Tactical Header */}
      <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="flex items-center gap-6">
          <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
            <Settings className="text-brand-500 h-8 w-8 transition-transform duration-500 group-hover:rotate-90" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('projectCategoryMgmt')}
            </h1>
            <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
              <Sparkles className="h-3 w-3" />
              BUSINESS CLASSIFICATION SYSTEM
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-4 lg:w-auto">
          {/* View Switcher */}
          <div className="bg-brand-500/5 border-brand-500/10 flex items-center gap-1.5 rounded-2xl border p-1.5 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-xl p-2.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'hover:text-brand-600 text-slate-400 dark:text-slate-500'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-xl p-2.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'hover:text-brand-600 text-slate-400 dark:text-slate-500'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <div className="group relative w-full lg:w-72">
            <Search className="group-focus-within:text-brand-500 absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-tactical-small w-full rounded-2xl py-3 pr-4 pl-10 text-xs font-black tracking-widest text-slate-900 outline-none dark:text-white"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenAdd}
            className="btn-jade flex shrink-0 items-center gap-3 rounded-2xl px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg"
          >
            <Plus className="h-4 w-4" /> {t('newCategory')}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-[400px] flex-1 flex-col">
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <CategoryTable
                categories={filteredCategories}
                loading={loading && isFirstLoad}
                hasError={!!errorType}
                errorType={errorType || undefined}
                onRetry={() => fetchCategories()}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteCategory}
                onToggleStatus={toggleCategoryStatus}
                paginationConfig={paginationConfig}
                t={t}
                categoryTypeConfig={CATEGORY_TYPE_CONFIG}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <CategoryGrid
                categories={filteredCategories}
                loading={loading && isFirstLoad}
                hasError={!!errorType}
                errorType={errorType || undefined}
                onRetry={() => fetchCategories()}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteCategory}
                onToggleStatus={toggleCategoryStatus}
                paginationConfig={paginationConfig}
                t={t}
                categoryTypeConfig={CATEGORY_TYPE_CONFIG}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Modal Component */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        editingCategory={editingCategory}
      />
    </div>
  );
};

export default ProjectCategory;
