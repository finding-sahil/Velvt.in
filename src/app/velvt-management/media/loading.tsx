import { Skeleton } from "@/components/ui/Skeleton";

export default function MediaLibraryLoading() {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ─── Header & Storage Overview Skeleton ─── */}
      <div className="bg-[#09090b] border border-white/[0.08] p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red/50 animate-pulse" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-3.5 w-80" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>

        {/* Storage Health Metrics Bar Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-2.5 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filter Tabs & Search Row Skeleton ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Skeleton className="h-8 w-16 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-full sm:w-64 rounded-xl" />
      </div>

      {/* ─── Media Grid Skeleton ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden p-2 space-y-2"
          >
            <Skeleton className="w-full aspect-square rounded-xl" />
            <div className="space-y-1 px-1 pb-1">
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center justify-between pt-0.5">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
