
import { useCallback, useEffect, useState } from "react";

import { farmerOrderService } from "../services/farmerOrderService";
import type { FarmerOrder } from "../types/order.types";

export function useOrderHistory() {
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<FarmerOrder | null>(null);

  const [selectedOrderId, setSelectedOrderId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [showOrders, setShowOrders] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const data = await farmerOrderService.getMyOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log(
        "FETCH ORDERS ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const openOrders = useCallback(() => {
    setShowOrders(true);
    setSelectedOrderId(null);
    setSelectedOrder(null);
  }, []);

  const closeOrders = useCallback(() => {
    setShowOrders(false);
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setDetailsError(null);
  }, []);

  const openOrderDetails = useCallback(async (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedOrder(null);

    try {
      const data = await farmerOrderService.getOrderDetails(orderId);

      setSelectedOrder(data);
    } catch (err: any) {
      console.log(
        "ORDER DETAILS ERROR:",
        err.response?.data || err.message
      );

      setDetailsError(
        err.response?.data?.message ||
          "Unable to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const closeOrderDetails = useCallback(() => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setDetailsError(null);
  }, []);

  const retryOrderDetails = useCallback(() => {
    if (selectedOrderId) {
      openOrderDetails(selectedOrderId);
    }
  }, [selectedOrderId, openOrderDetails]);

  useEffect(() => {
    if (showOrders) {
      fetchOrders();
    }
  }, [showOrders, fetchOrders]);

  return {
    orders,
    selectedOrder,
    selectedOrderId,

    loading,
    detailsLoading,
    refreshing,

    error,
    detailsError,

    showOrders,

    openOrders,
    closeOrders,

    openOrderDetails,
    closeOrderDetails,
    retryOrderDetails,

    fetchOrders,
  };
}
