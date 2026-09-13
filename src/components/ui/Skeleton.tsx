import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text" | "card";
}

export function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/[0.05] border border-white/10 backdrop-blur-[14px]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded-full",
        variant === "rectangular" && "rounded-xl",
        variant === "card" && "rounded-[20px] border-white/10 bg-white/[0.05]",
        className
      )}
      {...props}
    />
  );
}

export function EventCardSkeleton({ variant = "default" }: { variant?: "default" | "featured" }) {
  if (variant === "featured") {
    return (
      <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-[14px] overflow-hidden grid lg:grid-cols-12 items-stretch shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Left Column: Image Banner */}
        <div className="lg:col-span-5 xl:col-span-5 aspect-[16/10] lg:aspect-auto min-h-[260px] sm:min-h-[320px] relative">
          <Skeleton className="w-full h-full rounded-none" />
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-7 xl:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-6 w-28 rounded-full bg-red/10 border border-red/30" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
            <Skeleton className="h-10 sm:h-12 w-4/5" />
            <div className="w-16 h-0.5 bg-primary/40 rounded-full" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Skeleton className="h-11 w-40 rounded-full bg-primary/20 border border-primary/40" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl md:rounded-[20px] border border-white/10 bg-white/[0.04] backdrop-blur-[14px] overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <div>
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-7 w-4/5" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      </div>
      <div className="p-6 pt-0 border-t border-white/[0.08] mt-2 flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0a0a0d] border border-white/[0.08] flex flex-col justify-between p-5 min-h-[440px] sm:min-h-[460px] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      <div>
        {/* Portrait Image Skeleton */}
        <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4 bg-black/40">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute top-3 left-3">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Member Info */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3.5 w-full pt-1" />
        </div>
      </div>

      {/* Socials & Dossier Button */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3 mt-4">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-white/[0.08]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-1/4" : "flex-1")}
        />
      ))}
    </div>
  );
}


