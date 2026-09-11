import { Skeleton } from "@/components/ui/Skeleton";

export default function PressLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvt animate-fade-in space-y-20">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      <div className="border border-white/[0.08] bg-rich-charcoal/30 p-8 sm:p-12 rounded-sm space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-11 w-44" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-6 w-44" />
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-white/[0.08] bg-rich-charcoal/30 p-8 rounded-sm space-y-4"
            >
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-24 pt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
