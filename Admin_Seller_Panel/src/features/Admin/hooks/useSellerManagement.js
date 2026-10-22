
import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

import {
  INITIAL_SELLERS,
  getSellerStats,
  filterSellers,
} from '../utils/sellerManagementUtils';

/**
 * State and actions for Seller Management.
 * Currently uses local initial seller data.
 */
const useSellerManagement = () => {
  // Loading state for initial page rendering
  const [isLoading, setIsLoading] = useState(true);

  const [sellers, setSellers] = useState(INITIAL_SELLERS);
  const [tab, setTab] = useState('applications');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState('');

  // Simulate initial loading for the local seller data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Statistics
  const stats = useMemo(
    () => getSellerStats(sellers),
    [sellers]
  );

  // Filter sellers according to tab, search and status
  const visibleSellers = useMemo(
    () => filterSellers(sellers, { tab, query, status }),
    [sellers, tab, query, status]
  );

  // Currently selected seller
  const selectedSeller = useMemo(
    () => sellers.find((s) => s.id === selectedId) || null,
    [sellers, selectedId]
  );

  // Automatically dismiss toast
  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => {
      setToast('');
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  // Update seller information
  const update = useCallback((id, patch, message) => {
    setSellers((prev) =>
      prev.map((seller) =>
        seller.id === id
          ? {
              ...seller,
              ...(typeof patch === 'function'
                ? patch(seller)
                : patch),
            }
          : seller
      )
    );

    if (message) {
      setToast(message);
    }
  }, []);

  // Seller actions
  const approve = useCallback(
    (id) =>
      update(
        id,
        { status: 'APPROVED', note: '' },
        'Seller approved.'
      ),
    [update]
  );

  const reject = useCallback(
    (id, reason) =>
      update(
        id,
        { status: 'REJECTED', note: reason },
        'Application rejected.'
      ),
    [update]
  );

  const suspend = useCallback(
    (id, reason) =>
      update(
        id,
        { status: 'SUSPENDED', note: reason },
        'Seller suspended.'
      ),
    [update]
  );

  const reinstate = useCallback(
    (id) =>
      update(
        id,
        { status: 'APPROVED', note: '' },
        'Seller reinstated.'
      ),
    [update]
  );

  const resolveComplaint = useCallback(
    (sellerId, complaintId) =>
      update(
        sellerId,
        (seller) => ({
          complaints: seller.complaints.map((complaint) =>
            complaint.id === complaintId
              ? { ...complaint, status: 'RESOLVED' }
              : complaint
          ),
        }),
        'Complaint marked as resolved.'
      ),
    [update]
  );

  return {
    isLoading,

    tab,
    setTab,

    query,
    setQuery,

    status,
    setStatus,

    stats,
    visibleSellers,
    selectedSeller,

    openSeller: setSelectedId,
    closeSeller: () => setSelectedId(null),

    toast,

    actions: {
      approve,
      reject,
      suspend,
      reinstate,
      resolveComplaint,
    },
  };
};

export default useSellerManagement;
