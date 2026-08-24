import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn("skeleton-shimmer block bg-white/[0.06]", className)}
      aria-hidden="true"
    />
  );
}

/** Skeleton matching the Card component's proportions, for KPI/summary tiles. */
export function SkeletonCard() {
  return (
    <div className="glass p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}

/** Skeleton matching the Table component's row structure. */
export function SkeletonTable({ columns, rows = 4 }: { columns: number; rows?: number }) {
  return (
    <div className="overflow-hidden border border-white/8">
      <div className="border-b border-white/8 bg-white/[0.02] px-4 py-3">
        <div className="flex gap-6">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/6">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-6 px-4 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-3 w-24" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
