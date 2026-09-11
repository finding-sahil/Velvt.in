import { Skeleton } from "@/components/ui/Skeleton";

export default function ContactLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvet animate-fade-in space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-28 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      <div className="grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
        {/* Form Skeleton */}
        <div className="lg:col-span-2 border border-white/[0.08] bg-rich-charcoal/30 p-8 rounded-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-sm" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full rounded-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-32 w-full rounded-sm" />
          </div>
          <Skeleton className="h-12 w-full rounded-sm" />
        </div>

        {/* Sidebar Info Skeleton */}
        <div className="border border-white/[0.08] bg-rich-charcoal/20 p-8 rounded-sm space-y-8">
          <Skeleton className="h-6 w-36" />
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-44" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
