import React from 'react';

const SkeletonBlock = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
  />
);

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-8 w-32 max-w-full" />
        <SkeletonBlock className="h-3 w-20" />
      </div>

      <SkeletonBlock className="h-12 w-12 shrink-0 rounded-xl" />
    </div>

    <div className="mt-5 border-t border-slate-100 pt-4">
      <SkeletonBlock className="h-3 w-28" />
    </div>
  </div>
);

const ChartSkeleton = () => (
  <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <SkeletonBlock className="h-5 w-36" />
        <SkeletonBlock className="h-3 w-52 max-w-full" />
      </div>

      <SkeletonBlock className="h-9 w-28" />
    </div>

    {/* Chart bars */}
    <div className="flex h-56 items-end gap-3 border-b border-l border-slate-100 px-3 sm:gap-6 sm:px-6">
      {[45, 65, 40, 78, 55, 90, 68, 100, 58, 75, 48, 85].map(
        (height, index) => (
          <div
            key={index}
            className="flex flex-1 items-end"
            style={{ height: '100%' }}
          >
            <SkeletonBlock
              className="w-full rounded-t-md rounded-b-none"
            />
          </div>
        ),
      )}
    </div>

    <div className="mt-4 flex justify-between gap-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className="h-3 w-8 max-w-full"
        />
      ))}
    </div>
  </section>
);

const RecentOrdersSkeleton = () => (
  <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-3 w-48 max-w-full" />
      </div>
      <SkeletonBlock className="h-8 w-20" />
    </div>

    {/* Desktop table header */}
    <div className="hidden grid-cols-5 gap-4 bg-slate-50 px-6 py-4 sm:grid">
      {[1, 2, 3, 4, 5].map((item) => (
        <SkeletonBlock key={item} className="h-3 w-16" />
      ))}
    </div>

    <div className="divide-y divide-slate-100">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-5 sm:items-center sm:gap-4 sm:px-6"
        >
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-3 w-32" />
          </div>

          <div className="hidden sm:block">
            <SkeletonBlock className="h-3 w-24" />
          </div>

          <div className="hidden sm:block">
            <SkeletonBlock className="h-3 w-16" />
          </div>

          <SkeletonBlock className="h-6 w-24 rounded-full" />

          <SkeletonBlock className="h-4 w-20" />
        </div>
      ))}
    </div>
  </section>
);

const AlertsSkeleton = () => (
  <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5 space-y-2">
      <SkeletonBlock className="h-5 w-36" />
      <SkeletonBlock className="h-3 w-48 max-w-full" />
    </div>

    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-xl border border-slate-100 p-4"
        >
          <SkeletonBlock className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-36 max-w-full" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

const AdminMiddleContentSkeleton = () => (
  <div
    className="space-y-6 sm:space-y-8"
    role="status"
    aria-label="Loading marketplace dashboard"
    aria-busy="true"
  >
    {/* Dashboard heading */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-64 max-w-full sm:h-8" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>

      <SkeletonBlock className="h-8 w-36" />
    </div>

    {/* Eight statistics cards */}
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </section>

    <ChartSkeleton />
    <RecentOrdersSkeleton />
    <AlertsSkeleton />

    <span className="sr-only">Loading dashboard data...</span>
  </div>
);

export default AdminMiddleContentSkeleton;