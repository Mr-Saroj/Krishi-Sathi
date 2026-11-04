import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../hooks/componentshook";
import { getPlacedOrders } from "../services/adminOrderService";

export const useOrderManagement = () => {
  const { toast, notify } = useToast();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchPlacedOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getPlacedOrders();

      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch placed orders:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to load placed orders. Please try again.";

      setError(message);
      notify(message);
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchPlacedOrders();
  }, [fetchPlacedOrders]);

  // Selected order for the View drawer.
  const selected = useMemo(() => {
    return orders.find((order) => order.id === selectedId) || null;
  }, [orders, selectedId]);

  // Search orders using fields actually returned by your API.
  const visibleOrders = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return orders;

    return orders.filter((order) =>
      [
        order.id,
        order.farmerId,
        order.productId,
        order.productQuantity,
        order.quantity,
        order.paymentMode,
        order.paymentStatus,
        order.farmerDeliveryAddressId,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      )
    );
  }, [orders, query]);

  // Calculate total value using totalSumFee.
  const totalOrderValue = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(order.totalSumFee || 0),
      0
    );
  }, [orders]);

  return {
    isLoading,
    error,
    toast,
    orders,
    visibleOrders,
    query,
    setQuery,
    selected,
    setSelectedId,
    totalOrderValue,
    refreshOrders: fetchPlacedOrders,
  };
};