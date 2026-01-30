import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Key, Zap, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { Permission } from '../../types';
import { useAppContext } from '../../context';
import { getErrorType, ErrorType } from '../../utils/error';
import PermissionTable from './components/PermissionTable';
import PermissionModal from './components/PermissionModal';
import HasPermission from '../../components/HasPermission';

const PermissionManagement = () => {
  const { t, showMessage, confirm } = useAppContext();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Partial<Permission> | null>(null);
  const [formData, setFormData] = useState<Partial<Permission>>({
    permissionName: '',
    permissionCode: '',
    module: '',
    description: '',
  });

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorType(null);
    try {
      const data = await api.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setErrorType(getErrorType(error));
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter(
      (perm) =>
        perm.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.permissionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (perm.module && perm.module.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [permissions, searchTerm]);

  const handleOpenAdd = () => {
    setEditingPermission(null);
    setFormData({
      permissionName: '',
      permissionCode: '',
      module: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (perm: Permission) => {
    setEditingPermission(perm);
    setFormData({ ...perm });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(t('deletePermissionConfirm'), {
      title: t('deletePermission'),
      type: 'warning',
    });

    if (confirmed) {
      try {
        await api.deletePermission(id);
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeleted'),
        });
        fetchData(true);
      } catch (error) {
        console.error('Failed to delete permission:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('failedToDelete'),
        });
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await api.savePermission(formData);
      setIsModalOpen(false);
      fetchData(true);
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingPermission ? t('authModification') : t('recordCreation'),
      });
    } catch (error) {
      console.error('Failed to save permission:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('failedToSave'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 flex h-16 w-16 items-center justify-center rounded-3xl border text-xs font-black shadow-2xl">
            <Key className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('permissionMgmt')}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                {permissions.length} {t('totalPermissions')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="group relative">
            <Search className="group-focus-within:text-brand-500 absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors" />
            <input
              type="text"
              placeholder={t('searchPermissions')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-500/5 border-brand-500/10 focus:border-brand-500/40 w-full rounded-2xl border-b-2 py-3 pr-6 pl-12 text-[10px] font-black tracking-widest transition-all outline-none placeholder:text-slate-500 sm:w-80 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <HasPermission permission="system:permission:add">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenAdd}
              className="btn-jade flex shrink-0 items-center gap-3 rounded-2xl px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg"
            >
              <Plus className="h-4 w-4" /> {t('addPermission')}
            </motion.button>
          </HasPermission>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: t('totalPermissions'), value: permissions.length, icon: Key, color: 'brand' },
          {
            label: t('modules'),
            value: new Set(permissions.map((p) => p.module).filter(Boolean)).size,
            icon: Zap,
            color: 'emerald',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-hud border-brand-500/10 relative overflow-hidden rounded-3xl border p-6"
          >
            <div className="relative z-10 flex items-center gap-4">
              <div
                className={`bg-${stat.color}-500/10 text-${stat.color}-500 border-${stat.color}-500/20 flex h-12 w-12 items-center justify-center rounded-2xl border`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="glass-hud border-brand-500/10 relative overflow-hidden rounded-4xl border">
        <PermissionTable
          permissions={filteredPermissions.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize,
          )}
          loading={loading && isFirstLoad}
          hasError={!!errorType}
          errorType={errorType === 'network' ? 'network' : 'generic'}
          onRetry={() => fetchData()}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          t={t}
          paginationConfig={{
            enabled: true,
            pageSize,
            currentPage,
            totalItems: filteredPermissions.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
          }}
        />
      </div>

      {/* Modal */}
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingPermission={editingPermission}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default PermissionManagement;
