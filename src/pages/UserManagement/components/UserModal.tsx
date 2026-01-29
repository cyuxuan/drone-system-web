import React from 'react';
import { Fingerprint, Mail, Shield, Activity, Save, Lock, Phone } from 'lucide-react';
import Modal from '../../../components/Modal';
import TacticalSelect from '../../../components/TacticalSelect';
import { User, UserRole, Role } from '../../../types';
import { useAppContext } from '../../../context';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: Partial<User> | null;
  formData: Partial<User>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<User>>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  roles?: Role[];
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  formData,
  setFormData,
  onSave,
  roles = [],
}) => {
  const { t } = useAppContext();

  // Use roles from API if available, fallback to hardcoded options
  const roleOptions = roles.length > 0
    ? roles.map(role => ({
        value: role.roleCode || role.name || role.id,
        label: role.roleName || role.name,
      }))
    : [
        { value: UserRole.ADMIN, label: t('commander') },
        { value: UserRole.DISPATCHER, label: t('dispatcher') },
        { value: UserRole.PILOT, label: t('pilot') },
        { value: UserRole.CLIENT, label: t('client') },
      ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? t('editUserAuth') : t('addNewUser')}
    >
      <form onSubmit={onSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Fingerprint className="h-3.5 w-3.5" /> {t('username')}
            </label>
            <input
              required
              type="text"
              value={formData.username || ''}
              onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder="Overwatch_Callsign"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" /> {t('email')}
            </label>
            <input
              required
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder="contact@cloudgo.net"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Phone className="h-3.5 w-3.5" /> {t('phoneNumber')}
            </label>
            <input
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder="138-0000-0000"
            />
          </div>
          {!editingUser && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
                <Lock className="h-3.5 w-3.5" /> {t('password')}
              </label>
              <input
                required
                type="password"
                value={(formData as Partial<User & { password?: string }>).password || ''}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, password: e.target.value }) as Partial<User>)
                }
                className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Shield className="h-3.5 w-3.5" /> {t('role')}
            </label>
            <TacticalSelect
              value={formData.role || UserRole.CLIENT}
              onChange={(val) => setFormData((p) => ({ ...p, role: val as UserRole }))}
              options={roleOptions}
              icon={<Shield className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Activity className="h-3.5 w-3.5" /> {t('status')}
            </label>
            <div className="flex items-center gap-4">
              {(['active', 'disabled'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, status }))}
                  className={`flex-1 rounded-2xl border-2 py-4 text-[10px] font-black tracking-widest uppercase transition-all ${
                    formData.status === status
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-lg'
                      : 'border-transparent bg-slate-500/5 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {status === 'active' ? t('operational') : t('disabled')}
                </button>
              ))}
            </div>
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
            <Save className="h-4 w-4" /> {editingUser ? t('saveChanges') : t('confirmAdd')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
