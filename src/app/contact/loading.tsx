import { Skeleton } from "@/components/ui/Skeleton";

export default function ContactLoading() {
  return (
    <div className="py-12 md:py-20 relative animate-fade-in">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column: Title & Form Skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-12 sm:h-16 w-3/4 max-w-md" />
              <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
              <Skeleton className="h-4 sm:h-5 w-full max-w-lg" />
            </div>

            <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-10 space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              {/* Name */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>

              {/* Submit Button */}
              <Skeleton className="h-12 w-full rounded-full bg-primary/20 border border-primary/40" />
            </div>
          </div>

          {/* Right Column: Contact Information Skeleton */}
          <div className="lg:pt-16 space-y-8">
            <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-10 space-y-8 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-3.5 w-56" />
                <div className="pt-2">
                  <Skeleton className="h-6 w-44 rounded-full" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-6 w-48" />
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-40" />
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
