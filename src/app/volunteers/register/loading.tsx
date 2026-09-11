import { Skeleton } from "@/components/ui/Skeleton";

export default function VolunteerRegisterLoading() {
  return (
    <div className="py-section-sm md:py-section container-narrow animate-fade-in space-y-12">
      <div className="text-center space-y-4">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>

      {/* Form Skeleton */}
      <div className="border border-white/[0.08] bg-rich-charcoal/30 p-8 sm:p-12 rounded-sm space-y-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-28 w-full rounded-sm" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-72" />
        </div>

        <Skeleton className="h-12 w-full rounded-sm" />
      </div>
    </div>
  );
}
