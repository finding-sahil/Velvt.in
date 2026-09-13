import { Skeleton } from "@/components/ui/Skeleton";

export default function VolunteerCredentialLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 relative overflow-hidden animate-fade-in">
      {/* Background ambient red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10 space-y-6">
        {/* Verification Pass Card Skeleton */}
        <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-10 shadow-[0_0_50px_rgba(200,16,46,0.25)] relative overflow-hidden space-y-6">
          {/* Top Neon Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Header Strip */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <Skeleton className="h-6 w-36 rounded-full bg-red/20 border border-red/40" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Avatar Squircle */}
          <div className="flex justify-center">
            <Skeleton className="w-24 h-24 rounded-2xl border-2 border-primary/40" />
          </div>

          {/* Credential Fields */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-48" />
            </div>

            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>

            <div className="space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-56" />
            </div>

            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-36" />
            </div>
          </div>

          {/* QR Code Container Skeleton */}
          <div className="pt-4 border-t border-white/10 flex flex-col items-center space-y-3">
            <Skeleton className="w-36 h-36 rounded-xl" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
