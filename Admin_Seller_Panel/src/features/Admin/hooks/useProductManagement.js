// hooks.js — custom hooks for ProductManagement
import { useEffect, useMemo, useState } from 'react';

// Fake loading state (replace with real API loading later)
export const useSimulatedLoading = (delay = 650) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoading;
};

// Auto-dismissing toast message
export const useToast = (duration = 2800) => {
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  return { toast, notify: setToast };
};

// Dashboard stat counters
export const useProductStats = (products, complaints) =>
  useMemo(
    () => ({
      total: products.filter((p) => p.status !== 'REMOVED').length,
      pending: products.filter((p) => p.status === 'PENDING').length,
      approved: products.filter((p) => p.status === 'APPROVED').length,
      issues:
        products.filter((p) => p.priceChangePending && p.status !== 'REMOVED').length +
        complaints.filter((c) => c.status === 'OPEN').length,
    }),
    [products, complaints]
  );

// Search + filters + tab filtering for the product table
export const useVisibleProducts = ({
  products,
  complaints,
  query,
  statusFilter,
  categoryFilter,
  tab,
}) =>
  useMemo(() => {
    const q = query.toLowerCase();

    return products.filter((p) => {
      const matchesQuery = [p.name, p.id, p.brand, p.category, p.seller].some((value) =>
        value.toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesTab =
        tab === 'products' ||
        (tab === 'priceChanges' && p.priceChangePending && p.status !== 'REMOVED') ||
        (tab === 'complaints' &&
          complaints.some((c) => c.productId === p.id && c.status === 'OPEN'));

      return matchesQuery && matchesStatus && matchesCategory && matchesTab && p.status !== 'REMOVED';
    });
  }, [products, query, statusFilter, categoryFilter, tab, complaints]);