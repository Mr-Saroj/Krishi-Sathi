import React from 'react';

import {
  money,
  inputBase,
  btn,
  btnPrimary,
} from '../utils/componentsUtils';

import {
  StatusBadge,
  PageHeader,
  Drawer,
  InfoTile,
  EmptyRow,
  Toast,
} from './components';

import OrderManagementSkeleton from '../Skeliton/OrderManagementSkeleton';
import { useOrderManagement } from '../hooks/orderManagementHooks';

const formatDate = (value) => {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderManagement = () => {
  const {
    isLoading,
    error,
    toast,
    orders,
    visibleOrders,
    query,
    setQuery,
    selected,
    setSelectedId,
    refreshOrders,
  } = useOrderManagement();

  if (isLoading) {
    return <OrderManagementSkeleton />;
  }

  const getQuantity = (order) =>
    Number(order.quantity ?? 0);

  const getProductQuantity = (order) =>
    order.productQuantity || "N/A";

  const getProductTotal = (order) =>
    Number(order.productTotal ?? 0);

  const getPlatformFee = (order) =>
    Number(order.platformFee ?? 0);

  const getDeliveryFee = (order) =>
    Number(order.deliveryFee ?? 0);

  const getGrandTotal = (order) =>
    Number(order.totalSumFee ?? 0);

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Page heading */}
      <PageHeader
        title="Placed Orders"
        description="View newly placed farmer orders, product quantities and payment details."
      />

      {/* Summary card */}
      <div className="neu-raised w-full rounded-2xl p-5 sm:max-w-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-on-surface-variant">
              Total Placed Orders
            </p>

            <p className="mt-2 text-3xl font-extrabold text-primary">
              {orders.length}
            </p>

            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-outline">
              Orders received
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <span className="material-symbols-outlined text-2xl text-emerald-600">
              shopping_cart
            </span>
          </div>
        </div>
      </div>

      {/* Orders section */}
      <section className="neu-raised overflow-hidden rounded-2xl">

        {/* Search and refresh */}
        <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div>
            <h2 className="text-lg font-bold text-primary">
              Order List
            </h2>

            <p className="mt-1 text-sm text-on-surface-variant">
              {visibleOrders.length} placed orders found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className={`${inputBase} flex items-center px-4 sm:w-80`}>
              <span className="material-symbols-outlined mr-2 text-[20px] text-outline">
                search
              </span>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order, farmer, product..."
                className="w-full bg-transparent py-3 outline-none placeholder:text-outline"
              />
            </div>

            <button
              type="button"
              onClick={refreshOrders}
              className={btn}
            >
              <span className="material-symbols-outlined mr-1 align-middle text-base">
                refresh
              </span>
              Refresh
            </button>

          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="m-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* Orders table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">

            <thead className="bg-primary/5 text-xs uppercase tracking-wide text-outline">
              <tr>
                {[
                  'Order ID',
                  'Farmer ID',
                  'Product ID',
                  'Quantity',
                  'Total Amount',
                  'Payment',
                  'Status',
                  'Action',
                ].map((heading) => (
                  <th key={heading} className="px-5 py-4 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/10">

              {visibleOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-primary/5"
                >

                  <td className="px-5 py-4">
                    <p className="font-bold text-primary">
                      #{order.id}
                    </p>

                    <p className="mt-1 text-xs text-outline">
                      {formatDate(order.createdAt)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-primary">
                      {order.farmerId || 'N/A'}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-primary">
                      {order.productId || 'N/A'}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-semibold text-primary">
                    {getQuantity(order)}
                  </td>

                  <td className="px-5 py-4 font-bold text-primary">
                    {money(getGrandTotal(order))}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={order.paymentMode || 'N/A'}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status="PLACED" />
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedId(order.id)}
                      className={btnPrimary}
                    >
                      <span className="material-symbols-outlined mr-1 align-middle text-base">
                        visibility
                      </span>
                      View
                    </button>
                  </td>

                </tr>
              ))}

              {visibleOrders.length === 0 && (
                <EmptyRow colSpan={8}>
                  {query
                    ? 'No matching placed orders found.'
                    : 'No placed orders available.'}
                </EmptyRow>
              )}

            </tbody>
          </table>
        </div>
      </section>

      {/* Order details drawer */}
      {selected && (
        <Drawer
          title={`Order #${selected.id}`}
          subtitle="Placed order and product details"
          onClose={() => setSelectedId(null)}
        >

          {/* Order status */}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-emerald-500/5 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">
                Order Status
              </p>

              <p className="mt-1 text-xs text-on-surface-variant">
                This order has been successfully placed.
              </p>
            </div>

            <StatusBadge status="PLACED" />
          </div>

          {/* Product information */}
          <div className="mt-6">
            <h3 className="font-bold text-primary">
              Product Details
            </h3>

            <div className="neu-inset mt-3 space-y-4 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <span className="material-symbols-outlined text-2xl text-emerald-600">
                    inventory_2
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-primary">
                    Product ID: {selected.productId || "N/A"}
                  </p>

                  <p className="mt-1 text-xs text-on-surface-variant">
                    Package quantity: {getProductQuantity(selected)}
                  </p>
                </div>
              </div>

              <div className="border-t border-primary/10 pt-3 space-y-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-on-surface-variant">
                    Number of packages
                  </span>
                  <span className="font-semibold text-primary">
                    {getQuantity(selected)}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-on-surface-variant">
                    Product quantity per package
                  </span>
                  <span className="font-semibold text-primary">
                    {getProductQuantity(selected)}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-on-surface-variant">
                    Product total
                  </span>
                  <span className="font-semibold text-primary">
                    {money(getProductTotal(selected))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer information */}
          <div className="mt-6">
            <h3 className="font-bold text-primary">
              Farmer Information
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoTile
                label="Farmer ID"
                value={selected.farmerId || 'N/A'}
              />

              <InfoTile
                label="Delivery Address ID"
                value={selected.farmerDeliveryAddressId || 'N/A'}
              />
            </div>
          </div>

          {/* Payment details */}
          <div className="mt-6">
            <h3 className="font-bold text-primary">
              Payment Details
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <InfoTile
                label="Payment Mode"
                value={selected.paymentMode || 'N/A'}
              />

              <InfoTile
                label="Payment Status"
                value={selected.paymentStatus || 'N/A'}
              />
            </div>
          </div>

          {/* Price breakdown */}
          <div className="neu-inset mt-6 rounded-xl p-4">
            <h3 className="font-bold text-primary">
              Price Breakdown
            </h3>

            <div className="mt-4 space-y-3 text-sm">

              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">
                  Product total
                </span>

                <span className="font-medium text-primary">
                  {money(getProductTotal(selected))}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">
                  Platform fee
                </span>

                <span className="font-medium text-primary">
                  {money(getPlatformFee(selected))}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">
                  Delivery fee
                </span>

                <span className="font-medium text-primary">
                  {money(getDeliveryFee(selected))}
                </span>
              </div>

              <div className="border-t border-primary/10 pt-3">
                <div className="flex justify-between gap-3">
                  <span className="font-bold text-primary">
                    Grand Total
                  </span>

                  <span className="text-lg font-extrabold text-emerald-600">
                    {money(getGrandTotal(selected))}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Close */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className={`${btn} w-full`}
            >
              Close Details
            </button>
          </div>

        </Drawer>
      )}

      <Toast message={toast} />

      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default OrderManagement;