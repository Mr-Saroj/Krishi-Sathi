import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../hooks/componentshook";
import {
  getPlacedOrders,
  getOrderAssignments,
  getAvailableSellers,
  getAvailableDeliveryBoys,
  assignSellerToOrder,
  assignDeliveryBoyToOrder,
} from "../services/adminOrderService";

// order_assignments is flat (sellerId, sellerName, ...).
// The UI uses order.seller / order.deliveryBoy objects, so convert here.
const toAssignedFields = (a) => ({
  seller: a?.sellerId
    ? { id: a.sellerId, name: a.sellerName, phone: a.sellerPhone }
    : null,
  deliveryBoy: a?.deliveryBoyId
    ? { id: a.deliveryBoyId, name: a.deliveryBoyName, phone: a.deliveryBoyPhone }
    : null,
});

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

      // Orders and their assignments come from two collections; load both.
      const [data, assignments] = await Promise.all([
        getPlacedOrders(),
        getOrderAssignments().catch(() => []), // orders still load if this fails
      ]);

      const byOrderId = new Map(assignments.map((a) => [a.orderId, a]));

      setOrders(
        data.map((order) => ({
          ...order,
          ...toAssignedFields(byOrderId.get(order.id)),
        }))
      );
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

  const selected = useMemo(() => {
    return orders.find((order) => order.id === selectedId) || null;
  }, [orders, selectedId]);

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
        order.seller?.name,
        order.deliveryBoy?.name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      )
    );
  }, [orders, query]);

  const totalOrderValue = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(order.totalSumFee || 0),
      0
    );
  }, [orders]);

  // ---------- Seller / delivery boy assignment ----------

  const patchOrder = (orderId, patch) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o))
    );

  const loadSellers = (orderId) => getAvailableSellers(orderId);
  const loadDeliveryBoys = (orderId) => getAvailableDeliveryBoys(orderId);

  const assignSeller = async (orderId, sellerId) => {
    const assignment = await assignSellerToOrder(orderId, sellerId);
    patchOrder(orderId, toAssignedFields(assignment));
    notify("Seller assigned successfully");
  };

  const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
    await assignDeliveryBoyToOrder(orderId, deliveryBoyId);

    // Order is now CONFIRMED on the backend, so remove it from the Placed list
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setSelectedId(null);

    notify("Order confirmed. Seller and delivery boy assigned.");
  };

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
    loadSellers,
    loadDeliveryBoys,
    assignSeller,
    assignDeliveryBoy,
  };
};