import { Skeleton } from "@/components/ui/Skeleton";

export default function PressLoading() {
  return (
    <div className="py-12 md:py-20 relative animate-fade-in">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-20 relative z-10">
        {/* Section Heading Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 sm:h-16 w-3/4 max-w-lg" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-xl" />
        </div>

        {/* Media Kit Download Banner Skeleton */}
        <div className="border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-12 rounded-[20px] space-y-5 shadow-[0_0_40px_rgba(200,16,46,0.18)]">
          <Skeleton className="h-6 w-56 rounded-full bg-red/10 border border-red/30" />
          <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xl" />
          <div className="w-12 h-0.5 bg-primary/40 rounded-full" />
          <div className="space-y-2 max-w-2xl">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="pt-3 flex flex-wrap gap-4">
            <Skeleton className="h-11 w-44 rounded-full bg-primary/20 border border-primary/40" />
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>
        </div>

        {/* Featured Coverage Articles Grid Skeleton */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border border-white/10 bg-white/[0.04] backdrop-blur-[14px] p-8 rounded-[20px] flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <Skeleton className="h-7 w-4/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-5/6" />
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial & Interview Requests Card Skeleton */}
        <div className="border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-10 rounded-[20px] grid sm:grid-cols-2 gap-8 items-center shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
          <div className="sm:text-right space-y-2">
            <Skeleton className="h-3 w-28 sm:ml-auto" />
            <Skeleton className="h-6 w-40 sm:ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
