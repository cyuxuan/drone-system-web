import { useState, useCallback, useMemo } from 'react';
import { Users, Search, RefreshCcw, Zap, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Customer } from '../../types';
import { useAppContext } from '../../context';
import CustomerTable from './components/CustomerTable';
import CustomerModal from './components/CustomerModal';
import BulkActionHub from '../../components/BulkActionHub';

const CustomerManagement = () => {
  const { t, confirm, showMessage } = useAppContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const handleDataChange = useCallback((data: Customer[], _totalCount: number) => {
    setCustomers(data);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateCustomerStatus(formData.customerNo!, formData.status === 0 ? 1 : 0);
      setIsModalOpen(false);
      handleRefresh();
      showMessage({
        type: 'success',
        title: t('success'),
        message: t('saveSuccess'),
      });
    } catch (error) {
      console.error('Failed to save customer:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    try {
      await api.updateCustomerStatus(id, newStatus);
      handleRefresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm(t('deleteCustomerConfirm'), {
      type: 'warning',
      title: t('delete'),
    });

    if (isConfirmed) {
      try {
        await api.deleteCustomer(id);
        handleRefresh();
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to delete customer:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.customerNo));
    }
  };

  const handleToggleSelect = (customerNo: string) => {
    setSelectedIds((prev) =>
      prev.includes(customerNo) ? prev.filter((i) => i !== customerNo) : [...prev, customerNo],
    );
  };

  const fetchConfig = useMemo(
    () => ({
      onFetch: async (params: Record<string, unknown>) => {
        const res = await api.getCustomers(
          params.page as number,
          params.pageSize as number,
          params.searchTerm as string,
        );
        return { data: res.list, total: res.total };
      },
      params: { searchTerm },
      refreshKey,
    }),
    [searchTerm, refreshKey],
  );

  return (
    <div className="relative flex flex-1 flex-col space-y-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="flex items-center gap-6">
          <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
            <Users className="text-brand-500 h-8 w-8 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h1 className="flex items-center gap-4 text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('customerMgmt')}
            </h1>
            <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
              <Zap className="h-3 w-3 animate-pulse" /> {t('miniProgramMgmt')}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-4 lg:w-auto">
          <div className="group relative w-full lg:w-72">
            <Search className="group-focus-within:text-brand-500 absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('searchCustomer')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="input-tactical-small w-full rounded-2xl py-3 pr-4 pl-10 text-xs font-black tracking-widest text-slate-900 outline-none dark:text-white"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="hover:bg-brand-500/10 hover:text-brand-600 border-brand-500/10 rounded-2xl border bg-slate-500/5 p-3 text-slate-500 transition-all dark:text-slate-400"
            title={t('refresh')}
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-[400px] flex-1 flex-col">
        <CustomerTable
          fetchConfig={fetchConfig}
          onDataChange={handleDataChange}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onToggleSelect={handleToggleSelect}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onRowClick={handleEdit}
          paginationConfig={{
            enabled: true,
            showPageSizeChanger: true,
          }}
        />
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Action Hub */}
      <BulkActionHub
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          {
            label: t('delete'),
            icon: Trash2,
            onClick: async () => {
              const isConfirmed = await confirm(
                t('bulkDeleteCustomersConfirm', { count: selectedIds.length }),
                {
                  type: 'warning',
                  title: t('delete'),
                },
              );
              if (isConfirmed) {
                try {
                  for (const id of selectedIds) {
                    await api.deleteCustomer(id);
                  }
                  setSelectedIds([]);
                  handleRefresh();
                  showMessage({
                    type: 'success',
                    title: t('success'),
                    message: t('recordDeletion'),
                  });
                } catch (error) {
                  console.error('Failed to bulk delete customers:', error);
                }
              }
            },
            variant: 'danger',
          },
          {
            label: t('refresh'),
            icon: RefreshCcw,
            onClick: handleRefresh,
          },
        ]}
      />
    </div>
  );
};

export default CustomerManagement;
