
import api from "../../../services/api";

// Fetch orders waiting for settlement
export const fetchPendingSettlementOrders = async () => {
  const response = await api.get("/admin/orders/settlement-pending");
  return response.data;
};

// Mark an order's settlement as completed
export const completeOrderSettlement = async (orderId) => {
  const response = await api.put(
    `/admin/orders/${encodeURIComponent(orderId)}/settlement-complete`
  );

  return response.data;
};
