import { Skeleton } from "@/components/ui/Skeleton";

export default function VerifyLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 relative overflow-hidden animate-fade-in">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto text-center rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative z-10 space-y-6">
        <Skeleton className="h-9 sm:h-10 w-4/5 mx-auto" />
        <div className="w-12 h-0.5 bg-primary/40 rounded-full mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5 mx-auto" />
        </div>

        <div className="space-y-4 pt-2">
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full bg-primary/20 border border-primary/40" />
        </div>

        <Skeleton className="h-3 w-48 mx-auto rounded-full" />
      </div>
    </div>
  );
}
