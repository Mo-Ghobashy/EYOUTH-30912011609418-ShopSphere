interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded-2xl bg-canvas ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-bento bg-card p-4 shadow-bento-sm">
      <LoadingSkeleton className="aspect-square w-full rounded-2xl" />
      <LoadingSkeleton className="mt-4 h-4 w-3/4" />
      <LoadingSkeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
