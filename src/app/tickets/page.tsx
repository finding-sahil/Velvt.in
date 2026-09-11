import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tickets — Coming Soon | VELVT",
  description:
    "Ticket sales for the next VELVT experience are opening soon. Be the first to know.",
};

export default function TicketsPage() {
  return (
    <main className="py-12 md:py-20 relative min-h-[70vh] flex flex-col items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="container-velvt space-y-12 text-center relative z-10">
        <SectionHeading
          title="Tickets & Passes."
          subtitle="Direct entry and passes for upcoming VELVT events and experiences."
        />

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto border border-white/10 bg-white/[0.04] backdrop-blur-[20px] rounded-[24px] p-10 sm:p-14 space-y-8 shadow-[0_0_60px_rgba(200,16,46,0.15)]">
          {/* Animated pulse indicator */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-red-dim border border-red-glow flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight">
              Coming Soon
            </h2>

            <div className="w-16 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />

            <p className="text-sm sm:text-base text-muted max-w-md mx-auto leading-relaxed">
              Ticket sales for the next VELVT experience are being prepared.
              Follow our Instagram for early access announcements and exclusive pre-sale codes.
            </p>
          </div>

          {/* Feature Preview Chips */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {["Early Bird Pricing", "VIP Passes", "Group Discounts", "Secure Payment"].map(
              (feature) => (
                <span
                  key={feature}
                  className="text-[10px] font-mono uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-g5"
                >
                  {feature}
                </span>
              )
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://www.instagram.com/velvt.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-dim border border-red-glow text-xs font-mono uppercase tracking-widest text-white hover:bg-primary hover:border-primary transition-all duration-300"
            >
              <span>📷</span>
              <span>Follow for Updates</span>
            </a>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 bg-white/[0.04] text-xs font-mono uppercase tracking-widest text-g5 hover:text-white hover:border-white/30 transition-all duration-300"
            >
              View Events &rarr;
            </Link>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-[11px] font-mono text-g5/60 uppercase tracking-widest">
          Powered by VELVT • Silchar, Assam, India&apos;s Premier Experiential Events
        </p>
      </div>
    </main>
  );
}
