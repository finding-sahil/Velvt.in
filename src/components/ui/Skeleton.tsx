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

export function EventCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.05] backdrop-blur-[14px] overflow-hidden flex flex-col">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.05] backdrop-blur-[14px] overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="p-5 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
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

