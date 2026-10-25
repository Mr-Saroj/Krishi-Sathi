// src/components/SellerMiddleContent.jsx
import React from 'react';
import {
  StatCard,
  AwaitingAcceptance,
  ReadyForPickup,
  LowStockProducts,
  SettlementsPayouts,
} from '../utils/middlecontentUtils';
import useMiddleContent from '../hooks/useMiddleContent';
import AdminMiddleContentSkeleton from '../Skeliton/SellerMiddleContentSkeleton';

const formatINR = (value) => `₹${value.toLocaleString('en-IN')}`;

const SellerMiddleContent = () => {
  const {
    loading,
    error,
    today,
    awaitingAcceptance,
    lowStock,
    readyForPickup,
    settlements,
    respondToOrder,
  } = useMiddleContent();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Error */}
      {error && (
        <div
          role="alert"
          className="neu-inset rounded-xl px-4 py-3 text-sm font-medium text-error"
        >
          {error}
        </div>
      )}

      {/* Dashboard Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
            Store Overview
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Today's orders, stock, pickups, and payouts for your store.
          </p>
        </div>

        <span className="neu-inset-sm mt-3 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-secondary sm:mt-0">
          <span className="h-2 w-2 rounded-full bg-secondary" />
          Live dashboard overview
        </span>
      </div>

      {loading ? (
        <AdminMiddleContentSkeleton />
      ) : (
        <>
          {/* Today at a glance */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Today's Orders"
              value={today.orders.toLocaleString('en-IN')}
              icon="shopping_bag"
              colorClass="text-blue-600"
              sub="TODAY"
            />

            <StatCard
              label="Today's Sales"
              value={formatINR(today.sales)}
              icon="currency_rupee"
              colorClass="text-emerald-600"
              sub="SALES"
            />

            <StatCard
              label="Awaiting Acceptance"
              value={awaitingAcceptance.length.toLocaleString('en-IN')}
              icon="pending_actions"
              colorClass="text-amber-600"
              sub="ACTION"
            />

            <StatCard
              label="Ready for Pickup"
              value={readyForPickup.length.toLocaleString('en-IN')}
              icon="local_shipping"
              colorClass="text-orange-600"
              sub="PICKUP"
            />
          </section>

          {/* Orders that need the seller */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AwaitingAcceptance
              orders={awaitingAcceptance}
              onRespond={respondToOrder}
            />
            <ReadyForPickup orders={readyForPickup} />
          </div>

          {/* Stock and money */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LowStockProducts products={lowStock} />
            <SettlementsPayouts settlements={settlements} />
          </div>
        </>
      )}

      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default SellerMiddleContent;