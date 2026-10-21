
import React from 'react';
import {
  StatCard,
  SalesChart,
  RecentOrders,
  DashboardAlerts,
} from '../utils/middlecontentUtils';
import PageLoader from '../../../components/common/PageLoader';
import useMiddleContent from '../hooks/useMiddleContent';
import AdminMiddleContentSkeleton from '../Skeliton/AdminMiddleContentSkeleton';

const AdminMiddleContent = () => {
  const {
    loading,
    error,
    stats,
    recentOrders,
    salesData,
    alerts,
  } = useMiddleContent();

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Dashboard Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
            Marketplace Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor orders, sellers, revenue, and platform activity.
          </p>
        </div>

        <span className="mt-2 w-fit rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:mt-0">
          Live dashboard overview
        </span>
      </div>

      {loading ? (
        <AdminMiddleContentSkeleton />
      ) : (
        <>
          {/* Main Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Sales"
              value={`₹${stats.totalSales.toLocaleString('en-IN')}`}
              icon="currency_rupee"
              colorClass="bg-emerald-50 text-emerald-600"
              sub="SALES"
            />

            <StatCard
              label="Total Orders"
              value={stats.totalOrders.toLocaleString('en-IN')}
              icon="shopping_bag"
              colorClass="bg-blue-50 text-blue-600"
              sub="ORDERS"
            />

            <StatCard
              label="Total Sellers"
              value={stats.totalSellers.toLocaleString('en-IN')}
              icon="storefront"
              colorClass="bg-violet-50 text-violet-600"
              sub="SELLERS"
            />

            <StatCard
              label="Pending Approvals"
              value={stats.pendingSellers.toLocaleString('en-IN')}
              icon="pending_actions"
              colorClass="bg-amber-50 text-amber-600"
              sub="REVIEW"
            />

            <StatCard
              label="Active Products"
              value={stats.activeProducts.toLocaleString('en-IN')}
              icon="inventory_2"
              colorClass="bg-cyan-50 text-cyan-600"
              sub="PRODUCTS"
            />

            <StatCard
              label="Delivery Partners"
              value={stats.deliveryPartners.toLocaleString('en-IN')}
              icon="local_shipping"
              colorClass="bg-orange-50 text-orange-600"
              sub="DELIVERY"
            />

            <StatCard
              label="Platform Commission"
              value={`₹${stats.commissionRevenue.toLocaleString('en-IN')}`}
              icon="account_balance_wallet"
              colorClass="bg-green-50 text-green-700"
              sub="REVENUE"
            />

            <StatCard
              label="Pending Orders"
              value={stats.pendingOrders.toLocaleString('en-IN')}
              icon="hourglass_top"
              colorClass="bg-rose-50 text-rose-600"
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