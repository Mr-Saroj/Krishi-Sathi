import React from 'react';

const SkeletonLine = ({ className = '' }) => (
  <div className={`h-4 animate-pulse rounded-lg bg-primary/10 ${className}`} />
);

const DeliveryManagementSkeleton = () => (
  <div className="space-y-6 sm:space-y-8">
    <div className="space-y-3">
      <SkeletonLine />
      <SkeletonLine className="w-2/3" />
    </div>

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="neu-raised space-y-4 rounded-2xl p-6">
          <SkeletonLine />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-primary/10" />
          <SkeletonLine />
        </div>
      ))}
    </div>

    <div className="neu-raised space-y-6 rounded-2xl p-5">
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 w-28 animate-pulse rounded-xl bg-primary/10" />
        ))}
      </div>
      {Array.from({ length: 5 }, (_, row) => (
        <div key={row} className="grid grid-cols-6 gap-5 border-b border-primary/10 py-5">
          {Array.from({ length: 6 }, (_, cell) => (
            <SkeletonLine key={cell} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default DeliveryManagementSkeleton;