import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden animate-fade-in pb-24">
      {/* Top Ambient Loading Shimmer Line */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="h-[2.5px] w-full bg-gradient-to-r from-transparent via-[var(--theme-primary,#dc2626)] to-transparent animate-pulse shadow-[0_0_16px_var(--theme-primary-glow,rgba(220,38,38,0.7))]" />
      </div>

      {/* ─── Hero Section Skeleton ─── */}
      <section className="relative min-h-[78vh] flex items-center justify-center text-center pt-24 pb-14 sm:py-24 px-4 overflow-hidden">
        {/* Ambient Halo Glow */}
        <div className="absolute top-1/4 -right-24 w-[420px] h-[420px] rounded-full bg-red filter blur-[150px] opacity-[0.12] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-[360px] h-[360px] rounded-full bg-red filter blur-[140px] opacity-[0.08] pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-6">
          {/* Main Brand Title Skeleton (Matching massive VELVT.IN) */}
          <div className="relative my-2 w-full flex justify-center">
            <Skeleton className="h-20 sm:h-28 md:h-36 w-3/4 max-w-2xl rounded-2xl bg-white/[0.06] border-white/10" />
          </div>

          {/* Crimson Divider Rule Skeleton */}
          <div className="h-[2px] w-24 bg-[var(--theme-primary,#dc2626)]/40 rounded-full mx-auto" />

          {/* Cinematic Tagline Skeleton */}
          <Skeleton className="h-6 w-3/4 sm:w-1/2 mx-auto rounded-full" />

          {/* Subtitle Skeleton */}
          <div className="space-y-2 w-full max-w-xl mx-auto">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-5/6 mx-auto rounded-full" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Skeleton className="h-12 w-44 rounded-full bg-[var(--theme-primary,#dc2626)]/20 border border-[var(--theme-primary,#dc2626)]/40" />
            <Skeleton className="h-12 w-36 rounded-full" />
            <Skeleton className="h-12 w-36 rounded-full" />
          </div>

          {/* Social Badges Skeleton */}
          <div className="pt-6 flex gap-3">
            <Skeleton className="h-9 w-36 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>
        </div>
      </section>

      {/* ─── Featured Event Banner Skeleton ─── */}
      <section className="container-velvt py-12">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-[14px] p-6 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
          {/* Image Left */}
          <div className="lg:col-span-5 aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
            <Skeleton className="w-full h-full rounded-none" />
          </div>

          {/* Details Right */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex gap-3 items-center">
              <Skeleton className="h-6 w-28 rounded-full bg-red-dim border border-red-glow/40" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-12 sm:h-16 w-4/5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/[0.08]">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-44 rounded-lg" />
              <Skeleton className="h-11 w-36 rounded-full bg-[var(--theme-primary,#dc2626)]/30 ml-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Upcoming Experiences Grid Skeleton ─── */}
      <section className="container-velvt py-12 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-60" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-white/10 bg-white/[0.04] backdrop-blur-[14px] overflow-hidden p-6 space-y-4"
            >
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
