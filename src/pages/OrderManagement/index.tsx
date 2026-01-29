import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ShoppingBag, Zap, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { DroneOrder, OrderStatus } from '../../types';
import { useAppContext } from '../../context';
import { getErrorType, ErrorType } from '../../utils/error';
import OrderModal from './components/OrderModal';
import OrderTable from './components/OrderTable';
import OrderStatusFilter from './components/OrderStatusFilter';
import BulkActionHub from '../../components/BulkActionHub';

const OrderManagement = () => {
  const { t, showMessage, confirm } = useAppContext();
  const [orders, setOrders] = useState<DroneOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | number>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<DroneOrder> | null>(null);
  const [formData, setFormData] = useState<Partial<DroneOrder>>({
    projectName: '',
    clientName: '',
    amount: 0,
    status: OrderStatus.PENDING,
    pilotName: '',
  });

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorType(null);
    try {
      const res = await api.getOrders({
        page: currentPage,
        pageSize: pageSize,
        status: statusFilter === 'All' ? undefined : (statusFilter as number),
        keyword: searchTerm || undefined,
      });
      setOrders(res.list);
      setTotalItems(res.total);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setErrorType(getErrorType(error));
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => orders, [orders]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.planNo));
    }
  };

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormData({
      projectName: '',
      clientName: '',
      amount: 0,
      status: OrderStatus.PENDING,
      pilotName: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: DroneOrder) => {
    setEditingOrder(order);
    setFormData({ ...order });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveOrder(formData);
      setIsModalOpen(false);
      fetchOrders(true); // Silent refresh
      showMessage({
        type: 'success',
        title: t('success'),
        message: editingOrder ? t('authModification') : t('recordDeletion'),
      });
    } catch (error) {
      console.error('Failed to save order:', error);
      showMessage({
        type: 'error',
        title: t('error'),
        message: t('operationFailed'),
      });
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm(
      t('bulkDeleteOrdersConfirm').replace('{count}', selectedIds.length.toString()),
      {
        type: 'warning',
        title: t('delete'),
      },
    );

    if (isConfirmed) {
      try {
        for (const id of selectedIds) {
          // Find the order to get planNo if id is numeric
          const order = orders.find(o => o.id === id);
          if (order) {
            await api.deleteOrder(order.planNo);
          }
        }
        setSelectedIds([]);
        fetchOrders(true); // Silent refresh
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to bulk delete orders:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    try {
      for (const id of selectedIds) {
        await api.saveOrder({ id: id as number, status: newStatus });
      }
      setSelectedIds([]);
      fetchOrders(true); // Silent refresh
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

  const handleDelete = async (id: number | string) => {
    const isConfirmed = await confirm(t('confirmDelete'), {
      type: 'warning',
      title: t('delete'),
    });

    if (isConfirmed) {
      try {
        const order = orders.find(o => o.id === id);
        if (order) {
          await api.deleteOrder(order.planNo);
        }
        fetchOrders(true); // Silent refresh
        showMessage({
          type: 'success',
          title: t('success'),
          message: t('recordDeletion'),
        });
      } catch (error) {
        console.error('Failed to delete order:', error);
        showMessage({
          type: 'error',
          title: t('error'),
          message: t('operationFailed'),
        });
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-12 pb-32">
      {/* Tactical Header */}
      <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="flex items-center gap-6">
          <div className="glass-hud border-brand-500/20 group flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl">
            <ShoppingBag className="text-brand-500 h-8 w-8 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">
              {t('orderMgmt')}
            </h1>
            <p className="text-brand-600 dark:text-brand-500 mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.5em] uppercase">
              <Zap className="h-3 w-3 animate-pulse" /> {t('serviceDispatchHub')}
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
                setCurrentPage(1); // Reset to first page on search
              }}
              className="input-tactical-small w-full rounded-2xl py-3 pr-4 pl-10 text-xs font-black tracking-widest text-slate-900 outline-none dark:text-white"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenAdd}
            className="btn-jade flex shrink-0 items-center gap-3 rounded-2xl px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg"
          >
            <Plus className="h-4 w-4" /> {t('newDirective')}
          </motion.button>
        </div>
      </div>

      {/* Filter Row */}
      <OrderStatusFilter statusFilter={statusFilter} onFilterChange={setStatusFilter} t={t} />

      {/* List Table */}
      <div className="relative flex min-h-[400px] flex-1 flex-col">
        <OrderTable
          orders={filteredOrders}
          loading={loading && isFirstLoad}
          hasError={!!errorType}
          errorType={errorType || 'generic'}
          onRetry={() => fetchOrders()}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onToggleSelect={handleToggleSelect}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          paginationConfig={{
            enabled: true,
            currentPage: currentPage,
            pageSize: pageSize,
            totalItems: totalItems,
            onPageChange: (page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            showPageSizeChanger: true,
          }}
          t={t}
        />
      </div>

      {/* Bulk Operations Bar */}
      <BulkActionHub
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        statusLabel={t('targetActive')}
        statusDesc={t('lockedTasks')}
        actions={[
          {
            label: t('bulkComplete'),
            icon: CheckCircle,
            onClick: () => handleBulkStatusChange(OrderStatus.COMPLETED),
            variant: 'success',
          },
          {
            label: t('bulkCancel'),
            icon: XCircle,
            onClick: () => handleBulkStatusChange(OrderStatus.CANCELLED),
            variant: 'warning',
          },
          {
            label: t('archiveProtocols'),
            icon: Trash2,
            onClick: handleBulkDelete,
            variant: 'danger',
          },
        ]}
      />

      {/* Order Modal Component */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingOrder={editingOrder}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
      />
    </div>
  );
};

export default OrderManagement;
