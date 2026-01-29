import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, Zap, Plus, Search, Users, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { Role, User } from '../../types';
import { useAppContext } from '../../context';
import { getErrorType, ErrorType } from '../../utils/error';
import RoleTable from './components/RoleTable';
import RoleModal from './components/RoleModal';
import Modal from '../../components/Modal';

const RoleManagement = () => {
  const { t, showMessage, confirm } = useAppContext();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Role Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: [],
  });

  // Member List State
  const [viewingMembersRole, setViewingMembersRole] = useState<string | null>(null);
  const [roleMembers, setRoleMembers] = useState<User[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorType(null);
    try {
      const data = await api.getRoles();
      // 将后端数据格式转换为前端格式
      const mappedRoles = data.map(role => ({
        ...role,
        id: role.roleId || role.id,
        name: role.roleName || role.name,
      }));
      setRoles(mappedRoles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setErrorType(getErrorType(error));
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [roles, searchTerm]);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ ...role });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveRole(formData);
      setIsModalOpen(false);
      fetchData(true); // 静默刷新，避免闪烁
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingRole ? t('authModification') : t('recordCreation'),
      });
    } catch (error) {
      console.error('Failed to save role:', error);
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
        await api.deleteRole(id);
        fetchData(true); // 静默刷新，避免闪烁
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to delete role:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  const handleViewMembers = async (roleName: string) => {
    setViewingMembersRole(roleName);
    setMembersLoading(true);
    try {
      const members = await api.getUsersByRole(roleName);
      setRoleMembers(members);
    } catch (error) {
      console.error('Failed to fetch role members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 flex-col space-y-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="flex items-center gap-6">
          <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
            <Shield className="text-brand-500 h-8 w-8 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('roleMgmt')}
            </h1>
            <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
              <Zap className="h-3 w-3 animate-pulse" /> {t('securityClearanceMatrix')}
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
            onClick={handleOpenAdd}
            className="btn-jade flex shrink-0 items-center gap-3 rounded-2xl px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg"
          >
            <Plus className="h-4 w-4" /> {t('createRole')}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-100 flex-1 flex-col">
        <RoleTable
          roles={filteredRoles}
          loading={loading && isFirstLoad}
          hasError={!!errorType}
          errorType={errorType || 'generic'}
          onRetry={() => fetchData()}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onViewMembers={handleViewMembers}
          paginationConfig={{
            enabled: true,
            currentPage: currentPage,
            pageSize: pageSize,
            totalItems: filteredRoles.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
            showPageSizeChanger: true,
          }}
          t={t}
        />
      </div>

      {/* Modals */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRole={editingRole}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
      />

      <Modal
        isOpen={!!viewingMembersRole}
        onClose={() => setViewingMembersRole(null)}
        title={`${viewingMembersRole} - ${t('memberList')}`}
      >
        <div className="space-y-6">
          <div className="bg-brand-500/5 border-brand-500/10 flex items-center gap-4 rounded-2xl border p-4">
            <div className="bg-brand-500/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <Users className="text-brand-500 h-5 w-5" />
            </div>
            <div>
              <p className="text-brand-600 dark:text-brand-400 text-[10px] font-black tracking-widest uppercase">
                {t('memberRoster')}
              </p>
              <p className="mt-1 text-[9px] font-medium tracking-widest text-slate-400 uppercase dark:text-slate-500">
                {t('syncingPersonnel')}
              </p>
            </div>
          </div>

          <div className="custom-scrollbar max-h-100 space-y-2 overflow-y-auto pr-2">
            {membersLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-brand-500/2 h-16 animate-pulse rounded-xl" />
              ))
            ) : roleMembers.length > 0 ? (
              roleMembers.map((member) => (
                <div
                  key={member.id}
                  className="group hover:border-brand-500/30 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition-all dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="group-hover:bg-brand-500 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500 transition-colors group-hover:text-white dark:bg-slate-800">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-tight text-slate-900 uppercase dark:text-white">
                        {member.username}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] font-medium text-slate-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-500/5">
                  <Info className="h-8 w-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    {t('noActiveCommanders')}
                  </p>
                  <p className="text-[9px] font-medium tracking-widest text-slate-500 uppercase">
                    {t('assignPersonnel')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-brand-500/10 flex justify-end border-t pt-6">
            <button
              onClick={() => setViewingMembersRole(null)}
              className="hover:text-brand-500 rounded-xl px-8 py-3 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase transition-all"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;
