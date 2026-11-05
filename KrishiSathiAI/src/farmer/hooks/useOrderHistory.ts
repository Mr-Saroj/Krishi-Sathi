import { useState } from "react";

export function useOrderHistory() {
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const openOrders = () => setShowOrders(true);

  const closeOrders = () => {
    setShowOrders(false);
    setSelectedOrder(null);
  };

  const openOrderDetails = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  return {
    showOrders,
    selectedOrder,
    openOrders,
    closeOrders,
    openOrderDetails,
    closeOrderDetails,
  };
}