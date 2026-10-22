// orderManagementHooks.js — state, derived data and actions for Order Management
import { useMemo, useState } from 'react';
import { useSimulatedLoading, useToast } from '../hooks/componentshook';
import {
  INITIAL_ORDERS, EMPTY_FILTERS, isDelayed, isCancelledOrReturned,
  needsAttention, filterOrders, sellerProgress,
} from '../utils/orderManagementUtils';

export const useOrderManagement = () => {
  const isLoading = useSimulatedLoading(650);
  const { toast, notify } = useToast();

  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [tab, setTab] = useState('all');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState(null);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const selected = orders.find((o) => o.id === selectedId) || null;

  const counts = useMemo(
    () => ({
      delayed: orders.filter(isDelayed).length,
      issues: orders.filter(isCancelledOrReturned).length,
      disputes: orders.filter(needsAttention).length,
    }),
    [orders]
  );
  const visibleOrders = useMemo(() => filterOrders(orders, filters, tab), [orders, filters, tab]);
  const progress = useMemo(() => sellerProgress(orders), [orders]);

  const updateOrder = (id, fn, message) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? fn(o) : o)));
    if (message) notify(message);
  };

  const resolveDispute = (id, favour) =>
    updateOrder(
      id,
      (o) => ({
        ...o,
        dispute: { ...o.dispute, status: 'RESOLVED', outcome: favour },
        refundStatus:
          favour === 'CUSTOMER' && o.payment === 'PAID' && o.refundStatus === 'NONE'
            ? 'REQUESTED'
            : o.refundStatus,
      }),
      favour === 'CUSTOMER'
        ? 'Dispute resolved in favour of the customer.'
        : 'Dispute resolved in favour of the seller.'
    );

  const approveRefund = (id) => {
    if (!window.confirm('Approve this refund? The amount will be returned to the customer.')) return;
    updateOrder(id, (o) => ({ ...o, payment: 'REFUNDED', refundStatus: 'APPROVED' }), 'Refund approved.');
  };

  return {
    isLoading,
    toast,
    orders,
    tab,
    setTab,
    filters,
    setFilters,
    setFilter,
    selected,
    setSelectedId,
    counts,
    visibleOrders,
    progress,
    resolveDispute,
    approveRefund,
  };
};