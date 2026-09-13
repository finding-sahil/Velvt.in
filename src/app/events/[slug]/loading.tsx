import { Skeleton } from "@/components/ui/Skeleton";

export default function EventDetailLoading() {
  return (
    <div className="relative -mt-24 animate-fade-in">
      {/* ─── Event Hero Skeleton ─── */}
      <section className="relative min-h-[55vh] sm:min-h-[64vh] flex items-end overflow-hidden pt-24 sm:pt-28 bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

        <div className="container-velvt relative pb-10 pt-4 sm:pt-6 w-full">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-28 rounded-full bg-red/20 border border-red/40" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>

            <Skeleton className="h-12 sm:h-16 lg:h-20 w-4/5" />

            {/* Glowing Red Rule */}
            <div className="w-16 h-0.5 bg-primary/50 rounded-full" />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Skeleton className="h-4 w-32" />
              <span className="text-white/20">·</span>
              <Skeleton className="h-4 w-20" />
              <span className="text-white/20">·</span>
              <Skeleton className="h-4 w-44" />
            </div>

            <div className="flex flex-wrap gap-4 pt-3">
              <Skeleton className="h-11 w-44 rounded-full bg-primary/20 border border-primary/40" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Layout Skeleton ─── */}
      <div className="container-velvt py-12 md:py-16 grid lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Overview, Schedule, FAQs */}
        <div className="lg:col-span-2 space-y-12">
          {/* About Event Skeleton */}
          <div className="space-y-4 rounded-[20px] bg-white/[0.03] border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <Skeleton className="h-6 w-44" />
            </div>
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Schedule / Run of Show Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5 flex justify-between items-center"
                >
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column (Sticky Sidebar): Tickets & Venue */}
        <div className="space-y-8 lg:sticky lg:top-28">
          {/* Admission Passes Card */}
          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-8 space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <div className="space-y-1">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Venue & Location Card */}
          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-8 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
