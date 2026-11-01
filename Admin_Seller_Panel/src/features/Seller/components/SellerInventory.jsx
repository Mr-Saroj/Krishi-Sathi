import React, { useEffect, useState } from "react";
import useInventory, { categories } from "../hooks/useInventory";

const Inventory = () => {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockInputs, setStockInputs] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const {
    products,
    totalElements,
    totalPages,
    loading,
    updating,
    error,
    editStock,
  } = useInventory(selectedCategory);

  // Initialize stock inputs from API data.
  // Preserve manually entered values when products refresh.
  useEffect(() => {
    setStockInputs((previous) => {
      const updated = { ...previous };

      products.forEach((product) => {
        const productId = product.catalogProductId;

        if (!(productId in updated)) {
          updated[productId] = String(
            product.stockQuantity ?? 0
          );
        }
      });

      return updated;
    });
  }, [products]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSuccessMessage("");
    setLocalError("");
  };

  // Seller can change stock quantity whenever needed.
  const handleStockInput = (productId, value) => {
    setStockInputs((previous) => ({
      ...previous,
      [productId]: value,
    }));
  };

  // Update stock in backend.
  const handleStockUpdate = async (product) => {
    const productId = product.catalogProductId;
    const inputValue = stockInputs[productId];

    setLocalError("");
    setSuccessMessage("");

    // Validate stock quantity.
    if (
      inputValue === "" ||
      !/^\d+$/.test(String(inputValue))
    ) {
      setLocalError(
        "Please enter a valid whole number (0 or more)."
      );
      return;
    }

    const quantity = Number(inputValue);

    if (!Number.isSafeInteger(quantity)) {
      setLocalError("Please enter a valid stock quantity.");
      return;
    }

    try {
      await editStock(productId, quantity);

      setSuccessMessage(
        `${product.name} stock updated successfully.`
      );

      // Update the saved stock displayed on the card.
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setLocalError(
        err.response?.data?.message ||
          "Unable to update stock. Please try again."
      );
    }
  };

  const formatPrice = (price) => {
    if (price == null) return "₹0.00";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);
  };

  const currentCategory =
    categories.find(
      (category) => category.id === selectedCategory
    )?.name || "All Products";

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary">
          My Inventory
        </h1>

        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your products and update available stock.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Total Products */}
        <div className="neu-raised rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl neu-inset">
              <span className="material-symbols-rounded text-2xl text-primary">
                inventory_2
              </span>
            </div>

            <div>
              <p className="text-sm text-on-surface-variant">
                Total Products
              </p>

              <h2 className="text-2xl font-extrabold text-primary">
                {totalElements}
              </h2>
            </div>
          </div>
        </div>

        {/* Selected Category */}
        <div className="neu-raised rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl neu-inset">
              <span className="material-symbols-rounded text-2xl text-primary">
                category
              </span>
            </div>

            <div>
              <p className="text-sm text-on-surface-variant">
                Selected Category
              </p>

              <h2 className="text-lg font-extrabold text-primary">
                {currentCategory}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
        >
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {(localError || error) && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {localError || error}
        </div>
      )}

      {/* Category Filters */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-primary">
            Product Categories
          </h2>

          <span className="text-xs text-on-surface-variant">
            {totalElements} products
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const active =
              selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  handleCategorySelect(category.id)
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "neu-inset text-primary"
                    : "neu-raised text-on-surface-variant hover:-translate-y-0.5"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Inventory Products */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-primary">
            Inventory Products
          </h2>

          <p className="mt-1 text-sm text-on-surface-variant">
            View your products and manage their stock quantity.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl neu-inset p-8 text-center">
            <span className="material-symbols-rounded animate-spin text-3xl text-primary">
              progress_activity
            </span>

            <p className="mt-3 text-sm text-on-surface-variant">
              Loading inventory...
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

              {products.map((product) => {
                const productId = product.catalogProductId;
                const isUpdating = updating === productId;

                return (
                  <div
                    key={productId}
                    className="neu-raised flex flex-col overflow-hidden rounded-xl"
                  >
                    {/* Product Image */}
                    <div className="flex h-32 w-full items-center justify-center bg-white p-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name || "Product"}
                          loading="lazy"
                          className="h-full w-full object-contain object-center"
                        />
                      ) : (
                        <span className="material-symbols-rounded text-4xl text-on-surface-variant">
                          inventory_2
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col gap-1.5 p-3">

                      {/* Category */}
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary">
                        {product.category}
                      </span>

                      {/* Name */}
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-primary">
                        {product.name}
                      </h3>

                      {/* Brand */}
                      {product.brand && (
                        <p className="truncate text-xs text-on-surface-variant">
                          Brand: {product.brand}
                        </p>
                      )}

                      {/* Package Quantity */}
                      {product.quantity != null &&
                        product.quantityUnit && (
                          <p className="text-xs font-semibold text-primary">
                            Package: {product.quantity}{" "}
                            {product.quantityUnit}
                          </p>
                        )}

                      {/* Description */}
                      {product.description && (
                        <p className="line-clamp-2 text-xs text-on-surface-variant">
                          {product.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-auto border-t border-gray-200 pt-2">
                        <p className="text-base font-extrabold text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {/* Available Stock */}
                      <div className="mt-2 rounded-lg neu-inset p-2.5">

                        <div className="mb-2 flex items-center justify-between gap-1">
                          <label
                            htmlFor={`stock-${productId}`}
                            className="text-xs font-semibold text-primary"
                          >
                            Available Stock
                          </label>

                          <span className="text-[10px] text-on-surface-variant">
                            Units
                          </span>
                        </div>

                        {/* Always Editable Stock Input */}
                        <input
                          id={`stock-${productId}`}
                          type="number"
                          min="0"
                          step="1"
                          value={stockInputs[productId] ?? ""}
                          onChange={(e) =>
                            handleStockInput(
                              productId,
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border-0 bg-transparent px-2 py-1.5 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/30"
                        />

                        <p className="mt-1 text-[10px] text-on-surface-variant">
                          Saved stock: {product.stockQuantity ?? 0}
                        </p>
                      </div>

                      {/* Update Stock Button */}
                      <button
                        type="button"
                        onClick={() =>
                          handleStockUpdate(product)
                        }
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                      >
                        <span className="material-symbols-rounded text-base">
                          {isUpdating
                            ? "progress_activity"
                            : "save"}
                        </span>

                        {isUpdating
                          ? "Updating..."
                          : "Update Stock"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Information */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="rounded-xl neu-inset px-5 py-3 text-sm font-semibold text-on-surface-variant">
                  Page 1 of {totalPages}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-xl neu-inset p-8 text-center">
            <span className="material-symbols-rounded text-4xl text-on-surface-variant">
              inventory_2
            </span>

            <p className="mt-3 font-semibold text-primary">
              No products in your inventory
            </p>

            <p className="mt-1 text-sm text-on-surface-variant">
              You have not added any products in this category yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Inventory;
