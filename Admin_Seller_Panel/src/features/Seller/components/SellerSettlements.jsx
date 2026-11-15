
import React, { useMemo, useState } from "react";
import useSellerSettlements from "../hooks/useSellerSettlements";

const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount ?? 0));

const getOrderId = (order) =>
    order?.orderId ?? order?.id ?? order?._id ?? "";

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
            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {status}
        </span>
    );
};

const SellerSettlements = () => {
    const {
        orders,
        isLoading,
        isRefreshing,
        error,
        loadSettlements,
    } = useSellerSettlements();

    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Search orders by order ID, farmer, product name, and payment details
    const visibleOrders = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) return orders;

        return orders.filter((order) =>
            [
                getOrderId(order),
                order.farmerId,
                order.productId,
                order.productName,
                order.paymentMode,
                order.paymentStatus,
                order.settlementStatus,
            ].some((item) =>
                String(item ?? "").toLowerCase().includes(value)
            )
        );
    }, [orders, search]);

    if (isLoading) {
        return (
            <div className="space-y-5">
                <div className="h-8 w-64 animate-pulse rounded-lg bg-primary/10" />
                <div className="h-32 animate-pulse rounded-2xl bg-primary/5" />
                <div className="h-64 animate-pulse rounded-2xl bg-primary/5" />
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 space-y-6">

            {/* Heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
                        Pending Settlements
                    </h1>

                    <p className="mt-1 text-sm text-on-surface-variant">
                        View your orders awaiting settlement.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadSettlements(false)}
                    disabled={isRefreshing}
                    className="neu-btn inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-lg">
                        refresh
                    </span>
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="neu-raised rounded-2xl p-5">
                    <p className="text-sm text-on-surface-variant">
                        Pending Settlement Orders
                    </p>

                    <p className="mt-3 text-2xl font-extrabold text-primary">
                        {orders.length}
                    </p>
                </div>

                <div className="neu-raised rounded-2xl p-5">
                    <p className="text-sm text-on-surface-variant">
                        Paid Orders Awaiting Settlement
                    </p>

                    <p className="mt-3 text-2xl font-extrabold text-primary">
                        {
                            orders.filter(
                                (order) =>
                                    String(order.paymentStatus ?? "").toUpperCase() === "PAID"
                            ).length
                        }
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => loadSettlements()}
                        className="font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            <section className="neu-raised w-full min-w-0 overflow-hidden rounded-2xl">

                <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <h2 className="font-bold text-primary">
                            Your Settlement Orders
                        </h2>

                        <p className="mt-1 text-xs text-on-surface-variant">
                            Orders assigned to your seller account.
                        </p>
                    </div>

                    <div className="flex w-full items-center rounded-xl border border-primary/10 bg-surface px-4 py-2 sm:w-72">
                        <span className="material-symbols-outlined mr-2 text-lg text-outline">
                            search
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search order, farmer or product..."
                            className="w-full min-w-0 bg-transparent text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
                        <colgroup>
                            <col className="w-[16%]" />
                            <col className="w-[17%]" />
                            <col className="w-[18%]" />
                            <col className="w-[14%]" />
                            <col className="w-[15%]" />
                            <col className="w-[10%]" />
                            <col className="w-[10%]" />
                        </colgroup>

                        <thead className="bg-primary/[0.035] text-xs uppercase tracking-wide text-outline">
                            <tr>
                                <th className="break-words px-4 py-4 font-semibold">
                                    Order ID
                                </th>

                                <th className="break-words px-4 py-4 font-semibold">
                                    Farmer
                                </th>

                                <th className="break-words px-4 py-4 font-semibold">
                                    Product Name
                                </th>

                                <th className="break-words px-4 py-4 font-semibold">
                                    Product Total
                                </th>

                                <th className="break-words px-4 py-4 font-semibold">
                                    Grand Total
                                </th>

                                <th className="break-words px-4 py-4 font-semibold">
                                    Payment
                                </th>

                                <th className="px-4 py-4 text-center font-semibold">
                                    Action
                                </th>
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
                                        <td className="break-all px-4 py-4 font-semibold text-primary">
                                            {orderId || "—"}
                                        </td>

                                        <td className="break-words px-4 py-4 text-on-surface-variant">
                                            {order.farmerId || "—"}
                                        </td>

                                        <td className="break-words px-4 py-4 font-semibold text-primary">
                                            {order.productName || "Product unavailable"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-primary">
                                            {money(order.productTotal)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 font-bold text-primary">
                                            {money(order.totalSumFee)}
                                        </td>

                                        <td className="px-4 py-4">
                                            <StatusBadge value={order.paymentStatus} />
                                        </td>

                                        {/* Improved View Button */}
                                        <td className="px-4 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="inline-flex min-w-[90px] items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2 text-xs font-bold text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white hover:shadow-md active:scale-95"
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        visibility
                                                    </span>
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {visibleOrders.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-16 text-center text-on-surface-variant"
                                    >
                                        <span className="material-symbols-outlined mb-2 block text-4xl text-outline">
                                            account_balance_wallet
                                        </span>

                                        <p className="font-semibold text-primary">
                                            {search
                                                ? "No matching orders found."
                                                : "No pending settlements found."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-primary/10 px-5 py-3 text-xs text-on-surface-variant">
                    Showing {visibleOrders.length} of {orders.length} orders
                </div>
            </section>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedOrder(null);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
                            <div>
                                <h2 className="font-bold text-primary">
                                    Settlement Details
                                </h2>

                                <p className="mt-1 break-all text-xs text-on-surface-variant">
                                    {getOrderId(selectedOrder)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="neu-btn flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-primary/10"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">

                            {/* Order Information */}
                            <section className="rounded-xl bg-primary/[0.035] p-4">
                                <h3 className="mb-4 font-bold text-primary">
                                    Order Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-outline">
                                            Farmer
                                        </p>
                                        <p className="mt-1 break-words text-sm font-semibold text-primary">
                                            {selectedOrder.farmerId || "Not available"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-outline">
                                            Product Name
                                        </p>
                                        <p className="mt-1 break-words text-sm font-semibold text-primary">
                                            {selectedOrder.productName || "Product unavailable"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-outline">
                                            Quantity
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-primary">
                                            {selectedOrder.quantity ?? "—"} (
                                            {selectedOrder.productQuantity ?? "—"})
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-outline">
                                            Payment Mode
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-primary">
                                            {selectedOrder.paymentMode || "Not available"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-outline">
                                            Delivery Partner
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-primary">
                                            {selectedOrder.deliveryBoyName || "Not assigned"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-outline">
                                            Delivery Phone
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-primary">
                                            {selectedOrder.deliveryBoyPhone || "Not available"}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Payment Breakdown */}
                            <section className="rounded-xl border border-primary/10 p-4">
                                <h3 className="mb-4 font-bold text-primary">
                                    Payment Breakdown
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-on-surface-variant">
                                            Product Total
                                        </span>

                                        <span className="font-semibold text-primary">
                                            {money(selectedOrder.productTotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span className="text-on-surface-variant">
                                            Platform Fee
                                        </span>

                                        <span className="font-semibold text-primary">
                                            {money(selectedOrder.platformFee)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span className="text-on-surface-variant">
                                            Delivery Fee
                                        </span>

                                        <span className="font-semibold text-primary">
                                            {money(selectedOrder.deliveryFee)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3 border-t border-primary/10 pt-3">
                                        <span className="font-bold text-primary">
                                            Grand Total
                                        </span>

                                        <span className="text-lg font-extrabold text-primary">
                                            {money(selectedOrder.totalSumFee)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Payment and Settlement Status */}
                            <section className="rounded-xl bg-primary/[0.035] p-4">
                                <h3 className="mb-3 font-bold text-primary">
                                    Payment & Settlement Status
                                </h3>

                                <div className="flex flex-wrap gap-4">
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
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end border-t border-primary/10 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="neu-btn rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerSettlements;
