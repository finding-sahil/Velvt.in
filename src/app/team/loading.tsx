import { Skeleton, TeamCardSkeleton } from "@/components/ui/Skeleton";

export default function TeamLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvt animate-fade-in space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-28 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      <div className="space-y-16">
        {Array.from({ length: 2 }).map((_, categoryIdx) => (
          <div key={categoryIdx} className="space-y-8">
            <Skeleton className="h-4 w-32" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <TeamCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
