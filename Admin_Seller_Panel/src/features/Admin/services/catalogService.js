import api from "../../../services/api";

// Get all catalog products
export const fetchCatalogProducts = async () => {
  const response = await api.get("/admin/catalog");
  return response.data;
};

// Add catalog product with image
export const createCatalogProduct = async ({
  id,
  category,
  name,
  brand,
  price,
  image,
}) => {
  const data = new FormData();

  data.append("id", id);
  data.append("category", category);
  data.append("name", name);
  data.append("brand", brand);
  data.append("price", String(price));
  data.append("image", image);

  const response = await api.post(
    "/admin/add-catalog",
    data
  );

  return response.data;
};

// Update only the product price
export const updateCatalogProductPrice = async (
  productId,
  price
) => {
  const response = await api.patch(
    `/admin/catalog/${encodeURIComponent(productId)}/price`,
    { price: Number(price) }
  );

  return response.data;
};