import React from 'react';
import { Key, Tag, FileText, Globe } from 'lucide-react';
import Modal from '../../../components/Modal';
import { Permission } from '../../../types';
import { useAppContext } from '../../../context';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPermission: Partial<Permission> | null;
  formData: Partial<Permission>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Permission>>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  isSaving?: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  editingPermission,
  formData,
  setFormData,
  onSave,
  isSaving = false,
}) => {
  const { t } = useAppContext();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPermission ? t('editPermission') : t('addPermission')}
      onSave={onSave}
      isSaving={isSaving}
      saveText={editingPermission ? t('saveChanges') : t('confirmAdd')}
      formId="permission-form"
    >
      <form id="permission-form" onSubmit={onSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Key className="h-3.5 w-3.5" /> {t('permissionName')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.permissionName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, permissionName: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('enterPermissionName')}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Globe className="h-3.5 w-3.5" /> {t('permissionCode')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.permissionCode || ''}
              onChange={(e) => setFormData((p) => ({ ...p, permissionCode: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder="system:user:view"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Tag className="h-3.5 w-3.5" /> {t('module')}
            </label>
            <input
              disabled={isSaving}
              type="text"
              value={formData.module || ''}
              onChange={(e) => setFormData((p) => ({ ...p, module: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('enterModule')}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <FileText className="h-3.5 w-3.5" /> {t('description')}
            </label>
            <input
              disabled={isSaving}
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('enterDescription')}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PermissionModal;
