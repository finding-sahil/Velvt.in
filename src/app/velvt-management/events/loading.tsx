import { Skeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ─── Header Skeleton ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red/60 animate-pulse" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 sm:h-9 w-64" />
          <Skeleton className="h-3.5 w-72" />
        </div>

        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* ─── Event Cards List Skeleton ─── */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-start sm:items-center gap-4 w-full md:w-auto">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-52 sm:w-72" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 border-white/[0.06] pt-3 md:pt-0">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
