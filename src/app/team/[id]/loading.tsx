import { Skeleton, TeamCardSkeleton } from "@/components/ui/Skeleton";

export default function TeamMemberLoading() {
  return (
    <div className="min-h-screen py-10 sm:py-16 relative animate-fade-in">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-16 relative z-10">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <span className="text-white/20">/</span>
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>

        {/* Hero Portfolio Profile Showcase Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Portrait & Quick Credentials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/15 bg-black/60 backdrop-blur-xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
              {/* Portrait Aspect Ratio */}
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden relative bg-black">
                <Skeleton className="w-full h-full rounded-none" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <Skeleton className="h-6 w-28 rounded-full bg-red/20 border border-red/40" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              {/* Social Channels Bar Skeleton */}
              <div className="p-4 pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-8 w-28 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right Column: Narrative, Responsibilities, Achievements */}
          <div className="lg:col-span-7 space-y-10">
            {/* Header / Designation */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-36 rounded-full bg-red/10 border border-red/30" />
              <Skeleton className="h-12 sm:h-16 w-4/5" />
              <Skeleton className="h-4 w-52 rounded-full" />
            </div>

            {/* Philosophy / Personal Quote Skeleton */}
            <div className="p-6 sm:p-8 rounded-2xl border border-red/30 bg-red/[0.04] space-y-3 relative">
              <div className="absolute -top-3 left-6">
                <Skeleton className="h-5 w-36 rounded" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>

            {/* Executive Overview Box Skeleton */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-[2px] bg-red" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>

            {/* Core Responsibilities Grid Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-[2px] bg-red" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Production Highlights Grid Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-[2px] bg-red" />
                <Skeleton className="h-4 w-44" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Explore More Team Members Skeleton */}
        <div className="space-y-8 pt-16 border-t border-white/[0.08]">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-52" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
