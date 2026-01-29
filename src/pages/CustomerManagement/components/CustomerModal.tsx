import React from 'react';
import { User, Phone, Globe, Shield, Activity, Save, Image as ImageIcon } from 'lucide-react';
import Modal from '../../../components/Modal';
import { Customer } from '../../../types';
import { useAppContext } from '../../../context';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<Customer>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Customer>>>;
  onSave: (e: React.FormEvent) => Promise<void>;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
}) => {
  const { t } = useAppContext();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('editCustomer')}>
      <form onSubmit={onSave} className="space-y-8">
        {/* Basic Info Section */}
        <div className="pointer-events-none grid grid-cols-1 gap-8 opacity-50 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <User className="h-3.5 w-3.5" /> {t('customerName')}
            </label>
            <input
              required
              readOnly
              type="text"
              value={formData.name || ''}
              className="bg-brand-500/5 border-brand-500/20 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Activity className="h-3.5 w-3.5" /> {t('nickname')}
            </label>
            <input
              required
              readOnly
              type="text"
              value={formData.nickname || ''}
              className="bg-brand-500/5 border-brand-500/20 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pointer-events-none grid grid-cols-1 gap-8 opacity-50 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Phone className="h-3.5 w-3.5" /> {t('phoneNumber')}
            </label>
            <input
              required
              readOnly
              type="tel"
              value={formData.phoneNumber || ''}
              className="bg-brand-500/5 border-brand-500/20 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Globe className="h-3.5 w-3.5" /> {t('registrationSource')}
            </label>
            <div className="bg-brand-500/5 border-brand-500/20 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white">
              {formData.source === 'WeChat'
                ? t('wechatMP')
                : formData.source === 'Douyin'
                  ? t('douyinMP')
                  : t('alipayMP')}
            </div>
          </div>
        </div>

        {/* Technical/ID Section */}
        <div className="pointer-events-none space-y-3 opacity-50">
          <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
            <Shield className="h-3.5 w-3.5" /> {t('openIdLabel')}
          </label>
          <input
            readOnly
            type="text"
            value={formData.openId || ''}
            className="bg-brand-500/5 border-brand-500/20 w-full rounded-2xl border-b-2 px-6 py-4 font-mono text-sm font-bold tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="pointer-events-none space-y-3 opacity-50">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <ImageIcon className="h-3.5 w-3.5" /> {t('avatarUrl')}
            </label>
            <input
              readOnly
              type="url"
              value={formData.avatar || ''}
              className="bg-brand-500/5 border-brand-500/20 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Activity className="h-3.5 w-3.5" /> {t('accountStatus')}
            </label>
            <div className="flex items-center gap-4">
              {(['active', 'blacklisted'] as const).map((status) => (
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
                  {status === 'active' ? t('activeStatus') : t('blacklistedStatus')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Section */}
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
            <Save className="h-4 w-4" />
            {t('saveChanges')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;
