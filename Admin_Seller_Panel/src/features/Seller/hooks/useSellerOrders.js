import { useCallback, useEffect, useState } from "react";
import { sellerOrderService } from "../services/sellerOrderService";

const useSellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await sellerOrderService.getSellerOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Seller orders API error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    refreshing,
    error,
    fetchOrders,
  };
};

export default useSellerOrders;