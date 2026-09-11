import { Skeleton, EventCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen py-12 space-y-24 container-velvt animate-fade-in">
      {/* Hero Skeleton */}
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto pt-16">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-16 w-full max-w-2xl" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-4 pt-6">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>

      {/* Featured Event Section Skeleton */}
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-72" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-center border border-white/[0.06] bg-rich-charcoal/30 p-6 md:p-8 rounded-sm">
          <Skeleton className="h-96 w-full rounded-sm" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-sm" />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-36" />
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards Grid Skeleton */}
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
