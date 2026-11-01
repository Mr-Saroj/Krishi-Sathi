import { useCallback, useEffect, useState } from "react";
import {
  getSellerInventory,
  updateSellerStock,
} from "../services/sellerInventoryService";

export const categories = [
  { id: "ALL", name: "All Products" },
  { id: "SEEDS", name: "Seeds" },
  { id: "FERTILIZERS", name: "Fertilizers" },
  { id: "PESTICIDES", name: "Pesticides" },
  { id: "TOOLS", name: "Agricultural Tools" },
  { id: "IRRIGATION", name: "Irrigation" },
];

const useInventory = (selectedCategory = "ALL", page = 0, size = 20) => {
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getSellerInventory({
        category: selectedCategory,
        page,
        size,
      });

      setProducts(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your inventory."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page, size]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const editStock = useCallback(async (productId, stockQuantity) => {
    const quantity = Number(stockQuantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Stock must be a non-negative whole number.");
    }

    setUpdating(true);

    try {
      await updateSellerStock({
        productId,
        stockQuantity: quantity,
      });

      setProducts((prev) =>
        prev.map((product) =>
          product.catalogProductId === productId
            ? { ...product, stockQuantity: quantity }
            : product
        )
      );

      return true;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Unable to update stock."
      );
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    products,
    totalElements,
    totalPages,
    loading,
    updating,
    error,
    editStock,
    refetch: fetchInventory,
  };
};

export default useInventory;