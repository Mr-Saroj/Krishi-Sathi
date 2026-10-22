// src/components/AdminMiddleContent.jsx
import React from 'react';
import {
  StatCard,
  SalesChart,
  RecentOrders,
  DashboardAlerts,
} from '../utils/middlecontentUtils';
import useMiddleContent from '../hooks/useMiddleContent';
import AdminMiddleContentSkeleton from '../Skeliton/AdminMiddleContentSkeleton';

const AdminMiddleContent = () => {
  const { loading, error, stats, recentOrders, salesData, alerts } =
    useMiddleContent();

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
            Marketplace Overview
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Monitor orders, sellers, revenue, and platform activity.
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
          {/* Main Statistics */}
          {/* colorClass is now a text colour only (icon well is inset) */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Sales"
              value={`₹${stats.totalSales.toLocaleString('en-IN')}`}
              icon="currency_rupee"
              colorClass="text-emerald-600"
              sub="SALES"
            />

            <StatCard
              label="Total Orders"
              value={stats.totalOrders.toLocaleString('en-IN')}
              icon="shopping_bag"
              colorClass="text-blue-600"
              sub="ORDERS"
            />

            <StatCard
              label="Total Sellers"
              value={stats.totalSellers.toLocaleString('en-IN')}
              icon="storefront"
              colorClass="text-violet-600"
              sub="SELLERS"
            />

            <StatCard
              label="Pending Approvals"
              value={stats.pendingSellers.toLocaleString('en-IN')}
              icon="pending_actions"
              colorClass="text-amber-600"
              sub="REVIEW"
            />

            <StatCard
              label="Active Products"
              value={stats.activeProducts.toLocaleString('en-IN')}
              icon="inventory_2"
              colorClass="text-cyan-600"
              sub="PRODUCTS"
            />

            <StatCard
              label="Delivery Partners"
              value={stats.deliveryPartners.toLocaleString('en-IN')}
              icon="local_shipping"
              colorClass="text-orange-600"
              sub="DELIVERY"
            />

            <StatCard
              label="Platform Commission"
              value={`₹${stats.commissionRevenue.toLocaleString('en-IN')}`}
              icon="account_balance_wallet"
              colorClass="text-secondary"
              sub="REVENUE"
            />

            <StatCard
              label="Pending Orders"
              value={stats.pendingOrders.toLocaleString('en-IN')}
              icon="hourglass_top"
              colorClass="text-rose-600"
              sub="ACTION"
            />
          </section>

          {/* Sales Chart */}
          <SalesChart data={salesData} />

          {/* Recent Orders */}
          <RecentOrders orders={recentOrders} />

          {/* Alerts */}
          <DashboardAlerts alerts={alerts} />
        </>
      )}

      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default AdminMiddleContent;