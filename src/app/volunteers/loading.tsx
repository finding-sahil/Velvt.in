import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function VolunteersLoading() {
  return (
    <div className="py-section-sm md:py-section container-velvt animate-fade-in space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-28 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
        <div className="pt-4 flex justify-center gap-4">
          <Skeleton className="h-11 w-44" />
          <Skeleton className="h-11 w-44" />
        </div>
      </div>

      {/* Available Roles Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-36" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-6 border border-white/[0.06] bg-rich-charcoal/30 rounded-sm space-y-3"
            >
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Public Registry / Volunteer Table Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-6 w-56 rounded" />
        </div>

        {/* Volunteers Table Skeleton */}
        <div className="border border-white/[0.08] bg-rich-charcoal/20 rounded-sm overflow-hidden">
          <div className="bg-white/[0.03] py-3.5 px-6 border-b border-white/[0.06] flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={5} />
          ))}
        </div>
      </div>
    </div>
  );
}
