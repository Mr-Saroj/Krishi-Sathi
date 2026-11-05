import api from "../../../services/api";

// GET /api/admin/orders/placed
export const getPlacedOrders = async () => {
  const response = await api.get("/admin/orders/placed");

  const body = response.data;

  // Support direct arrays and common API response wrappers.
  let orders = [];

  if (Array.isArray(body)) {
    orders = body;
  } else if (Array.isArray(body?.data)) {
    orders = body.data;
  } else if (Array.isArray(body?.orders)) {
    orders = body.orders;
  } else if (Array.isArray(body?.content)) {
    orders = body.content;
  }

  // Normalize the ID in case the backend returns _id instead of id.
  return orders.map((order) => ({
    ...order,
    id: order.id ?? order._id,
  }));
};
export const getAvailableSellers = async (orderId) => {
  const res = await api.get(`/admin/orders/${orderId}/available-sellers`);
  return res.data;
};

// Delivery boys active in this order's delivery location
export const getAvailableDeliveryBoys = async (orderId) => {
  const res = await api.get(`/admin/orders/${orderId}/available-delivery-boys`);
  return res.data;
};

export const assignSellerToOrder = async (orderId, sellerId) => {
  const res = await api.put(`/admin/orders/${orderId}/assign-seller`, { sellerId });
  return res.data;
};

export const assignDeliveryBoyToOrder = async (orderId, deliveryBoyId) => {
  const res = await api.put(`/admin/orders/${orderId}/assign-delivery-boy`, { deliveryBoyId });
  return res.data;
};
export const getOrderAssignments = async () => {
  const res = await api.get("/admin/orders/assignments");
  return Array.isArray(res.data) ? res.data : [];
};