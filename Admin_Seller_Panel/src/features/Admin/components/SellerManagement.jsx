import React, { useEffect } from 'react';

import useSellerManagement from '../hooks/useSellerManagement';
import SellerDetailPanel from './SellerDetailPanel';
import SellerManagementSkeleton from '../Skeliton/SellerManagementSkeleton';

import { STATUS_TEXT } from '../utils/sellerManagementUtils';

const SellerManagement = () => {
  const {
    isLoading,
    isDetailLoading,
    error,
    tab,
    setTab,
    visibleSellers,
    selectedSeller,
    openSeller,
    closeSeller,
    toast,
    actions,
    hasNext,
    loadMore,
  } = useSellerManagement();

  // Keep the hook in the applications view because the UI now
  // displays pending applications only.
  useEffect(() => {
    if (tab !== 'applications') {
      setTab('applications');
    }
  }, [tab, setTab]);

  // Show skeleton while pending sellers are loading.
  if (isLoading) {
    return <SellerManagementSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-extrabold text-primary sm:text-2xl">
          Pending Seller Applications
        </h1>

        <p className="mt-1 text-sm text-on-surface-variant">
          Review seller registration details and documents before approving
          their applications.
        </p>
      </div>

      {/* API error */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{error}</p>
        </div>
      )}

      {/* Pending seller list */}
      <section className="neu-raised overflow-hidden rounded-2xl">
        {/* Table heading */}
        <div className="flex flex-col gap-2 border-b border-primary/10 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-primary">
            Seller Applications
          </h2>

          <p className="text-sm text-on-surface-variant">
            Review each pending application before granting login access.
          </p>
        </div>

        {/* Seller table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-primary/5 text-xs uppercase tracking-wide text-outline">
              <tr>
                {[
                  'Seller',
                  'Location',
                  'Applied on',
                  'Status',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/10">
              {visibleSellers.map((seller) => {
                const sellerId =
                  seller.id ?? seller.sellerId ?? seller._id;

                const sellerName =
                  seller.owner ??
                  seller.fullName ??
                  'Unknown seller';

                const shopName =
                  seller.shopName ??
                  seller.businessName ??
                  'Unnamed shop';

                const location = [
                  seller.city,
                  seller.state,
                ]
                  .filter(Boolean)
                  .join(', ');

                const sellerStatus =
                  seller.status ??
                  seller.loginAccess ??
                  'PENDING';

                return (
                  <tr
                    key={sellerId}
                    className="transition-colors hover:bg-primary/5"
                  >
                    {/* Seller information */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-primary">
                        {shopName}
                      </p>

                      <p className="mt-1 text-xs text-on-surface-variant">
                        {sellerName}
                      </p>

                      <p className="mt-1 break-all text-xs text-outline">
                        {seller.email ?? sellerId}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-on-surface-variant">
                      {location || 'Not provided'}
                    </td>

                    {/* Application date */}
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-outline">
                      {seller.appliedOn ??
                        seller.createdAt ??
                        '—'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`neu-inset-sm whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${STATUS_TEXT?.[sellerStatus] ??
                          'text-amber-700'
                          }`}
                      >
                        {sellerStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openSeller(sellerId)}
                          disabled={isDetailLoading}
                          className="neu-btn rounded-lg px-4 py-2 text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDetailLoading
                            ? 'Loading...'
                            : 'Review'}
                        </button>

                        <button
                          type="button"
                          onClick={() => actions.approve(sellerId)}
                          disabled={sellerStatus !== 'PENDING'}
                          className="neu-btn-primary rounded-lg px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty state */}
              {visibleSellers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-outline">
                        task_alt
                      </span>

                      <p className="font-semibold text-primary">
                        {error
                          ? 'Unable to load pending applications'
                          : 'No pending seller applications'}
                      </p>

                      <p className="text-sm text-on-surface-variant">
                        {error
                          ? 'Check the API error above and try again.'
                          : 'New seller applications will appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Load more pending applications */}
        {hasNext && (
          <div className="flex justify-center border-t border-primary/10 p-4">
            <button
              type="button"
              onClick={loadMore}
              className="neu-btn rounded-xl px-5 py-3 text-sm font-semibold text-primary"
            >
              Load More Applications
            </button>
          </div>
        )}
      </section>

      {/* Seller details panel */}
      {selectedSeller && (
        <SellerDetailPanel
          key={selectedSeller.sellerId ?? selectedSeller.id}
          seller={selectedSeller}
          onClose={closeSeller}
          actions={actions}
        />
      )}

      {/* Seller detail loading indicator */}
      {isDetailLoading && !selectedSeller && (
        <div
          role="status"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20"
        >
          <div className="neu-raised rounded-xl px-6 py-4 text-sm font-semibold text-primary">
            Loading seller details...
          </div>
        </div>
      )}

      {/* Toast notification */}
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