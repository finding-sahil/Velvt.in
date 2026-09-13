import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">
      {/* Top Welcome Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-32" />
            <span className="text-white/20">•</span>
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-72" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-2.5"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Quick Action Shortcuts Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2 text-center flex flex-col items-center justify-center"
          >
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>

      {/* 2-Column Split: Recent Records Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Registrations */}
        <div className="border border-white/10 bg-white/[0.02] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex justify-between items-center"
              >
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Inquiries */}
        <div className="border border-white/10 bg-white/[0.02] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex justify-between items-center"
              >
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
