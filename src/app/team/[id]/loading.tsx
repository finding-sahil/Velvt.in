import { Skeleton, TeamCardSkeleton } from "@/components/ui/Skeleton";

export default function TeamMemberLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvt animate-fade-in space-y-16">
      {/* Back Navigation Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-36 rounded-full" />
      </div>

      {/* ─── 2-Column Portfolio Layout ─── */}
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Portrait & Key Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Portrait Image Skeleton */}
          <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
            <Skeleton className="w-full h-full rounded-none" />
          </div>

          {/* Social Links & Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        {/* Right Column: Bio, Quote, Highlights */}
        <div className="lg:col-span-7 space-y-8">
          {/* Category & Status */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-28 rounded-full bg-red-dim border border-red-glow/40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Member Name */}
          <Skeleton className="h-12 sm:h-16 w-4/5" />

          {/* Role & Title */}
          <Skeleton className="h-6 w-1/2" />

          {/* Signature Quote Callout Box */}
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Biography Paragraphs */}
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Creative Highlights Grid */}
          <div className="space-y-4 pt-4 border-t border-white/[0.08]">
            <Skeleton className="h-5 w-44" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Explore More Team Members Skeleton ─── */}
      <div className="space-y-6 pt-16 border-t border-white/[0.08]">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-48" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
