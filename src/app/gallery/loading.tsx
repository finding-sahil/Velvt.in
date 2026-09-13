import { Skeleton } from "@/components/ui/Skeleton";

export default function GalleryLoading() {
  return (
    <div className="py-12 md:py-20 relative animate-fade-in">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-16 relative z-10">
        {/* Section Heading Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 sm:h-16 w-3/4 max-w-xl" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-2xl" />
        </div>

        {/* Gallery Controls Skeleton */}
        <div className="space-y-6">
          {/* Timeline Bar Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.08] p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-36 rounded-lg bg-primary/20 border border-primary/40" />
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>

          {/* Categories & Search Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24 rounded-xl bg-primary/20" />
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-36 rounded-xl" />
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full lg:w-72 rounded-xl" />
          </div>

          {/* Results Counter Skeleton */}
          <div className="flex justify-between items-center text-xs">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3.5 w-28" />
          </div>

          {/* 4-Column Responsive Visual Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-[18px] border border-white/10 bg-white/[0.03] overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col justify-end p-4"
              >
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                <div className="relative z-10 space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>

          {/* Media Submissions CTA Skeleton */}
          <div className="border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-12 rounded-[20px] text-center max-w-3xl mx-auto space-y-4 shadow-[0_0_30px_rgba(200,16,46,0.1)]">
            <div className="w-12 h-0.5 bg-primary/40 rounded-full mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-full max-w-lg mx-auto" />
            <Skeleton className="h-9 w-48 rounded-full mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
