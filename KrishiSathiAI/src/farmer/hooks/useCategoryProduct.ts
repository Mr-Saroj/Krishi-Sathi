import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ShopProduct,
  fetchProductsByCategory,
} from '../services/shopService';

const PAGE_SIZE = 20;

export const formatPrice = (n: number) =>
  `₹${n.toLocaleString('en-IN')}`;

const UNIT_LABELS: Record<string, string> = {
  GRAM: 'g',
  KILOGRAM: 'kg',
  KG: 'kg',
  MILLILITER: 'ml',
  LITER: 'L',
  LITRE: 'L',
  PIECE: 'pc',
  PACKET: 'pkt',
};

export const formatQuantity = (qty: number, unit: string) => {
  const label =
    UNIT_LABELS[unit?.toUpperCase()] ??
    unit?.toLowerCase() ??
    '';

  return `${qty} ${label}`.trim();
};

export default function useCategoryProduct(
  apiCategory: string,
  onCheckout: (product: ShopProduct) => void,
) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Pass the selected product to Shop.tsx.
  const handleBuyNow = useCallback(
    (product: ShopProduct) => {
      onCheckout(product);
    },
    [onCheckout],
  );

  // Load the first page of products.
  const load = useCallback(async () => {
    if (!apiCategory) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetchProductsByCategory(
        apiCategory,
        0,
        PAGE_SIZE,
      );

      setProducts(res.items);
      setLast(res.last);
      setPage(0);
    } catch {
      setError('Could not load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiCategory]);

  useEffect(() => {
    load();
  }, [load]);

  // Load the next page.
  const loadMore = async () => {
    if (loadingMore || loading || last || !apiCategory) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = page + 1;

      const res = await fetchProductsByCategory(
        apiCategory,
        nextPage,
        PAGE_SIZE,
      );

      setProducts((previous) => [
        ...previous,
        ...res.items,
      ]);

      setLast(res.last);
      setPage(nextPage);
    } catch {
      // Keep existing products visible if pagination fails.
    } finally {
      setLoadingMore(false);
    }
  };

  // Search products locally.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return products;
    }

    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [products, query]);

  return {
    // data
    visible,
    loading,
    loadingMore,
    error,

    // search
    query,
    setQuery,
    clearQuery: () => setQuery(''),

    // actions
    load,
    loadMore,
    handleBuyNow,
  };
}