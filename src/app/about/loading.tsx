import { Skeleton } from "@/components/ui/Skeleton";

export default function AboutLoading() {
  return (
    <div className="py-12 md:py-20 relative animate-fade-in">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      {/* Hero Skeleton (Left-aligned) */}
      <section className="container-velvt mb-16">
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-12 sm:h-16 lg:h-20 w-4/5" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-5 w-72 rounded-full" />
        </div>
      </section>

      {/* Brand Story Card Skeleton */}
      <section className="container-velvt mb-16">
        <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 space-y-6 max-w-4xl shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <Skeleton className="h-7 w-48" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </section>

      {/* Mission & Vision 2-Column Grid Skeleton */}
      <section className="container-velvt mb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>

          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        </div>
      </section>

      {/* Experience Philosophy Card Skeleton */}
      <section className="container-velvt">
        <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 space-y-6 max-w-4xl shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </section>
    </div>
  );
}
