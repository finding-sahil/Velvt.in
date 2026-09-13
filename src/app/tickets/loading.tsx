import { Skeleton } from "@/components/ui/Skeleton";

export default function TicketsLoading() {
  return (
    <div className="py-12 md:py-20 relative min-h-[70vh] animate-fade-in">
      <div className="container-velvt space-y-12">
        {/* Section Heading Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 sm:h-16 w-3/4 max-w-lg" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-xl" />
        </div>

        {/* Tickets Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 sm:p-7 rounded-[20px] border border-white/10 bg-white/[0.05] backdrop-blur-[14px] space-y-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-7 w-36" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full bg-primary/20 border border-primary/40" />
              </div>
            </div>
          ))}
        </div>

        {/* Admission Information Box Skeleton */}
        <div className="rounded-[20px] bg-white/[0.03] border border-white/10 p-6 sm:p-8 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
