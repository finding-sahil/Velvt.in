import { Skeleton } from "@/components/ui/Skeleton";

export default function VolunteerCredentialLoading() {
  return (
    <div className="py-section-sm md:py-section container-narrow animate-fade-in space-y-12">
      <div className="text-center space-y-4">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-12 w-2/3 mx-auto" />
      </div>

      {/* Official Credential Card Skeleton */}
      <div className="max-w-2xl mx-auto border border-white/[0.1] bg-rich-charcoal/40 rounded-sm overflow-hidden p-8 sm:p-12 space-y-8">
        <div className="flex justify-between items-center border-b border-white/[0.08] pb-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-7 w-48" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-5 w-44" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 border border-white/[0.06] bg-black/40 rounded-sm space-y-4">
            <Skeleton className="h-36 w-36 rounded-sm" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.08] flex justify-between items-center">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
