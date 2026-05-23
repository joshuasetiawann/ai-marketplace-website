// Shimmer loading placeholders for premium perceived performance.
export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-white/[0.04] rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <Skeleton className="h-44 rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex justify-between pt-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="surface-card rounded-xl p-4 flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  )
}
