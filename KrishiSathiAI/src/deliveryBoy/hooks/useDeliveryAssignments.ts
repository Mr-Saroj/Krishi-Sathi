import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { deliveryAssignmentService } from '../services/deliveryAssignmentService';

import type {
  AssignmentActionResponse,
  DeliveryOrder,
  PendingAssignmentResponse,
} from '../types/deliveryAssignment.types';

const POLL_INTERVAL_MS = 5000;

/**
 * The pending API only returns seller + timing info.
 * Fields it does not provide get safe defaults so the UI never crashes.
 * Once your backend returns full order details (farmer, items, fee, ...),
 * merge them here (or fetch them by orderId) instead of using defaults.
 */
function mapAssignmentToOrder(
  assignment: PendingAssignmentResponse
): DeliveryOrder {
  return {
    id: assignment.orderId,
    shop: {
      name: assignment.sellerName,
      phone: assignment.sellerPhone,
      address: '', // not in the pending API yet
    },
    farmer: {
      name: '',
      phone: '',
      address: '',
    },
    items: [],
    fee: 0,
    distanceKm: 0,
    etaMin: 0,
    payment: 'Prepaid',
    assignedAt: assignment.assignedAt,
    expiresAt: assignment.expiresAt,
  };
}

function getErrorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || fallback;
}

type Options = {
  /** Poll only when true (driver online and not on a delivery) */
  enabled?: boolean;
};

export default function useDeliveryAssignments({
  enabled = true,
}: Options = {}) {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prevents two polling requests running at the same time
  const inFlightRef = useRef(false);

  const fetchPendingAssignments = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const assignments: PendingAssignmentResponse[] =
        await deliveryAssignmentService.getPendingAssignments();

      const mapped = assignments
        .filter(
          (item) =>
            item.deliveryStatus === 'PENDING' &&
            new Date(item.expiresAt).getTime() > Date.now()
        )
        .map(mapAssignmentToOrder);

      setOrders(mapped);
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Unable to load delivery requests'));
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders((previous) => previous.filter((item) => item.id !== orderId));
  }, []);

  const acceptOrder = useCallback(
    async (order: DeliveryOrder) => {
      try {
        setActionLoading(order.id);

        const result = (await deliveryAssignmentService.acceptAssignment(
          order.id
        )) as AssignmentActionResponse | undefined;

        // Backend may answer 200 but still refuse the assignment
        if (result && result.deliveryStatus !== 'ACCEPTED') {
          throw new Error('Assignment was not accepted');
        }

        removeOrder(order.id);
        setError(null);
        return true;
      } catch (err: any) {
        setError(getErrorMessage(err, 'Unable to accept this order'));
        await fetchPendingAssignments();
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [fetchPendingAssignments, removeOrder]
  );

  const rejectOrder = useCallback(
    async (order: DeliveryOrder) => {
      try {
        setActionLoading(order.id);

        const result = (await deliveryAssignmentService.rejectAssignment(
          order.id
        )) as AssignmentActionResponse | undefined;

        if (result && result.deliveryStatus !== 'REJECTED') {
          throw new Error('Assignment was not rejected');
        }

        removeOrder(order.id);
        setError(null);
        return true;
      } catch (err: any) {
        setError(getErrorMessage(err, 'Unable to reject this order'));
        await fetchPendingAssignments();
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [fetchPendingAssignments, removeOrder]
  );

  // Poll every 5 seconds while enabled (fetches once immediately)
  useEffect(() => {
    if (!enabled) return;

    void fetchPendingAssignments();

    const interval = setInterval(() => {
      void fetchPendingAssignments();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, fetchPendingAssignments]);

  // Refresh when the app returns to the foreground
  useEffect(() => {
    if (!enabled) return;

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void fetchPendingAssignments();
    });

    return () => sub.remove();
  }, [enabled, fetchPendingAssignments]);

  return {
    orders,
    loading,
    actionLoading,
    error,
    fetchPendingAssignments,
    acceptOrder,
    rejectOrder,
  };
}