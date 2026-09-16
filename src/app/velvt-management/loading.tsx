import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminUniversalLoading() {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Universal Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-28" />
            <span className="text-white/20">•</span>
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-8 sm:h-9 w-64" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
      </div>

      {/* Adaptive Controls / Filters Row Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-48 rounded-lg" />
      </div>

      {/* Universal Content Canvas Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
