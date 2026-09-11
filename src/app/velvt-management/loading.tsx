import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32 rounded-sm" />
          <Skeleton className="h-9 w-32 rounded-sm" />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-white/[0.08] bg-rich-charcoal/30 p-6 rounded-sm space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Recent Activity Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="border border-white/[0.08] bg-rich-charcoal/20 rounded-sm overflow-hidden">
          <div className="bg-white/[0.03] py-3.5 px-6 border-b border-white/[0.06] flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={4} />
          ))}
        </div>
      </div>
    </div>
  );
}
