import { Skeleton } from "@/components/ui/Skeleton";

export default function TicketsLoading() {
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
          <Skeleton className="h-3.5 w-80" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* ─── Filter Row Skeleton ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>

      {/* ─── Table Ledger Skeleton ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
