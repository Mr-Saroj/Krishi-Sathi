import api from "../../../services/api";

export const sellerOrderService = {
  getSellerOrders: async () => {
    const response = await api.get("/seller/products/orders");
    return response.data;
  },

  generatePickupOtp: async (orderId) => {
    const response = await api.post(
      `/seller/products/${orderId}/pickup-otp`
    );

    return response.data;
  },
};