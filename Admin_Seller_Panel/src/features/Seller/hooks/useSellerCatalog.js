import { useCallback, useEffect, useRef, useState } from "react";
import { getSellerCatalog } from "../services/sellerCatalogService";
import { getApiCategory } from "../utils/sellerCatalogUtils";

const useSellerCatalog = (selectedCategory, page = 0, size = 20) => {
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ignores responses from outdated requests (fast clicking, category switch)
  const requestId = useRef(0);

  const fetchCatalog = useCallback(async () => {
    const id = ++requestId.current;
    const category = getApiCategory(selectedCategory);

    if (!category) {
      setProducts([]);
      setTotalElements(0);
      setTotalPages(0);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getSellerCatalog({ category, page, size });
      if (id !== requestId.current) return;

      setProducts(Array.isArray(data.content) ? data.content : []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      if (id !== requestId.current) return;

      setProducts([]);
      setTotalElements(0);
      setTotalPages(0);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to access the seller catalog.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [selectedCategory, page, size]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return {
    products,
    totalElements,
    totalPages,
    loading,
    error,
    refetch: fetchCatalog,
  };
};

export default useSellerCatalog;