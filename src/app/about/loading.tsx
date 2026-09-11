import { Skeleton } from "@/components/ui/Skeleton";

export default function AboutLoading() {
  return (
    <div className="py-section-sm md:py-section container-narrow animate-fade-in space-y-20">
      <div className="text-center space-y-4">
        <Skeleton className="h-4 w-28 mx-auto" />
        <Skeleton className="h-14 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-sm" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-8">
        <div className="border border-white/[0.08] bg-rich-charcoal/30 p-8 rounded-sm space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="border border-white/[0.08] bg-rich-charcoal/30 p-8 rounded-sm space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
