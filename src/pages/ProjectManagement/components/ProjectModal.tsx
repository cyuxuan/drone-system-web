import React from 'react';
import { Package, Layers, DollarSign, CheckCircle2, Info } from 'lucide-react';
import Modal from '../../../components/Modal';
import TacticalSelect from '../../../components/TacticalSelect';
import { DroneProject } from '../../../types';
import { useAppContext } from '../../../context';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: Partial<DroneProject> | null;
  formData: Partial<DroneProject>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<DroneProject>>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  typeConfig: Record<string, { labelKey: string }>;
  isSaving?: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  editingProject,
  formData,
  setFormData,
  onSave,
  typeConfig,
  isSaving = false,
}) => {
  const { t } = useAppContext();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProject ? t('editProjectProtocol') : t('newProjectProtocol')}
      onSave={onSave}
      isSaving={isSaving}
      saveText={t('deployServiceProtocol')}
      formId="project-form"
    >
      <form id="project-form" onSubmit={onSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Package className="h-3.5 w-3.5" /> {t('projectName')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.projectName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, projectName: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('projectNamePlaceholder')}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Layers className="h-3.5 w-3.5" /> {t('projectCode')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.projectCode || ''}
              onChange={(e) => setFormData((p) => ({ ...p, projectCode: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('projectCodePlaceholder')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Layers className="h-3.5 w-3.5" /> {t('businessCategory')}
            </label>
            <TacticalSelect
              disabled={isSaving}
              value={formData.typeNo || ''}
              onChange={(val) =>
                setFormData((p) => ({ ...p, typeNo: val as DroneProject['typeNo'] }))
              }
              options={Object.keys(typeConfig).map((k) => ({
                value: k,
                label: t(typeConfig[k].labelKey),
              }))}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <Package className="h-3.5 w-3.5" /> {t('unit')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.unit || ''}
              onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('unitPlaceholder')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <DollarSign className="h-3.5 w-3.5" /> {t('projectPrice')}
            </label>
            <input
              required
              disabled={isSaving}
              type="number"
              value={formData.projectPrice || 0}
              onChange={(e) => setFormData((p) => ({ ...p, projectPrice: Number(e.target.value) }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight tabular-nums transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('projectPricePlaceholder')}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t('operationalStatus')}
            </label>
            <div className="flex gap-4">
              {[1, 0].map((active) => (
                <button
                  key={active === 1 ? 'on' : 'off'}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setFormData((p) => ({ ...p, isActive: active }))}
                  className={`flex-1 rounded-2xl border py-4 text-[10px] font-black tracking-widest uppercase transition-all ${formData.isActive === active ? 'bg-brand-500 border-brand-500 text-white shadow-lg' : 'bg-brand-500/5 border-brand-500/10 hover:text-brand-500 text-slate-400 dark:text-slate-500'} disabled:opacity-50`}
                >
                  {active === 1 ? t('operational') : t('deactivated')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
            <Info className="h-3.5 w-3.5" /> {t('protocolDetailDesc')}
          </label>
          <textarea
            required
            disabled={isSaving}
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full resize-none rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
            placeholder={t('protocolPlaceholder')}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
