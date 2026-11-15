
import { useCallback, useEffect, useState } from "react";
import {
    fetchPendingSettlementOrders,
    completeOrderSettlement,
} from "../services/financeSettlementService";

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    (typeof error?.response?.data === "string"
        ? error.response.data
        : null) ||
    error?.message ||
    "Something went wrong. Please try again.";

const useFinanceSettlement = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [processingOrderId, setProcessingOrderId] = useState(null);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");

    const loadOrders = useCallback(async (showLoader = true) => {
        if (showLoader) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }

        setError("");

        try {
            const data = await fetchPendingSettlementOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const completeSettlement = async (orderId) => {
        if (!orderId || processingOrderId) return;

        setProcessingOrderId(orderId);
        setError("");

        try {
            await completeOrderSettlement(orderId);

            // Remove completed order from the pending list
            setOrders((previous) =>
                previous.filter(
                    (order) => (order.orderId ?? order.id) !== orderId
                )
            );

            setToast(`Settlement completed for ${orderId}.`);

            setTimeout(() => {
                setToast("");
            }, 3000);

            return true;
        } catch (err) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setProcessingOrderId(null);
        }
    };

    return {
        orders,
        isLoading,
        isRefreshing,
        processingOrderId,
        error,
        toast,
        loadOrders,
        completeSettlement,
    };
};

export default useFinanceSettlement;
