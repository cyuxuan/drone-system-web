import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Fingerprint, Zap, UserCheck, UserMinus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { User, UserRole, Role } from '../../types';
import { useAppContext } from '../../context';
import { useAuth } from '../../context/AuthContext';
import { getErrorType, ErrorType } from '../../utils/error';
import UserModal from './components/UserModal';
import BulkActionHub from '../../components/BulkActionHub';
import UserTable from './components/UserTable';
import HasPermission from '../../components/HasPermission';

const PAGE_SIZE = 10;

const UserManagement = () => {
  const { t, showMessage, confirm } = useAppContext();
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    email: '',
    phone: '',
    role: UserRole.CLIENT,
    status: 0,
  });
  const [roles, setRoles] = useState<Role[]>([]);

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await api.getRoles();
        setRoles(data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const fetchData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      setErrorType(null);
      try {
        const { users, total } = await api.getUsers(currentPage, pageSize);
        setUsers(users);
        setTotal(total);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setErrorType(getErrorType(error));
      } finally {
        setLoading(false);
        setIsFirstLoad(false);
      }
    },
    [currentPage, pageSize],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      phone: '',
      role: UserRole.CLIENT,
      status: 0,
    });
    setFormData((prev) => ({ ...prev, password: '' }));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveUser(formData);
      setIsModalOpen(false);
      fetchData(true); // Silent refresh
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingUser ? t('saveChanges') : t('confirmAdd'),
      });
    } catch (error) {
      console.error('Failed to save user:', error);
      // Error notification is handled by httpClient interceptor
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm(t('bulkDeleteUsersConfirm', { count: selectedIds.length }), {
      type: 'warning',
      title: t('delete'),
    });

    if (isConfirmed) {
      try {
        for (const id of selectedIds) {
          await api.deleteUser(id);
        }
        setSelectedIds([]);
        fetchData(true); // Silent refresh
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to bulk delete users:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: number) => {
    try {
      for (const id of selectedIds) {
        await api.updateUserStatus(id, newStatus);
      }
      setSelectedIds([]);
      fetchData(true); // Silent refresh
      showMessage({
        type: 'success',
        title: t('success'),
        message: t('authModification'),
      });
    } catch (error) {
      console.error('Failed to change bulk status:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm(t('confirmDelete'), {
      type: 'warning',
      title: t('delete'),
    });

    if (isConfirmed) {
      try {
        await api.deleteUser(id);
        fetchData(true); // Silent refresh
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to delete user:', error);
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
            <Fingerprint className="text-brand-500 h-8 w-8 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('userMgmt')}
            </h1>
            <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
              <Zap className="h-3 w-3 animate-pulse" /> {t('personnelRegistry')}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-tactical-small w-full rounded-2xl py-3 pr-4 pl-10 text-xs font-black tracking-widest text-slate-900 outline-none dark:text-white"
            />
          </div>
          <HasPermission permission="system:user:add">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenAdd}
              className="btn-jade flex shrink-0 items-center gap-3 rounded-2xl px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg"
            >
              <UserPlus className="h-4 w-4" /> {t('addUser')}
            </motion.button>
          </HasPermission>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex min-h-100 flex-1 flex-col">
        <UserTable
          users={filteredUsers}
          loading={loading && isFirstLoad}
          hasError={!!errorType}
          errorType={errorType || 'generic'}
          onRetry={() => fetchData()}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onToggleSelect={handleToggleSelect}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          paginationConfig={{
            enabled: true,
            currentPage: currentPage,
            pageSize: pageSize,
            totalItems: total,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
            showPageSizeChanger: true,
          }}
          t={t}
        />
      </div>

      {/* Optimized Horizontal Command Hub (Bottom-Right) */}
      {(hasPermission('system:user:delete') || hasPermission('system:user:edit')) && (
        <BulkActionHub
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          actions={[
            ...(hasPermission('system:user:edit')
              ? [
                  {
                    label: t('bulkActivate'),
                    icon: UserCheck,
                    onClick: () => handleBulkStatusChange(0),
                    variant: 'success' as const,
                  },
                  {
                    label: t('bulkDeactivate'),
                    icon: UserMinus,
                    onClick: () => handleBulkStatusChange(1),
                    variant: 'warning' as const,
                  },
                ]
              : []),
            ...(hasPermission('system:user:delete')
              ? [
                  {
                    label: t('cancelProtocols'),
                    icon: Trash2,
                    onClick: handleBulkDelete,
                    variant: 'danger' as const,
                  },
                ]
              : []),
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        roles={roles}
      />
    </div>
  );
};

export default UserManagement;
