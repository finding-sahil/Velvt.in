import { Skeleton } from "@/components/ui/Skeleton";

export default function VolunteersLoading() {
  return (
    <div className="py-12 md:py-20 relative animate-fade-in">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-20 relative z-10">
        {/* Hero Section Heading Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 sm:h-16 w-3/4 max-w-2xl" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-xl" />
          <div className="flex flex-wrap gap-4 pt-4">
            <Skeleton className="h-11 w-52 rounded-full bg-primary/20 border border-primary/40" />
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>
        </div>

        {/* What You Stand to Gain (4 Skill Cards) */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <Skeleton className="h-6 w-56" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Open Crew Positions & Departments (6 Cards Grid) */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
            <Skeleton className="h-6 w-72" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-6 sm:p-7 rounded-[20px] border border-white/10 bg-white/[0.04] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
                <div className="pt-4 border-t border-white/[0.08] space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3.5 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Crew Registry Table Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <Skeleton className="h-6 w-64" />
            </div>
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28 ml-auto" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center gap-4"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
