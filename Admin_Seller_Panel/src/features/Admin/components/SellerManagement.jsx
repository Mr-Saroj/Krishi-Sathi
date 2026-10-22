
import React from 'react';

import { StatCard } from '../utils/middlecontentUtils';
import useSellerManagement from '../hooks/useSellerManagement';

import SellerDetailPanel from './SellerDetailPanel';
import SellerManagementSkeleton from '../Skeliton/SellerManagementSkeleton';

import {
  STATUS_TEXT,
  formatINR,
  openComplaintCount,
} from '../utils/sellerManagementUtils';

const inputBase =
  'neu-inset rounded-xl border-0 py-2.5 text-sm text-on-surface outline-none placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60';

// Tab-specific details column
const getDetails = (seller, tab) => {
  if (tab === 'applications') {
    const verified = seller.documents.filter(
      (document) => document.status === 'VERIFIED'
    ).length;

    return `${verified}/${seller.documents.length} documents verified`;
  }

  if (tab === 'complaints') {
    return `${openComplaintCount(seller)} open complaint(s)`;
  }

  return seller.perf.orders
    ? `${formatINR(seller.perf.totalSales)} • ${seller.perf.orders} orders`
    : 'No sales yet';
};

const SellerManagement = () => {
  const {
    isLoading,
    tab,
    setTab,
    query,
    setQuery,
    status,
    setStatus,
    stats,
    visibleSellers,
    selectedSeller,
    openSeller,
    closeSeller,
    toast,
    actions,
  } = useSellerManagement();

  // Show skeleton while initial data is loading
  if (isLoading) {
    return <SellerManagementSkeleton />;
  }

  const tabs = [
    ['applications', `Applications (${stats.pending})`],
    ['all', 'All sellers'],
    ['complaints', 'Complaints'],
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
          Seller Management
        </h1>

        <p className="mt-1 text-sm text-on-surface-variant">
          Review applications, verify documents, and manage seller status and complaints.
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sellers"
          value={stats.total}
          icon="storefront"
          colorClass="text-violet-600"
          sub="ALL"
        />

        <StatCard
          label="Pending Applications"
          value={stats.pending}
          icon="pending_actions"
          colorClass="text-amber-600"
          sub="REVIEW"
        />

        <StatCard
          label="Approved Sellers"
          value={stats.approved}
          icon="verified"
          colorClass="text-secondary"
          sub="ACTIVE"
        />

        <StatCard
          label="Suspended"
          value={stats.suspended}
          icon="block"
          colorClass="text-rose-600"
          sub="BLOCKED"
        />
      </section>

      {/* Seller List */}
      <section className="neu-raised overflow-hidden rounded-2xl">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="neu-inset flex w-fit gap-1 rounded-xl p-1.5">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  tab === key
                    ? 'neu-raised-sm text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className={`${inputBase} flex items-center px-4 sm:w-64`}>
              <span className="material-symbols-outlined mr-2 text-[20px] text-outline">
                search
              </span>

              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search seller, shop or city"
                className="w-full bg-transparent outline-none placeholder:text-outline"
              />
            </div>

            {tab === 'all' && (
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={`${inputBase} px-4`}
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {/* Seller Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-outline">
              <tr>
                {[
                  'Seller',
                  'Location',
                  'Applied on',
                  'Status',
                  'Details',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/10">
              {visibleSellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="transition-colors hover:bg-primary/5"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-primary">
                      {seller.shopName}
                    </p>

                    <p className="text-xs text-on-surface-variant">
                      {seller.owner} • {seller.id}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-on-surface-variant">
                    {seller.city}, {seller.state}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-xs text-outline">
                    {seller.appliedOn}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`neu-inset-sm whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${
                        STATUS_TEXT[seller.status]
                      }`}
                    >
                      {seller.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-xs text-on-surface-variant">
                    {getDetails(seller, tab)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openSeller(seller.id)}
                        className="neu-btn rounded-lg px-4 py-2 text-xs font-semibold text-primary"
                      >
                        {seller.status === 'PENDING' ? 'Review' : 'View'}
                      </button>

                      {seller.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => actions.approve(seller.id)}
                          className="neu-btn-primary rounded-lg px-4 py-2 text-xs font-semibold"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {visibleSellers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-outline"
                  >
                    No sellers found for this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Seller Detail Panel */}
      {selectedSeller && (
        <SellerDetailPanel
          key={selectedSeller.id}
          seller={selectedSeller}
          onClose={closeSeller}
          actions={actions}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="neu-raised fixed bottom-6 right-6 z-[70] rounded-xl px-5 py-3 text-sm font-semibold text-secondary"
        >
          {toast}
        </div>
      )}

      <div className="h-2 sm:h-4" />
    </div>
  );
};

export default SellerManagement;
