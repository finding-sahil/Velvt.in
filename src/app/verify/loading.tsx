import { Skeleton } from "@/components/ui/Skeleton";

export default function VerifyLoading() {
  return (
    <div className="py-section-sm md:py-section container-narrow animate-fade-in space-y-12">
      <div className="text-center space-y-4">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      <div className="max-w-xl mx-auto border border-white/[0.08] bg-rich-charcoal/30 p-8 sm:p-12 rounded-sm space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-full rounded-sm" />
        <Skeleton className="h-12 w-full rounded-sm" />
      </div>
    </div>
  );
}
