import React from 'react';
import { Shield, FileText, LayoutGrid, CheckSquare, Square, Save } from 'lucide-react';
import Modal from '../../../components/Modal';
import { Role } from '../../../types';
import { useAppContext } from '../../../context';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRole: Partial<Role> | null;
  formData: Partial<Role>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Role>>>;
  onSave: (e: React.FormEvent) => Promise<void>;
}

const PERMISSION_CATEGORIES = [
  {
    id: 'personnel',
    labelKey: 'personnel',
    permissions: [
      { id: 'users.view', labelKey: 'users.view' },
      { id: 'users.edit', labelKey: 'users.edit' },
      { id: 'users.delete', labelKey: 'users.delete' },
      { id: 'roles.manage', labelKey: 'roles.manage' },
    ],
  },
  {
    id: 'fleet',
    labelKey: 'fleet',
    permissions: [
      { id: 'orders.view', labelKey: 'orders.view' },
      { id: 'orders.edit', labelKey: 'orders.edit' },
      { id: 'orders.execute', labelKey: 'orders.execute' },
      { id: 'telemetry.live', labelKey: 'telemetry.live' },
    ],
  },
  {
    id: 'logistics',
    labelKey: 'logistics',
    permissions: [
      { id: 'projects.view', labelKey: 'projects.view' },
      { id: 'projects.edit', labelKey: 'projects.edit' },
      { id: 'projects.pricing', labelKey: 'projects.pricing' },
    ],
  },
  {
    id: 'security',
    labelKey: 'security',
    permissions: [
      { id: 'system.logs', labelKey: 'system.logs' },
      { id: 'system.settings', labelKey: 'system.settings' },
      { id: 'system.debug', labelKey: 'system.debug' },
    ],
  },
];

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  editingRole,
  formData,
  setFormData,
  onSave,
}) => {
  const { t } = useAppContext();

  const togglePermission = (permId: string) => {
    const currentPerms = formData.permissions || [];
    const nextPerms = currentPerms.includes(permId)
      ? currentPerms.filter((p) => p !== permId)
      : [...currentPerms, permId];
    setFormData((p) => ({ ...p, permissions: nextPerms }));
  };

  const toggleCategory = (categoryPerms: string[]) => {
    const currentPerms = formData.permissions || [];
    const allInCategory = categoryPerms.every((p) => currentPerms.includes(p));

    let nextPerms: string[];
    if (allInCategory) {
      nextPerms = currentPerms.filter((p) => !categoryPerms.includes(p));
    } else {
      nextPerms = Array.from(new Set([...currentPerms, ...categoryPerms]));
    }
    setFormData((p) => ({ ...p, permissions: nextPerms }));
  };

  const handleSelectAll = () => {
    const allPerms = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.id));
    setFormData((p) => ({ ...p, permissions: allPerms }));
  };

  const handleClearAll = () => {
    setFormData((p) => ({ ...p, permissions: [] }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRole ? t('editRole') : t('addRole')}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={onSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Shield className="h-3.5 w-3.5" /> {t('roleName')}
            </label>
            <input
              required
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder={t('roleNamePlaceholder')}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <FileText className="h-3.5 w-3.5" /> {t('description')}
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                <LayoutGrid className="h-3.5 w-3.5" /> {t('capabilityMatrix')}
              </label>
              <p className="text-[9px] font-medium tracking-widest text-slate-400 uppercase dark:text-slate-500">
                {t('capabilityMatrixDesc')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 border-brand-500/20 rounded-lg border px-3 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all"
              >
                {t('selectAll')}
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-lg border border-slate-500/20 px-3 py-1.5 text-[9px] font-black tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-500/10"
              >
                {t('clearAll')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PERMISSION_CATEGORIES.map((category) => {
              const categoryPermIds = category.permissions.map((p) => p.id);
              const allSelected = categoryPermIds.every((id) =>
                (formData.permissions || []).includes(id),
              );

              return (
                <div
                  key={category.id}
                  className="glass-hud border-brand-500/10 overflow-hidden rounded-2xl border"
                >
                  <div className="bg-brand-500/5 border-brand-500/10 flex items-center justify-between border-b px-5 py-3">
                    <span className="text-brand-600 dark:text-brand-400 text-[10px] font-black tracking-widest uppercase">
                      {t(category.labelKey)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCategory(categoryPermIds)}
                      className="hover:text-brand-500 text-[9px] font-black text-slate-400 uppercase transition-colors"
                    >
                      {allSelected ? t('clearAll') : t('selectModule')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 p-4">
                    {category.permissions.map((perm) => {
                      const isSelected = (formData.permissions || []).includes(perm.id);
                      return (
                        <button
                          key={perm.id}
                          type="button"
                          onClick={() => togglePermission(perm.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                              : 'hover:bg-brand-500/5 border-transparent bg-transparent text-slate-400'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 shrink-0" />
                          )}
                          <span className="text-[10px] font-black tracking-wider uppercase">
                            {t(perm.labelKey)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-brand-500/10 flex justify-end gap-4 border-t pt-8">
          <button
            type="button"
            onClick={onClose}
            className="hover:text-brand-500 rounded-2xl px-8 py-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase transition-all dark:text-slate-500"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="btn-jade flex items-center gap-3 rounded-2xl px-10 py-4 text-[10px] font-black tracking-[0.2em] uppercase shadow-xl"
          >
            <Save className="h-4 w-4" /> {editingRole ? t('saveChanges') : t('confirmAdd')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
