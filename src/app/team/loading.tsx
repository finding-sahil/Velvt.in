import { Skeleton, TeamCardSkeleton } from "@/components/ui/Skeleton";

export default function TeamLoading() {
  return (
    <div className="py-12 md:py-20 relative animate-fade-in">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-16 relative z-10">
        {/* Section Heading Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 sm:h-16 w-64" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-xl" />
        </div>

        {/* Categories Skeletons */}
        <div className="space-y-16">
          {/* Category 1: Founders & Directorship */}
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
              <Skeleton className="h-6 w-56" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <TeamCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Category 2: Core Production & Management */}
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <TeamCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
