import React from 'react';

const SkeletonLine = () => (
  <div className="h-4 animate-pulse rounded-lg bg-primary/10" />
);

const ProductManagementSkeleton = () => (
  <div className="space-y-6 sm:space-y-8">
    <div className="space-y-3">
      <SkeletonLine />
      <div className="h-4 w-2/3 animate-pulse rounded-lg bg-primary/10" />
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
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-10 w-28 animate-pulse rounded-xl bg-primary/10" />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="grid grid-cols-4 gap-5 border-b border-primary/10 py-5">
          {[1, 2, 3, 4].map((cell) => (
            <SkeletonLine key={cell} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default ProductManagementSkeleton;