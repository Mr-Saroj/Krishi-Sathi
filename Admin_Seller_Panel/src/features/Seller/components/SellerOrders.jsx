import React, { useMemo, useState } from "react";

import useSellerOrders from "../hooks/useSellerOrders";

import {
  formatPrice,
  formatDate,
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
} from "../utils/sellerOrderUtils";
import { sellerOrderService } from "../services/sellerOrderService";

const SellerOrders = () => {
  const {
    orders,
    loading,
    refreshing,
    error,
    fetchOrders,
  } = useSellerOrders();

  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filters = [
    { id: "ALL", name: "All Orders" },
    { id: "CONFIRMED", name: "Confirmed" },
    { id: "PENDING", name: "Delivery Pending" },
    { id: "ACCEPTED", name: "Delivery Accepted" },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(order.orderStatus || "").toUpperCase();
      const deliveryStatus = String(
        order.deliveryStatus || ""
      ).toUpperCase();

      let matchesFilter = true;

      if (selectedFilter === "CONFIRMED") {
        matchesFilter = status === "CONFIRMED";
      } else if (selectedFilter === "PENDING") {
        matchesFilter = deliveryStatus === "PENDING";
      } else if (selectedFilter === "ACCEPTED") {
        matchesFilter = deliveryStatus === "ACCEPTED";
      }

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        String(order.orderId || "").toLowerCase().includes(searchText) ||
        String(order.productName || "").toLowerCase().includes(searchText) ||
        String(order.productId || "").toLowerCase().includes(searchText) ||
        String(order.farmerId || "").toLowerCase().includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [orders, selectedFilter, search]);

  const totalOrderValue = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(order.totalSumFee || 0),
      0
    );
  }, [orders]);

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-on-surface-variant">
            View orders assigned to your shop and manage their delivery information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing || loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <span className="material-symbols-rounded text-lg">
            refresh
          </span>

          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="neu-raised rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl neu-inset">
              <span className="material-symbols-rounded text-2xl text-primary">
                shopping_bag
              </span>
            </div>

            <div>
              <p className="text-sm text-on-surface-variant">
                Total Assigned Orders
              </p>

              <h2 className="text-2xl font-extrabold text-primary">
                {orders.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="neu-raised rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl neu-inset">
              <span className="material-symbols-rounded text-2xl text-primary">
                payments
              </span>
            </div>

            <div>
              <p className="text-sm text-on-surface-variant">
                Total Order Value
              </p>

              <h2 className="text-2xl font-extrabold text-primary">
                {formatPrice(totalOrderValue)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => fetchOrders()}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* FILTERS AND SEARCH */}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-primary">
              Order Management
            </h2>

            <p className="mt-1 text-sm text-on-surface-variant">
              Orders assigned to your seller account.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
              search
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, product, farmer..."
              className="w-full rounded-xl neu-inset py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => {
            const active = selectedFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "neu-inset text-primary"
                    : "neu-raised text-on-surface-variant hover:-translate-y-0.5"
                }`}
              >
                {filter.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* ORDERS */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">
              Assigned Orders
            </h2>

            <p className="mt-1 text-sm text-on-surface-variant">
              {filteredOrders.length} orders found
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="rounded-xl neu-inset p-10 text-center">
            <span className="material-symbols-rounded animate-spin text-3xl text-primary">
              progress_activity
            </span>

            <p className="mt-3 text-sm text-on-surface-variant">
              Loading your orders...
            </p>
          </div>
        ) : !error && filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredOrders.map((order) => (
              <SellerOrderCard
                key={order.orderId}
                order={order}
              />
            ))}
          </div>
        ) : !error ? (
          <div className="rounded-xl neu-inset p-10 text-center">
            <span className="material-symbols-rounded text-5xl text-on-surface-variant">
              inventory_2
            </span>

            <p className="mt-3 font-semibold text-primary">
              No orders found
            </p>

            <p className="mt-1 text-sm text-on-surface-variant">
              {search
                ? "Try another search term."
                : "Confirmed orders assigned to your shop will appear here."}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
};

function SellerOrderCard({ order }) {
  const statusColor = getOrderStatusColor(order.orderStatus);
  const paymentColor = getPaymentStatusColor(order.paymentStatus);

  const [pickupOtp, setPickupOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState("");
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const deliveryStatus = String(order.deliveryStatus || "").toUpperCase();
  const orderStatus = String(order.orderStatus || "").toUpperCase();

  const canGenerateOtp =
    deliveryStatus === "ACCEPTED" &&
    orderStatus === "CONFIRMED";

  const handleGeneratePickupOtp = async () => {
    try {
      setGeneratingOtp(true);
      setOtpError("");
      setOtpSuccess("");

      const response = await sellerOrderService.generatePickupOtp(
        order.orderId
      );

      setPickupOtp(response.pickupOtp || "");
      setOtpExpiresAt(response.expiresAt || "");

      setOtpSuccess(
        response.message || "Pickup OTP generated successfully"
      );
    } catch (error) {
      console.error("Pickup OTP generation error:", error);

      setOtpError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to generate pickup OTP. Please try again."
      );
    } finally {
      setGeneratingOtp(false);
    }
  };

  return (
    <article className="neu-raised overflow-hidden rounded-2xl">

      {/* CARD HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[11px] text-on-surface-variant">
            Order ID
          </p>

          <h3 className="mt-1 break-all text-sm font-extrabold text-primary">
            #{order.orderId}
          </h3>
        </div>

        <span
          className="rounded-full px-3 py-2 text-xs font-bold"
          style={{
            color: statusColor,
            backgroundColor: `${statusColor}15`,
          }}
        >
          {getOrderStatusLabel(order.orderStatus)}
        </span>
      </div>

      <div className="border-t border-gray-200" />

      {/* PRODUCT */}
      <div className="flex items-center gap-4 p-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white neu-inset">
          {order.productImage ? (
            <img
              src={order.productImage}
              alt={order.productName || "Product"}
              loading="lazy"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="material-symbols-rounded text-3xl text-primary">
              inventory_2
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-primary">
            {order.productName || "Product details"}
          </h3>

          <p className="mt-1 break-all text-xs text-on-surface-variant">
            Product ID: {order.productId}
          </p>

          <p className="mt-2 text-sm font-semibold text-on-surface">
            Quantity: {order.quantity} × {order.productQuantity}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-on-surface-variant">
            Product Total
          </p>

          <p className="mt-1 font-extrabold text-primary">
            {formatPrice(order.productTotal)}
          </p>
        </div>
      </div>

      <div className="mx-4 border-t border-gray-200" />

      {/* FARMER AND DELIVERY DETAILS */}
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">

        <div className="rounded-xl neu-inset p-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-lg text-primary">
              person
            </span>

            <p className="text-xs font-bold text-primary">
              Farmer Details
            </p>
          </div>

          <p className="mt-2 break-all text-xs text-on-surface-variant">
            {order.farmerId || "Not available"}
          </p>
        </div>

        <div className="rounded-xl neu-inset p-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-lg text-primary">
              local_shipping
            </span>

            <p className="text-xs font-bold text-primary">
              Delivery Assignment
            </p>
          </div>

          <p className="mt-2 text-xs font-semibold text-on-surface">
            {deliveryStatus
              ? getOrderStatusLabel(deliveryStatus)
              : "Not assigned"}
          </p>

          {order.deliveryBoyName && (
            <p className="mt-1 text-xs text-on-surface-variant">
              {order.deliveryBoyName}
            </p>
          )}

          {order.deliveryBoyPhone && (
            <p className="mt-1 text-xs text-on-surface-variant">
              {order.deliveryBoyPhone}
            </p>
          )}
        </div>
      </div>

      {/* PICKUP OTP SECTION */}
      {canGenerateOtp && (
        <>
          <div className="mx-4 border-t border-gray-200" />

          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-xl text-primary">
                verified_user
              </span>

              <div>
                <h3 className="text-sm font-bold text-primary">
                  Product Pickup Verification
                </h3>

                <p className="text-xs text-on-surface-variant">
                  Generate an OTP and share it with the delivery boy.
                </p>
              </div>
            </div>

            {/* GENERATED OTP */}
            {pickupOtp && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-center text-xs font-semibold text-green-800">
                  Your Pickup OTP
                </p>

                <h2 className="mt-2 text-center text-3xl font-extrabold tracking-[0.35em] text-green-700">
                  {pickupOtp}
                </h2>

                <p className="mt-2 text-center text-xs text-green-800">
                  Share this OTP with your delivery boy.
                </p>

                {otpExpiresAt && (
                  <p className="mt-1 text-center text-[11px] text-green-700">
                    Expires at: {formatDate(otpExpiresAt)}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(pickupOtp);
                  }}
                  className="mx-auto mt-3 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                >
                  <span className="material-symbols-rounded text-sm">
                    content_copy
                  </span>
                  Copy OTP
                </button>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {otpSuccess && (
              <p className="text-xs font-semibold text-green-700">
                {otpSuccess}
              </p>
            )}

            {/* ERROR MESSAGE */}
            {otpError && (
              <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                {otpError}
              </p>
            )}

            {/* GENERATE BUTTON */}
            <button
              type="button"
              onClick={handleGeneratePickupOtp}
              disabled={generatingOtp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-rounded text-lg">
                {generatingOtp ? "progress_activity" : "key"}
              </span>

              {generatingOtp
                ? "Generating OTP..."
                : pickupOtp
                  ? "Generate New OTP"
                  : "Generate Pickup OTP"}
            </button>

            <p className="text-center text-[11px] text-on-surface-variant">
              A new OTP invalidates the previously generated OTP.
            </p>
          </div>
        </>
      )}

      {/* NOT READY FOR PICKUP */}
      {orderStatus === "CONFIRMED" &&
        deliveryStatus !== "ACCEPTED" && (
          <div className="mx-4 mb-4 rounded-xl neu-inset p-3">
            <p className="text-xs text-on-surface-variant">
              <span className="material-symbols-rounded mr-1 inline-block align-middle text-base">
                info
              </span>
              Pickup OTP will be available after a delivery boy accepts this order.
            </p>
          </div>
        )}

      <div className="mx-4 border-t border-gray-200" />

      {/* PAYMENT SUMMARY */}
      <div className="space-y-2 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">
            Product Amount
          </span>

          <span className="font-semibold text-on-surface">
            {formatPrice(order.productTotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">
            Platform Fee
          </span>

          <span className="font-semibold text-on-surface">
            {formatPrice(order.platformFee)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">
            Delivery Fee
          </span>

          <span className="font-semibold text-on-surface">
            {formatPrice(order.deliveryFee)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="font-bold text-primary">
            Total Amount
          </span>

          <span className="text-lg font-extrabold text-primary">
            {formatPrice(order.totalSumFee)}
          </span>
        </div>
      </div>

      {/* PAYMENT FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/60 px-4 py-3">
        <div>
          <p className="text-[10px] text-on-surface-variant">
            Payment Method
          </p>

          <p className="mt-1 text-xs font-bold text-primary">
            {order.paymentMode || "Not available"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-on-surface-variant">
            Payment Status
          </p>

          <p
            className="mt-1 text-xs font-bold"
            style={{ color: paymentColor }}
          >
            {getOrderStatusLabel(order.paymentStatus)}
          </p>
        </div>
      </div>

      {/* ASSIGNMENT DATE */}
      {order.assignedAt && (
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-[11px] text-on-surface-variant">
            Assigned: {formatDate(order.assignedAt)}
          </p>
        </div>
      )}
    </article>
  );
}

export default SellerOrders;