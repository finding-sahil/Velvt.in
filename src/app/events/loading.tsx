import { Skeleton, EventCardSkeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvet animate-fade-in space-y-16">
      {/* Header Skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-24 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      {/* Featured / Upcoming Events Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-5 w-36" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Past Archive Skeleton */}
      <div className="space-y-6 pt-12 border-t border-white/[0.05]">
        <Skeleton className="h-5 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
