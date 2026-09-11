import { Skeleton } from "@/components/ui/Skeleton";

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      {/* Event Hero Skeleton */}
      <div className="relative h-[65vh] min-h-[480px] bg-rich-charcoal/40 flex items-end">
        <div className="container-velvet pb-12 space-y-4 w-full">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-14 sm:h-20 w-3/4 max-w-2xl" />
          <div className="flex flex-wrap gap-4 pt-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      </div>

      {/* Countdown & Quick Action Strip */}
      <div className="border-y border-white/[0.08] bg-obsidian/80 backdrop-blur-md py-6">
        <div className="container-velvet flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-14 rounded-sm" />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container-velvet py-16 grid lg:grid-cols-3 gap-12">
        {/* Left 2 Cols: Details, Schedule, FAQs */}
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-4">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-44" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-sm" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-44" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Tickets & Venue */}
        <div className="space-y-8">
          <div className="border border-white/[0.08] bg-rich-charcoal/30 p-6 rounded-sm space-y-6">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-sm" />
              ))}
            </div>
          </div>

          <div className="border border-white/[0.08] bg-rich-charcoal/30 p-6 rounded-sm space-y-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-40 w-full rounded-sm" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
