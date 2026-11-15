import { useCallback, useEffect, useState } from "react";
import { getSellerPendingSettlements } from "../services/sellerSettlementService";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  (typeof error?.response?.data === "string"
    ? error.response.data
    : null) ||
  error?.message ||
  "Unable to load pending settlements.";

const useSellerSettlements = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSettlements = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError("");

    try {
      const data = await getSellerPendingSettlements();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSettlements();
  }, [loadSettlements]);

  return {
    orders,
    isLoading,
    isRefreshing,
    error,
    loadSettlements,
  };
};

export default useSellerSettlements;