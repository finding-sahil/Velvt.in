import { Skeleton } from "@/components/ui/Skeleton";

export default function GalleryLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvt animate-fade-in space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm border border-white/[0.08] bg-rich-charcoal/30 aspect-[4/5] overflow-hidden flex flex-col justify-end p-6 space-y-3"
          >
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
