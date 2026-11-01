import api from "../../../services/api";

export const getSellerInventory = async ({
  category,
  page = 0,
  size = 20,
} = {}) => {
  const response = await api.get("/seller/inventory", {
    params: {
      ...(category && category !== "ALL" ? { category } : {}),
      page,
      size,
    },
  });

  return response.data;
};

export const updateSellerStock = async ({
  productId,
  stockQuantity,
}) => {
  const response = await api.put(
    `/seller/inventory/${productId}/stock`,
    { stockQuantity: Number(stockQuantity) }
  );

  return response.data;
};