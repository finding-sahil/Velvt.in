import { Skeleton, EventCardSkeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <div className="py-section-sm md:py-section animate-fade-in">
      <div className="container-velvt space-y-16">
        {/* Section Heading Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 sm:h-16 w-3/4 max-w-2xl" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-xl" />
        </div>

        <div className="space-y-20">
          {/* Upcoming & Current Productions (Featured Horizontal Card) */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
              <Skeleton className="h-6 w-72" />
            </div>
            <div className="space-y-8">
              <EventCardSkeleton variant="featured" />
            </div>
          </div>

          {/* Past Production Archive (3-Column Grid) */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white/30" />
              <Skeleton className="h-6 w-60" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
