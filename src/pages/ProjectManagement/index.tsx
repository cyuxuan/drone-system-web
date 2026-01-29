import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
// Add Layers to the lucide-react imports
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Camera,
  Sprout,
  SearchCode,
  Truck,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { api } from '../../services/api';
import { DroneProject, ProjectType } from '../../types';
import { useAppContext } from '../../context';
import { getErrorType, ErrorType } from '../../utils/error';
import ProjectModal from './components/ProjectModal';
import ProjectGrid from './components/ProjectGrid';
import ProjectTable from './components/ProjectTable';
import ProjectTypeFilter from './components/ProjectTypeFilter';

const PAGE_SIZE = 9;

const CATEGORY_MAP: Record<
  number,
  { icon: LucideIcon; gradient: string; text: string; labelKey: string }
> = {
  1: {
    icon: Camera,
    gradient: 'from-brand-400/10 to-brand-600/10',
    text: 'text-brand-600 dark:text-brand-400',
    labelKey: 'photographyMapping',
  },
  2: {
    icon: Sprout,
    gradient: 'from-emerald-400/10 to-emerald-600/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    labelKey: 'agriculturalProtection',
  },
  3: {
    icon: SearchCode,
    gradient: 'from-amber-400/10 to-amber-600/10',
    text: 'text-amber-600 dark:text-amber-400',
    labelKey: 'inspectionPower',
  },
  4: {
    icon: Truck,
    gradient: 'from-rose-400/10 to-rose-600/10',
    text: 'text-rose-600 dark:text-rose-400',
    labelKey: 'deliveryLogistics',
  },
};

const ProjectManagement = () => {
  const { t, showMessage, confirm } = useAppContext();
  const [projects, setProjects] = useState<DroneProject[]>([]);
  const [categories, setCategories] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<DroneProject> | null>(null);
  const [formData, setFormData] = useState<Partial<DroneProject>>({
    projectName: '',
    typeNo: 'Photography',
    projectCode: '',
    unit: '',
    projectPrice: 0,
    description: '',
    isActive: 1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorType(null);
    try {
      const [projectData, categoryData] = await Promise.all([
        api.getProjects(),
        api.getProjectTypes(),
      ]);
      setProjects(projectData);
      setCategories(categoryData);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setErrorType(getErrorType(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map category info for easy access
  const categoryInfo = useMemo(() => {
    const map: Record<string, ProjectType> = {};
    categories.forEach((c) => {
      map[c.typeNo] = c;
    });
    return map;
  }, [categories]);

  const typeConfigMapping = useMemo(() => {
    const config: Record<string, { icon: LucideIcon; gradient: string; text: string; labelKey: string }> = {};
    categories.forEach((c) => {
      config[c.typeNo] = CATEGORY_MAP[c.category] || CATEGORY_MAP[1];
    });
    return config;
  }, [categories]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || p.typeNo === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [projects, searchTerm, typeFilter]);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      projectName: '',
      typeNo: categories[0]?.typeNo || '',
      projectCode: '',
      unit: '',
      projectPrice: 0,
      description: '',
      isActive: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: DroneProject) => {
    setEditingProject(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveProject(formData);
      setIsModalOpen(false);
      fetchData();
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingProject ? t('projectUpdateSuccess') : t('projectCreateSuccess'),
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const toggleProjectStatus = async (project: DroneProject) => {
    try {
      await api.saveProject({ ...project, isActive: project.isActive === 1 ? 0 : 1 });
      fetchData();
      showMessage({
        type: 'success',
        title: t('success'),
        message: t('authModification'),
      });
    } catch (error) {
      console.error('Failed to toggle project status:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const deleteProject = async (projectNo: string) => {
    const isConfirmed = await confirm(t('deleteProjectConfirm'), {
      type: 'warning',
      title: t('delete'),
    });

    if (isConfirmed) {
      try {
        await api.deleteProject(projectNo);
        fetchData();
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to delete project:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  return (
    <div className="relative flex flex-1 flex-col space-y-12 pb-24">
      {/* HUD Grid Background Decor */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="animate-grid absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-brand-500) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 space-y-12">
        {/* Tactical Header */}
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="flex items-center gap-6">
            <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
              <Sparkles className="text-brand-500 h-8 w-8 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
                {t('projectCatalog')}
              </h1>
              <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
                {t('protocolOperations')}
              </p>
            </div>
          </div>

          <div className="flex w-full items-center gap-4 lg:w-auto">
            <div className="bg-brand-500/5 border-brand-500/10 flex items-center gap-1.5 rounded-2xl border p-1.5 shadow-inner">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-xl p-2.5 transition-all ${viewMode === 'grid' ? 'bg-brand-500 text-white shadow-lg' : 'hover:text-brand-600 text-slate-400 dark:text-slate-500'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-xl p-2.5 transition-all ${viewMode === 'list' ? 'bg-brand-500 text-white shadow-lg' : 'hover:text-brand-600 text-slate-400 dark:text-slate-500'}`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="group relative w-full lg:w-72">
              <Search className="group-focus-within:text-brand-500 absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500" />
              <input
                type="text"
                placeholder={t('searchProtocolPlaceholder')}
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
              <Plus className="h-4 w-4" /> {t('newService')}
            </motion.button>
          </div>
        </div>

        {/* Filter Options */}
        <ProjectTypeFilter
          typeFilter={typeFilter}
          onFilterChange={(type) => {
            setTypeFilter(type);
            setCurrentPage(1);
          }}
          typeConfig={typeConfigMapping}
          t={t}
        />

        {/* Main Content Area */}
        <div className="relative min-h-[400px]">
          {/* Conditional Rendering: Grid or List */}
          {viewMode === 'grid' ? (
            <ProjectGrid
              projects={filteredProjects}
              loading={loading}
              hasError={!!errorType}
              errorType={errorType || undefined}
              onRetry={() => {
                if (errorType) {
                  fetchData();
                } else {
                  setSearchTerm('');
                  setTypeFilter('All');
                }
              }}
              typeConfig={typeConfigMapping}
              onEdit={handleOpenEdit}
              onDelete={deleteProject}
              onToggleStatus={toggleProjectStatus}
              t={t}
              paginationConfig={{
                enabled: true,
                currentPage: currentPage,
                pageSize: pageSize,
                totalItems: filteredProjects.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
                showPageSizeChanger: true,
              }}
            />
          ) : (
            <ProjectTable
              projects={filteredProjects}
              loading={loading}
              hasError={!!errorType}
              errorType={errorType || undefined}
              onRetry={fetchData}
              typeConfig={typeConfigMapping}
              onEdit={handleOpenEdit}
              onDelete={deleteProject}
              onToggleStatus={toggleProjectStatus}
              paginationConfig={{
                enabled: true,
                currentPage: currentPage,
                pageSize: pageSize,
                totalItems: filteredProjects.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
                showPageSizeChanger: true,
              }}
              t={t}
            />
          )}
        </div>

        {/* Project Modal Component */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingProject={editingProject}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          typeConfig={typeConfigMapping}
        />
      </div>
    </div>
  );
};

export default ProjectManagement;
