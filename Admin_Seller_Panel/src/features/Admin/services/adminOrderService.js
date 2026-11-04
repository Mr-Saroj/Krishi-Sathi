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