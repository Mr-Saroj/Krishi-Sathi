import React from 'react';

const bar = 'animate-pulse rounded-lg bg-primary/10';

const OrderManagementSkeleton = () => {
  return (
    <div
      className="space-y-6 sm:space-y-8"
      aria-busy="true"
      aria-label="Loading placed orders"
    >

      {/* Page heading */}
      <div>
        <div className={`${bar} h-8 w-48`} />
        <div className={`${bar} mt-3 h-4 w-full max-w-md`} />
      </div>

      {/* Summary card */}
      <div className="neu-raised w-full rounded-2xl p-5 sm:max-w-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className={`${bar} h-4 w-36`} />
            <div className={`${bar} mt-3 h-9 w-16`} />
            <div className={`${bar} mt-3 h-3 w-28`} />
          </div>

          <div className={`${bar} h-12 w-12 shrink-0 rounded-xl`} />
        </div>
      </div>

      {/* Orders section */}
      <section className="neu-raised overflow-hidden rounded-2xl">

        {/* Search and refresh */}
        <div className="flex flex-col gap-4 border-b border-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className={`${bar} h-6 w-32`} />
            <div className={`${bar} mt-2 h-4 w-44`} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className={`${bar} h-12 w-full rounded-xl sm:w-80`} />
            <div className={`${bar} h-12 w-full rounded-xl sm:w-28`} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">

            {/* Header row */}
            <div className="grid grid-cols-8 gap-4 bg-primary/5 px-5 py-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${bar} h-3 w-20`} />
              ))}
            </div>

            {/* Body rows */}
            <div className="divide-y divide-primary/10">
              {Array.from({ length: 5 }).map((_, row) => (
                <div
                  key={row}
                  className="grid grid-cols-8 items-center gap-4 px-5 py-4"
                >
                  <div>
                    <div className={`${bar} h-4 w-24`} />
                    <div className={`${bar} mt-2 h-3 w-20`} />
                  </div>

                  <div className={`${bar} h-4 w-28`} />
                  <div className={`${bar} h-4 w-16`} />
                  <div className={`${bar} h-4 w-8`} />
                  <div className={`${bar} h-4 w-16`} />
                  <div className={`${bar} h-6 w-14 rounded-full`} />
                  <div className={`${bar} h-6 w-16 rounded-full`} />
                  <div className={`${bar} h-9 w-20 rounded-xl`} />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default OrderManagementSkeleton;