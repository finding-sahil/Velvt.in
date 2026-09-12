import Link from "next/link";
import { PageStatus, CONTROLLED_PAGES } from "@/lib/page-status";

interface PageStatusGateProps {
  pageKey: string;
  status: PageStatus;
  customTitle?: string;
  customSubtitle?: string;
  children: React.ReactNode;
}

export function PageStatusGate({
  pageKey,
  status,
  customTitle,
  customSubtitle,
  children,
}: PageStatusGateProps) {
  if (status === "active") {
    return <>{children}</>;
  }

  const config = CONTROLLED_PAGES.find((p) => p.key === pageKey);
  const isComingSoon = status === "coming_soon";

  const title =
    customTitle ||
    (isComingSoon
      ? config?.defaultTitle || "Coming Soon"
      : "Temporarily Offline");

  const subtitle =
    customSubtitle ||
    (isComingSoon
      ? config?.defaultSubtitle ||
        "We are preparing something extraordinary. Check back soon."
      : "This section is temporarily paused for scheduled maintenance and updates.");

  return (
    <main className="py-16 md:py-24 relative min-h-[75vh] flex flex-col items-center justify-center px-4">
      {/* Ambient glowing atmosphere */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto text-center relative z-10 space-y-8">
        <div className="border border-white/10 bg-white/[0.04] backdrop-blur-[20px] rounded-[24px] p-8 sm:p-14 space-y-8 shadow-[0_0_60px_rgba(200,16,46,0.15)]">
          {/* Animated Icon Indicator */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-full border flex items-center justify-center ${
                  isComingSoon
                    ? "bg-red-dim border-red-glow"
                    : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <span className="text-2xl">{isComingSoon ? "⏳" : "🔒"}</span>
              </div>
              {isComingSoon && (
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <span
              className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border inline-block ${
                isComingSoon
                  ? "border-red-glow bg-red-dim text-white"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              {isComingSoon ? "Status: Coming Soon" : "Status: Temporarily Paused"}
            </span>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              {title}
            </h1>

            <div className="w-16 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />

            <p className="text-sm sm:text-base text-muted max-w-md mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://www.instagram.com/velvt.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-dim border border-red-glow text-xs font-mono uppercase tracking-widest text-white hover:bg-primary hover:border-primary transition-all duration-300"
            >
              <span>📷</span>
              <span>Instagram Updates</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 bg-white/[0.04] text-xs font-mono uppercase tracking-widest text-g5 hover:text-white hover:border-white/30 transition-all duration-300"
            >
              ← Return Home
            </Link>
          </div>
        </div>

        <p className="text-[11px] font-mono text-g5/60 uppercase tracking-widest">
          VELVT • Silchar, Assam, India
        </p>
      </div>
    </main>
  );
}
