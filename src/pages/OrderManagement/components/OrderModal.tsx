import React from 'react';
import { Package, User as UserIcon, Plane, DollarSign, Zap, Save } from 'lucide-react';
import Modal from '../../../components/Modal';
import { DroneOrder, OrderStatus } from '../../../types';
import { useAppContext } from '../../../context';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingOrder: Partial<DroneOrder> | null;
  formData: Partial<DroneOrder> & { amount?: number; budgetAmount?: number };
  setFormData: React.Dispatch<React.SetStateAction<Partial<DroneOrder>>>;
  onSave: (e: React.FormEvent) => Promise<void>;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  editingOrder,
  formData,
  setFormData,
  onSave,
}) => {
  const { t } = useAppContext();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingOrder ? t('editOrderAuth') : t('newOrderAuth')}
    >
      <form onSubmit={onSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Package className="h-3.5 w-3.5" /> {t('executionProject')}
            </label>
            <input
              required
              type="text"
              value={formData.projectName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, projectName: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder="Sector_Survey_X"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <UserIcon className="h-3.5 w-3.5" /> {t('clientLabel')}
            </label>
            <input
              required
              type="text"
              value={formData.userId || ''}
              onChange={(e) => setFormData((p) => ({ ...p, userId: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder="User_ID_001"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Plane className="h-3.5 w-3.5" /> {t('pilotLabel')}
            </label>
            <input
              type="text"
              value={formData.pilotName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, pilotName: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder="Callsign_Alpha"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <DollarSign className="h-3.5 w-3.5" /> {t('protocolAmount')}
            </label>
            <input
              required
              type="number"
              value={formData.budgetAmount || formData.amount || 0}
              onChange={(e) => setFormData((p) => ({ ...p, budgetAmount: Number(e.target.value) }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight tabular-nums transition-all outline-none dark:bg-slate-900 dark:text-white"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
            <Zap className="h-3.5 w-3.5" /> {t('dispatchStatus')}
          </label>
          <select
            value={formData.status ?? OrderStatus.PENDING}
            onChange={(e) => setFormData((p) => ({ ...p, status: Number(e.target.value) as OrderStatus }))}
            className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full cursor-pointer appearance-none rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none dark:bg-slate-900 dark:text-white"
          >
            {[
              { label: t('statusPending'), value: OrderStatus.PENDING },
              { label: t('statusScheduled'), value: OrderStatus.SCHEDULED },
              { label: t('statusInProgress'), value: OrderStatus.IN_PROGRESS },
              { label: t('statusCancelled'), value: OrderStatus.CANCELLED },
              { label: t('statusCompleted'), value: OrderStatus.COMPLETED },
            ].map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-3xl bg-slate-100 px-8 py-4 text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
          >
            {t('discardChanges')}
          </button>
          <button
            type="submit"
            className="btn-jade flex flex-2 items-center justify-center gap-3 rounded-3xl px-8 py-4 text-[11px] font-black tracking-[0.3em] uppercase shadow-xl"
          >
            <Save className="h-4 w-4" /> {t('confirmDirective')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OrderModal;
