import React from 'react';
import { Hash, Tag, Layers, FileText } from 'lucide-react';
import Modal from '../../../components/Modal';
import TacticalSelect from '../../../components/TacticalSelect';
import { ProjectType } from '../../../types';
import { useAppContext } from '../../../context';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Partial<ProjectType> | null;
  formData: Partial<ProjectType>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ProjectType>>>;
  onSave: (e: React.FormEvent) => void;
  isSaving?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
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
      title={editingCategory ? t('editCategory') : t('newCategory')}
      onSave={onSave}
      isSaving={isSaving}
      saveText={editingCategory ? t('saveChanges') : t('newCategory')}
      formId="category-form"
    >
      <form id="category-form" onSubmit={onSave} className="space-y-8 p-2">
        {/* Category Name */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
            <Tag className="text-brand-500 h-3 w-3" />
            {t('categoryName')}
          </label>
          <input
            required
            disabled={isSaving}
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
            placeholder={t('categoryNamePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Category Code */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
              <Hash className="text-brand-500 h-3 w-3" />
              {t('categoryCode')}
            </label>
            <input
              required
              disabled={isSaving}
              type="text"
              value={formData.code || ''}
              onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
              className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 w-full rounded-2xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
              placeholder={t('categoryCodePlaceholder')}
            />
          </div>

          {/* Category Type (Category Number) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
              <Layers className="text-brand-500 h-3.5 w-3.5" />
              {t('categoryType')}
            </label>
            <TacticalSelect
              disabled={isSaving}
              value={formData.category?.toString() || ''}
              onChange={(val) => setFormData((p) => ({ ...p, category: parseInt(val) }))}
              options={[
                { value: '1', label: t('photographyMapping') },
                { value: '2', label: t('agriculturalProtection') },
                { value: '3', label: t('inspectionPower') },
                { value: '4', label: t('deliveryLogistics') },
              ]}
              placeholder={t('categoryTypePlaceholder')}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
            <FileText className="text-brand-500 h-3 w-3" />
            {t('categoryDesc')}
          </label>
          <textarea
            disabled={isSaving}
            value={formData.description || ''}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            className="bg-brand-500/5 border-brand-500/20 focus:border-brand-500 h-32 w-full resize-none rounded-3xl border-b-2 px-6 py-4 text-sm font-black tracking-tight transition-all outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-white"
            placeholder={t('categoryDescPlaceholder')}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
