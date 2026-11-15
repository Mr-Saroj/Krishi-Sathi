
import React, { useEffect, useMemo, useState } from "react";
import useFinanceSettlement from "../hooks/useFinanceSettlement";

/* -------------------------------------------------- */
/* Utility functions                                  */
/* -------------------------------------------------- */

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));

const getOrderId = (order) =>
  order?.orderId ?? order?.id ?? order?._id ?? "";

const isPaid = (order) =>
  String(order?.paymentStatus ?? "").toUpperCase() === "PAID";

const isSettlementPending = (order) =>
  String(order?.settlementStatus ?? "").toUpperCase() === "PENDING";

const StatusBadge = ({ value }) => {
  const status = String(value ?? "UNKNOWN").toUpperCase();

  const styles = {
    PAID: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-rose-100 text-rose-700",
    CANCELLED: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

/* -------------------------------------------------- */
/* Reusable detail item                               */
/* -------------------------------------------------- */

const DetailItem = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium text-outline">{label}</p>
    <p className="mt-1 break-words text-sm font-semibold text-primary">
      {value !== null && value !== undefined && value !== ""
        ? value
        : "Not available"}
    </p>
  </div>
);

/* -------------------------------------------------- */
/* Reusable section card                              */
/* -------------------------------------------------- */

const DetailSection = ({ title, icon, children }) => (
  <section className="min-w-0 rounded-xl bg-primary/[0.035] p-4">
    <div className="mb-4 flex items-center gap-2">
      <span className="material-symbols-outlined text-xl text-primary">
        {icon}
      </span>
      <h3 className="text-sm font-bold text-primary">{title}</h3>
    </div>

    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
      {children}
    </div>
  </section>
);

/* -------------------------------------------------- */
/* Finance Settlement Page                            */
/* -------------------------------------------------- */

const FinanceSettlement = () => {
  const {
    orders,
    isLoading,
    isRefreshing,
    processingOrderId,
    error,
    toast,
    loadOrders,
    completeSettlement,
  } = useFinanceSettlement();

  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* -------------------------------------------------- */
  /* Search                                             */
  /* -------------------------------------------------- */

  const visibleOrders = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return orders;

    return orders.filter((order) => {
      const values = [
        getOrderId(order),
        order.farmerId,
        order.productId,
        order.sellerName,
        order.sellerId,
        order.sellerPhone,
        order.deliveryBoyName,
        order.deliveryBoyId,
        order.deliveryBoyPhone,
        order.paymentMode,
        order.paymentStatus,
        order.settlementStatus,
      ];

      return values.some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      );
    });
  }, [orders, query]);

  /* -------------------------------------------------- */
  /* Close modal on Escape and prevent background scroll */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!selectedOrder) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOrder]);

  /* -------------------------------------------------- */
  /* Complete settlement                                */
  /* -------------------------------------------------- */

  const handleComplete = async () => {
    if (!selectedOrder) return;

    const orderId = getOrderId(selectedOrder);

    if (!orderId) {
      window.alert("Order ID is missing.");
      return;
    }

    if (!isPaid(selectedOrder)) {
      window.alert("Payment must be PAID before settlement.");
      return;
    }

    if (!isSettlementPending(selectedOrder)) {
      window.alert("This settlement is not pending.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to complete settlement for order ${orderId}?`
    );

    if (!confirmed) return;

    const success = await completeSettlement(orderId);

    if (success) {
      setSelectedOrder(null);
    }
  };

  /* -------------------------------------------------- */
  /* Loading                                            */
  /* -------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-primary/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-primary/5" />
          <div className="h-28 animate-pulse rounded-2xl bg-primary/5" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-primary/5" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">

      {/* ============================================== */}
      {/* PAGE HEADING                                   */}
      {/* ============================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
            Finance & COD Settlement
          </h1>

          <p className="mt-1 text-sm text-on-surface-variant">
            Review order payments and manage pending settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOrders(false)}
          disabled={isRefreshing}
          className="neu-btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-lg">
            refresh
          </span>

          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ============================================== */}
      {/* SUMMARY CARDS                                  */}
      {/* ============================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="neu-raised rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-on-surface-variant">
              Pending Settlements
            </p>

            <span className="material-symbols-outlined text-2xl text-amber-600">
              pending_actions
            </span>
          </div>

          <p className="mt-3 text-2xl font-extrabold text-primary">
            {orders.length}
          </p>
        </div>

        <div className="neu-raised rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-on-surface-variant">
              Paid Orders Awaiting Settlement
            </p>

            <span className="material-symbols-outlined text-2xl text-green-700">
              account_balance_wallet
            </span>
          </div>

          <p className="mt-3 text-2xl font-extrabold text-primary">
            {orders.filter(isPaid).filter(isSettlementPending).length}
          </p>
        </div>

      </div>

      {/* ============================================== */}
      {/* ERROR MESSAGE                                  */}
      {/* ============================================== */}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadOrders(false)}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================== */}
      {/* SETTLEMENT TABLE                               */}
      {/* ============================================== */}

      <section className="neu-raised w-full min-w-0 overflow-hidden rounded-2xl">

        {/* Table heading */}

        <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div>
            <h2 className="font-bold text-primary">
              Pending Settlement Orders
            </h2>

            <p className="mt-1 text-xs text-on-surface-variant">
              View order details before confirming settlement.
            </p>
          </div>

          <div className="flex w-full items-center rounded-xl border border-primary/10 bg-surface px-4 py-2 sm:w-72">
            <span className="material-symbols-outlined mr-2 text-lg text-outline">
              search
            </span>

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order, farmer, seller..."
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-outline"
            />
          </div>

        </div>

        {/* Table content */}

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[1050px] table-auto text-left text-sm">

            <thead className="bg-primary/[0.035] text-xs uppercase tracking-wide text-outline">
              <tr>
                <th className="w-44 px-5 py-4 font-semibold">Order ID</th>
                <th className="min-w-48 px-5 py-4 font-semibold">Farmer</th>
                <th className="px-5 py-4 font-semibold">Product Total</th>
                <th className="px-5 py-4 font-semibold">Platform Fee</th>
                <th className="px-5 py-4 font-semibold">Delivery Fee</th>
                <th className="px-5 py-4 font-semibold">Grand Total</th>
                <th className="px-5 py-4 font-semibold">Payment Mode</th>
                <th className="px-5 py-4 font-semibold">Payment Status</th>
                <th className="px-5 py-4 font-semibold">Settlement Status</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/10">

              {visibleOrders.map((order) => {
                const orderId = getOrderId(order);

                return (
                  <tr
                    key={orderId}
                    className="transition-colors hover:bg-primary/[0.025]"
                  >
                    <td className="max-w-44 break-all px-5 py-4 font-semibold text-primary">
                      {orderId || "—"}
                    </td>

                    <td className="px-5 py-4 text-on-surface-variant">
                      {order.farmerId || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-primary">
                      {money(order.productTotal)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-on-surface-variant">
                      {money(order.platformFee)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-on-surface-variant">
                      {money(order.deliveryFee)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-bold text-primary">
                      {money(order.totalSumFee)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                        {order.paymentMode || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={order.paymentStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={order.settlementStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="neu-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-base">
                          visibility
                        </span>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Empty state */}

              {visibleOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined mb-2 block text-4xl text-outline">
                      account_balance_wallet
                    </span>

                    <p className="font-semibold text-primary">
                      {query
                        ? "No matching orders found."
                        : "No pending settlements."}
                    </p>

                    <p className="mt-1 text-xs">
                      Pending settlement orders will appear here.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>

        {/* Footer */}

        <div className="border-t border-primary/10 px-5 py-3 text-xs text-on-surface-variant">
          Showing {visibleOrders.length} of {orders.length} pending orders
        </div>

      </section>

      {/* ============================================== */}
      {/* ORDER DETAILS MODAL                            */}
      {/* ============================================== */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settlement-modal-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >

            {/* Modal header - fixed */}

            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-primary/10 px-5 py-4 sm:px-7">

              <div className="min-w-0">
                <h2
                  id="settlement-modal-title"
                  className="text-lg font-extrabold text-primary sm:text-xl"
                >
                  Settlement Details
                </h2>

                <p className="mt-1 break-all text-xs text-on-surface-variant sm:text-sm">
                  Order ID: {getOrderId(selectedOrder)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
                className="neu-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>

            </div>

            {/* Modal body - independently scrollable */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">

              {/* Order information */}

              <DetailSection title="Order Information" icon="receipt_long">

                <DetailItem
                  label="Farmer"
                  value={selectedOrder.farmerId}
                />

                <DetailItem
                  label="Product ID"
                  value={selectedOrder.productId}
                />

                <DetailItem
                  label="Quantity"
                  value={`${selectedOrder.quantity ?? "—"} (${selectedOrder.productQuantity ?? "—"})`}
                />

                <DetailItem
                  label="Payment Mode"
                  value={selectedOrder.paymentMode}
                />

                <DetailItem
                  label="Delivery Address ID"
                  value={selectedOrder.farmerDeliveryAddressId}
                />

                <DetailItem
                  label="Order ID"
                  value={getOrderId(selectedOrder)}
                />

              </DetailSection>

              {/* Seller and delivery information */}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                <DetailSection title="Seller Information" icon="store">
                  <DetailItem
                    label="Seller Name"
                    value={selectedOrder.sellerName}
                  />

                  <DetailItem
                    label="Seller ID"
                    value={selectedOrder.sellerId}
                  />

                  <DetailItem
                    label="Seller Phone"
                    value={selectedOrder.sellerPhone}
                  />
                </DetailSection>

                <DetailSection
                  title="Delivery Partner Information"
                  icon="delivery_dining"
                >
                  <DetailItem
                    label="Delivery Boy Name"
                    value={selectedOrder.deliveryBoyName}
                  />

                  <DetailItem
                    label="Delivery Boy ID"
                    value={selectedOrder.deliveryBoyId}
                  />

                  <DetailItem
                    label="Delivery Boy Phone"
                    value={selectedOrder.deliveryBoyPhone}
                  />
                </DetailSection>

              </div>

              {/* Payment breakdown */}

              <section className="rounded-xl border border-primary/10 p-4 sm:p-5">

                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-primary">
                    account_balance_wallet
                  </span>

                  <h3 className="text-sm font-bold text-primary">
                    Payment Breakdown
                  </h3>
                </div>

                <div className="space-y-3">

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-on-surface-variant">
                      Product Total
                    </span>

                    <span className="font-semibold text-primary">
                      {money(selectedOrder.productTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-on-surface-variant">
                      Platform Fee
                    </span>

                    <span className="font-semibold text-primary">
                      {money(selectedOrder.platformFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-on-surface-variant">
                      Delivery Fee
                    </span>

                    <span className="font-semibold text-primary">
                      {money(selectedOrder.deliveryFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-primary/10 pt-3">
                    <span className="font-bold text-primary">
                      Grand Total
                    </span>

                    <span className="text-lg font-extrabold text-primary">
                      {money(selectedOrder.totalSumFee)}
                    </span>
                  </div>

                </div>

              </section>

              {/* Status information */}

              <section className="rounded-xl bg-primary/[0.035] p-4">

                <h3 className="mb-3 text-sm font-bold text-primary">
                  Payment & Settlement Status
                </h3>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">
                      Payment:
                    </span>
                    <StatusBadge value={selectedOrder.paymentStatus} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">
                      Settlement:
                    </span>
                    <StatusBadge value={selectedOrder.settlementStatus} />
                  </div>
                </div>

              </section>

              {/* Payment warning */}

              {!isPaid(selectedOrder) && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800">
                  <span className="material-symbols-outlined text-lg">
                    info
                  </span>

                  <p>
                    Payment must be PAID before settlement can be completed.
                    This order cannot be settled yet.
                  </p>
                </div>
              )}

            </div>

            {/* Modal footer - fixed */}

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-primary/10 bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleComplete}
                disabled={
                  !isPaid(selectedOrder) ||
                  !isSettlementPending(selectedOrder) ||
                  Boolean(processingOrderId)
                }
                title={
                  !isPaid(selectedOrder)
                    ? "Payment must be PAID first"
                    : !isSettlementPending(selectedOrder)
                      ? "Settlement is not pending"
                      : "Confirm settlement"
                }
                className="neu-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-lg">
                  {processingOrderId === getOrderId(selectedOrder)
                    ? "hourglass_top"
                    : "check_circle"}
                </span>

                {processingOrderId === getOrderId(selectedOrder)
                  ? "Processing..."
                  : "Confirm Settlement"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ============================================== */}
      {/* SUCCESS TOAST                                  */}
      {/* ============================================== */}

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

export default FinanceSettlement;
