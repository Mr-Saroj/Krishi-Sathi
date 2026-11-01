import React, { useState } from "react";

import useSellerCatalog from "../hooks/useSellerCatalog";
import { addInventory } from "../services/sellerCatalogService";
import { categories, formatPrice } from "../utils/sellerCatalogUtils";

const PAGE_SIZE = 20;

const AddProductCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(0);

  // Add-stock form (modal) state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { products, totalElements, totalPages, loading, error, refetch } =
    useSellerCatalog(selectedCategory, page, PAGE_SIZE);

  const currentCategory = categories.find(
    (category) => category.id === selectedCategory
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id);
    setPage(0);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setPage(0);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open the form for the clicked product
  const handleAddProduct = (product) => {
    setSelectedProduct(product);
    setStockQuantity("");
    setFormError("");
  };

  const handleCloseForm = () => {
    if (submitting) return;
    setSelectedProduct(null);
    setStockQuantity("");
    setFormError("");
  };

  // Submit: POST /api/seller/inventory { productId, stockQuantity }
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const quantity = Number(stockQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setFormError("Enter a whole number of 1 or more.");
      return;
    }

    setSubmitting(true);

    try {
      await addInventory({
        productId: selectedProduct.id,
        stockQuantity: quantity,
      });

      const addedName = selectedProduct.name;

      setSelectedProduct(null);
      setStockQuantity("");
      setSuccessMessage(`${addedName} was added to your inventory.`);
      setTimeout(() => setSuccessMessage(""), 4000);

      // The added product no longer belongs in the catalog list.
      // If it was the only item on this page, step back one page (this refetches);
      // otherwise refetch the current page.
      if (products.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        refetch();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setFormError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setFormError("You do not have permission to add inventory.");
      } else if (err.response?.status === 409) {
        setFormError(
          err.response?.data?.message ||
          "This product is already in your inventory."
        );
      } else {
        setFormError(
          err.response?.data?.message ||
          "Unable to add the product. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Add New Product</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Select a category and choose products to add to your inventory.
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
        >
          {successMessage}
        </div>
      )}

      {/* Categories */}
      {!selectedCategory && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-primary">
            Select Product Category
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className="neu-raised rounded-2xl p-6 text-left transition-all hover:-translate-y-1"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl neu-inset">
                  <span className="material-symbols-rounded text-3xl text-primary">
                    {category.icon}
                  </span>
                </div>

                <h3 className="font-bold text-primary">{category.name}</h3>

                <p className="mt-1 text-sm text-on-surface-variant">
                  {category.description}
                </p>

                <div className="mt-5 flex items-center justify-between text-sm font-semibold text-secondary">
                  Explore Products
                  <span className="material-symbols-rounded">arrow_forward</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Selected Category Catalog */}
      {selectedCategory && (
        <section>
          <button
            type="button"
            onClick={handleBackToCategories}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-secondary"
          >
            <span className="material-symbols-rounded">arrow_back</span>
            Back to Categories
          </button>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-primary">
                {currentCategory?.name} Catalog
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Select an available catalog product.
              </p>
            </div>

            {!loading && !error && products.length > 0 && (
              <span className="text-sm text-on-surface-variant">
                {totalElements} available{" "}
                {totalElements === 1 ? "product" : "products"}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl neu-inset p-8 text-center">
              <span className="material-symbols-rounded animate-spin text-3xl text-primary">
                progress_activity
              </span>
              <p className="mt-3 text-sm text-on-surface-variant">
                Loading products...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
            >
              <p className="font-semibold text-red-700">{error}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="neu-raised flex flex-col overflow-hidden rounded-xl"
                  >
                    {/* Image frame: full image visible, centered */}
                    <div className="flex h-36 w-full items-center justify-center bg-white p-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name || "Catalog product"}
                          loading="lazy"
                          className="h-full w-full object-contain object-center"
                        />
                      ) : (
                        <span className="material-symbols-rounded text-4xl text-on-surface-variant">
                          inventory_2
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col gap-1.5 p-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary">
                        {product.category}
                      </span>

                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-primary">
                        {product.name}
                      </h3>

                      {product.brand && (
                        <p className="truncate text-xs text-on-surface-variant">
                          Brand: {product.brand}
                        </p>
                      )}
                      {/* Package quantity */}
                      {product.quantity != null && product.quantityUnit && (
                        <p className="text-xs font-semibold text-primary">
                          Package: {product.quantity} {product.quantityUnit}
                        </p>
                      )}

                      {/* Product description */}
                      {product.description && (
                        <p className="line-clamp-2 text-xs text-on-surface-variant">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-base font-extrabold text-primary">
                          {formatPrice(product.price)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Add In Inventory
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-on-surface-variant">
                    Page {page + 1} of {totalPages}
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0 || loading}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1 || loading}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty */}
          {!loading && !error && products.length === 0 && (
            <div className="rounded-xl neu-inset p-8 text-center">
              <span className="material-symbols-rounded text-4xl text-on-surface-variant">
                inventory_2
              </span>
              <p className="mt-3 font-semibold text-primary">
                No products available
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                No available products were found in this category.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Add Stock Form (modal) */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCloseForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-stock-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <h2
                id="add-stock-title"
                className="text-lg font-extrabold text-primary"
              >
                Add to inventory
              </h2>

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={submitting}
                aria-label="Close"
                className="text-on-surface-variant disabled:opacity-40"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Selected product summary */}
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-white p-1.5">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name || "Catalog product"}
                    className="h-full w-full object-contain object-center"
                  />
                ) : (
                  <span className="material-symbols-rounded text-2xl text-on-surface-variant">
                    inventory_2
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-bold text-primary">
                  {selectedProduct.name}
                </h3>

                {selectedProduct.brand && (
                  <p className="text-sm text-on-surface-variant">
                    Brand: {selectedProduct.brand}
                  </p>
                )}

                <p className="text-sm font-semibold text-primary">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="stockQuantity"
                  className="mb-1 block text-sm font-semibold text-primary"
                >
                  Stock quantity
                </label>

                <input
                  id="stockQuantity"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="e.g. 100"
                  disabled={submitting}
                  autoFocus
                  className="w-full rounded-lg border px-4 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm font-semibold text-red-700">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={submitting}
                  className="rounded-lg border px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductCatalog;