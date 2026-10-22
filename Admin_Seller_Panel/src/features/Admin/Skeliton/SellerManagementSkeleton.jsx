
import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-lg bg-primary/10 ${className}`}
  />
);

const SellerManagementSkeleton = () => {
  return (
    <div
      className="space-y-6 sm:space-y-8"
      role="status"
      aria-label="Loading seller management"
    >
      {/* Heading */}
      <div>
        <Skeleton className="h-7 w-56 sm:h-8 sm:w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
      </div>

      {/* Statistics cards */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="neu-raised rounded-2xl p-5 sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </section>

      {/* Seller list */}
      <section className="neu-raised overflow-hidden rounded-2xl">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="neu-inset flex w-fit gap-2 rounded-xl p-1.5">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-full sm:w-36" />
          </div>
        </div>

        {/* Table */}
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
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-40" />
                  </td>

                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>

                  <td className="px-6 py-4">
                    <Skeleton className="h-3 w-24" />
                  </td>

                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>

                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-16" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="h-2 sm:h-4" />

      <span className="sr-only">Loading seller data...</span>
    </div>
  );
};

export default SellerManagementSkeleton;
