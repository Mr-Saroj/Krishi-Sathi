import api from "../../../services/api";

export const getSellerCatalog = async ({ category, page = 0, size = 20 }) => {
  const response = await api.get("/seller/catalog", {
    params: { category, page, size },
  });

  return response.data;
};
export const addInventory = async ({ productId, stockQuantity }) => {
  const response = await api.post("/seller/inventory", {
    productId,
    stockQuantity,
  });

  return response.data;
};