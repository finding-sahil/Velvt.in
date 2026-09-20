import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms & Conditions for VELVT.in — official rules governing event attendance, ticketing, gate admittance, venue safety, and digital media usage.",
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "September 20, 2026";

  return (
    <div className="relative min-h-screen pt-28 pb-20 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[160px] pointer-events-none" />

      <div className="container-velvt max-w-4xl relative z-10 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono tracking-widest text-primary uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Admittance & Ticketing Rules
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">
            Terms & <span className="text-primary">Conditions</span>
          </h1>
          <p className="text-xs font-mono text-g5 uppercase tracking-wider">
            Last Updated: {lastUpdated} · Official Code of Conduct & Rules for VELVT.in
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none space-y-8 text-sm sm:text-base text-g6 leading-relaxed font-sans">
          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> Agreement to Terms
            </h2>
            <p>
              By accessing the website <strong className="text-white">velvt.in</strong>, purchasing passes, registering as crew/volunteers, or entering any VELVT venue or experience, you explicitly agree to adhere to these Terms &amp; Conditions and all safety guidelines issued by event management.
            </p>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> Ticketing & Cryptographic Gate Admittance
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-g5">
              <li>
                <strong className="text-white">Single-Use Passes:</strong> Every issued pass contains a high-entropy cryptographic QR token. Once scanned and verified at the venue gate, the pass is instantly invalidated. Attempting to scan a duplicated pass will result in immediate admittance denial.
              </li>
              <li>
                <strong className="text-white">Non-Refundable:</strong> Passes for VELVT flagship productions (including VELVT CURSE 2.O) are strictly non-refundable and non-exchangeable, except in the event of total cancellation by the organizers.
              </li>
              <li>
                <strong className="text-white">Identification:</strong> All attendees must carry a valid government-issued photographic ID matching the name on their issued pass when presenting tickets at the gate.
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> Age Restrictions & Venue Code of Conduct
            </h2>
            <p>
              VELVT productions are curated sensory and nightlife experiences. Age restrictions (typically 18+ or 21+) are strictly enforced per event specifications. Organizers and venue security reserve the right of admission. Any guest exhibiting disruptive, abusive, or dangerous behavior will be escorted off the premises immediately without refund.
            </p>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Photography, Media & Recording Rights
            </h2>
            <p>
              By entering a VELVT event, you acknowledge and consent that official media crews may capture atmospheric photography, cinematic video footage, and audio recordings of attendees. VELVT retains the irrevocable right to feature these materials across official marketing, archival galleries, and press publications.
            </p>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">05.</span> Volunteer & Crew Protocol
            </h2>
            <p>
              Approved volunteers receive official digital credentials and physical passes. Volunteers act as brand ambassadors and must maintain professionalism and sobriety throughout their assigned operational shifts. VELVT reserves the right to revoke volunteer badges for non-compliance with safety or conduct protocols.
            </p>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">06.</span> Limitation of Liability
            </h2>
            <p>
              VELVT and its organizers, partners, and affiliates assume no liability for personal injury, illness, loss, or theft of personal belongings occurring inside or in the vicinity of event venues. Attendees assume all inherent risks associated with live entertainment, strobes, intense audio systems, and crowded nightlife settings.
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="pt-8 border-t border-white/10 flex justify-between items-center">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-widest text-g5 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Return to Homepage
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-mono uppercase tracking-widest text-primary hover:text-white transition-colors"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
