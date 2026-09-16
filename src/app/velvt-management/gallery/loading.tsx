import { Skeleton } from "@/components/ui/Skeleton";

export default function GalleryLoading() {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ─── Header Skeleton ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red/60 animate-pulse" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-8 sm:h-9 w-60" />
          <Skeleton className="h-3.5 w-72" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* ─── Filters & Search Bar Skeleton ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>

      {/* ─── Gallery Cards Grid Skeleton ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden space-y-3 p-3"
          >
            <Skeleton className="w-full aspect-[4/3] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
