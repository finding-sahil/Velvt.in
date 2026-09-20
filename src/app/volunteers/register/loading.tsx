import { Skeleton } from "@/components/ui/Skeleton";

export default function VolunteerRegisterLoading() {
  return (
    <div className="py-12 md:py-20 animate-fade-in relative">
      <div className="container-velvt space-y-12">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Header Skeleton */}
        <div className="max-w-3xl space-y-5">
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-12 sm:h-16 w-3/4" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Form Glassmorphic Card Skeleton */}
          <div className="lg:col-span-7 rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Phone & City */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          {/* Event & Role Selects */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Photo Upload Area */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-44" />
            <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>

          {/* Experience / Reason */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <Skeleton className="h-5 w-5 rounded mt-0.5" />
            <Skeleton className="h-4 flex-1" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-12 w-full rounded-full bg-primary/30 border border-primary/50" />
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-5 rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-10 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
