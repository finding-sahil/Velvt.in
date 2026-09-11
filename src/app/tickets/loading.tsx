import { Skeleton } from "@/components/ui/Skeleton";

export default function TicketsLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvet animate-fade-in space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-24 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      {/* Event Ticket Groups */}
      <div className="space-y-16">
        {Array.from({ length: 2 }).map((_, eventIdx) => (
          <div key={eventIdx} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/[0.08] pb-4">
              <Skeleton className="h-8 w-60" />
              <Skeleton className="h-4 w-40" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm border border-white/[0.08] bg-rich-charcoal/30 p-6 space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-36" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <Skeleton className="h-11 w-full rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
