import { Skeleton } from "@/components/ui/Skeleton";

export default function VerifyLoading() {
  return (
    <div className="py-12 md:py-20 relative min-h-[80vh] animate-fade-in">
      <div className="container-velvt space-y-12">
        {/* Header Hero Skeleton */}
        <div className="max-w-3xl space-y-5">
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-12 sm:h-16 w-3/4" />
          <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
          <Skeleton className="h-4 sm:h-5 w-full" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-10 space-y-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-full bg-primary/20 border border-primary/40" />
          </div>

          <div className="lg:col-span-5 rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-10 space-y-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
