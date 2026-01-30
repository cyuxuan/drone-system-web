import React from 'react';
import { Package, User as UserIcon, Plane, DollarSign, Zap } from 'lucide-react';
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
  isSaving?: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  editingOrder,
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
      title={editingOrder ? t('editOrderAuth') : t('newOrderAuth')}
      onSave={onSave}
      isSaving={isSaving}
      saveText={t('confirmDirective')}
      formId="order-form"
    >
      <form id="order-form" onSubmit={onSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Package className="h-3.5 w-3.5" /> {t('executionProject')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.projectName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, projectName: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder="Sector_Survey_X"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <UserIcon className="h-3.5 w-3.5" /> {t('clientLabel')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.userId || ''}
              onChange={(e) => setFormData((p) => ({ ...p, userId: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
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
              disabled={isSaving}
              value={formData.pilotName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, pilotName: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder="Callsign_Alpha"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <DollarSign className="h-3.5 w-3.5" /> {t('protocolAmount')}
            </label>
            <input
              required
              disabled={isSaving}
              type="number"
              value={formData.budgetAmount || formData.amount || 0}
              onChange={(e) => setFormData((p) => ({ ...p, budgetAmount: Number(e.target.value) }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight tabular-nums transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
            <Zap className="h-3.5 w-3.5" /> {t('dispatchStatus')}
          </label>
          <select
            disabled={isSaving}
            value={formData.status ?? OrderStatus.PENDING}
            onChange={(e) =>
              setFormData((p) => ({ ...p, status: Number(e.target.value) as OrderStatus }))
            }
            className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full cursor-pointer appearance-none rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
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
      </form>
    </Modal>
  );
};

export default OrderModal;
