import React, { useEffect, useMemo, useState } from "react";
import ProductManagementSkeleton from "../Skeliton/ProductManagementSkeleton";
import { useToast } from "../hooks/useProductManagement";
import {
  CATEGORY_OPTIONS,
  money,
  inputBase,
} from "../utils/useProductManagementUtils";
import {
  createCatalogProduct,
  fetchCatalogProducts,
  updateCatalogProductPrice,
} from "../services/catalogService";

const emptyForm = {
  id: "",
  category: CATEGORY_OPTIONS[0],
  name: "",
  brand: "",
  price: "",
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.message ||
  "Something went wrong. Please try again.";

const ProductManagement = () => {
  const { toast, notify } = useToast(2800);

  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [priceProduct, setPriceProduct] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const products = await fetchCatalogProducts();
      setCatalog(Array.isArray(products) ? products : []);
    } catch (err) {
      setError(getErrorMessage(err));
      notify(`Could not load catalog: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    // loadCatalog is intentionally called once on initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return catalog.filter((product) => {
      const values = [
        product.id,
        product.name,
        product.brand,
        product.category,
      ];
      const matchesQuery = values.some((value) =>
        String(value ?? "").toLowerCase().includes(q)
      );
      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [catalog, query, categoryFilter]);

  const updateField = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setError("");
  };

  const openForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setShowForm(false);
    setImageFile(null);
    setImagePreview("");
    setError("");
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setError("");

    const id = form.id.trim().toUpperCase();
    const name = form.name.trim();
    const brand = form.brand.trim();
    const price = Number(form.price);

    if (!id || !name || !brand) {
      setError("Product ID, name, and brand are required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than 0.");
      return;
    }
    if (!imageFile) {
      setError("Please select a product image.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    if (catalog.some((product) => String(product.id).toUpperCase() === id)) {
      setError("A product with this ID already exists.");
      return;
    }

    setIsSaving(true);
    try {
      const created = await createCatalogProduct({
        id,
        category: form.category,
        name,
        brand,
        price,
        image: imageFile,
      });

      setCatalog((previous) => [
        created,
        ...previous.filter((product) => product.id !== created.id),
      ]);
      setShowForm(false);
      setForm(emptyForm);
      setImageFile(null);
      setImagePreview("");
      setQuery("");
      setCategoryFilter("ALL");
      notify("Product added to catalog successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const openPriceEditor = (product) => {
    setPriceProduct(product);
    setNewPrice(String(product.price ?? ""));
    setError("");
  };

  const savePrice = async (event) => {
    event.preventDefault();
    const price = Number(newPrice);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than 0.");
      return;
    }

    setIsUpdatingPrice(true);
    setError("");
    try {
      const updated = await updateCatalogProductPrice(priceProduct.id, price);
      setCatalog((previous) =>
        previous.map((product) =>
          product.id === priceProduct.id ? updated : product
        )
      );
      setPriceProduct(null);
      setNewPrice("");
      notify("Catalog price updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  if (isLoading) return <ProductManagementSkeleton />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
            Product Catalog
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Add products, upload images, view catalog items, and update prices.
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="neu-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Catalog
        </button>
      </div>

      {error && !showForm && !priceProduct && (
        <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => {
              setError("");
              loadCatalog();
            }}
          >
            Retry
          </button>
        </div>
      )}

      <section className="neu-raised overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-primary/10 p-4 sm:flex-row sm:p-6">
          <div className={`${inputBase} flex items-center px-4 md:max-w-sm md:flex-1`}>
            <span className="material-symbols-outlined mr-2 text-[20px] text-outline">
              search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by ID, name, brand..."
              className="w-full bg-transparent outline-none placeholder:text-outline"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className={`${inputBase} px-4`}
          >
            <option value="ALL">All categories</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadCatalog}
            className="neu-btn rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-outline">
              <tr>
                {["Image", "ID", "Name", "Category", "Brand", "Price", "Action"].map((heading) => (
                  <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {visibleProducts.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-primary/5">
                  <td className="px-5 py-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg border border-primary/10 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-xs text-outline">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-outline">{product.id}</td>
                  <td className="px-5 py-4 font-semibold text-primary">{product.name}</td>
                  <td className="px-5 py-4 text-on-surface-variant">{product.category}</td>
                  <td className="px-5 py-4 text-on-surface-variant">{product.brand}</td>
                  <td className="px-5 py-4 font-semibold text-primary">{money(Number(product.price))}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openPriceEditor(product)}
                      className="neu-btn rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                      Update price
                    </button>
                  </td>
                </tr>
              ))}
              {visibleProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-outline">
                    No products found in the catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-surface p-5 shadow-2xl sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-primary">Add catalog product</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Product details and image will be submitted together.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="neu-btn flex h-10 w-10 items-center justify-center rounded-xl"
                aria-label="Close form"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={saveProduct} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary">Product ID</label>
                  <input
                    required
                    value={form.id}
                    onChange={updateField("id")}
                    placeholder="PRODUCT01"
                    className={`${inputBase} w-full px-4`}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary">Category</label>
                  <select
                    value={form.category}
                    onChange={updateField("category")}
                    className={`${inputBase} w-full px-4`}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">Product name</label>
                <input
                  required
                  value={form.name}
                  onChange={updateField("name")}
                  placeholder="Tomato Seeds"
                  className={`${inputBase} w-full px-4`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary">Brand</label>
                  <input
                    required
                    value={form.brand}
                    onChange={updateField("brand")}
                    placeholder="AgroGrow"
                    className={`${inputBase} w-full px-4`}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-primary">Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={updateField("price")}
                    placeholder="450"
                    className={`${inputBase} w-full px-4`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">Product image</label>
                <input
                  required
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setImageFile(event.target.files?.[0] ?? null);
                    setError("");
                  }}
                  className={`${inputBase} w-full px-4`}
                />
                <p className="mt-1 text-xs text-on-surface-variant">
                  JPEG, PNG, or WebP; maximum 5 MB.
                </p>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="mt-3 h-28 w-28 rounded-xl border border-primary/10 object-cover"
                  />
                )}
              </div>

              {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Uploading..." : "Add to catalog"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={closeForm}
                  className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {priceProduct && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-2xl sm:p-7">
            <h2 className="text-xl font-extrabold text-primary">Update product price</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {priceProduct.name} ({priceProduct.id})
            </p>
            <form onSubmit={savePrice} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">New price (₹)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newPrice}
                  onChange={(event) => {
                    setNewPrice(event.target.value);
                    setError("");
                  }}
                  className={`${inputBase} w-full px-4`}
                />
              </div>
              {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isUpdatingPrice}
                  className="neu-btn-primary rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {isUpdatingPrice ? "Updating..." : "Save price"}
                </button>
                <button
                  type="button"
                  disabled={isUpdatingPrice}
                  onClick={() => {
                    setPriceProduct(null);
                    setError("");
                  }}
                  className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="neu-raised fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl px-5 py-3 text-sm font-semibold text-secondary"
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
