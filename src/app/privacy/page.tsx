import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for VELVT.in — details on how we collect, handle, and protect your data across our events, ticketing, and volunteer programs.",
};

export default function PrivacyPolicyPage() {
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
            Legal & Governance
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-xs font-mono text-g5 uppercase tracking-wider">
            Last Updated: {lastUpdated} · Official Operating Policy for VELVT.in
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none space-y-8 text-sm sm:text-base text-g6 leading-relaxed font-sans">
          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> Introduction & Scope
            </h2>
            <p>
              VELVT (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy and personal data of our guests, attendees, volunteers, sponsors, and website visitors. This Privacy Policy outlines how your information is gathered, utilized, stored, and safeguarded when navigating <strong className="text-white">velvt.in</strong> or interacting with our offline event infrastructure in Silchar, Assam, and across India.
            </p>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> Information We Collect
            </h2>
            <p>We may collect personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2 text-g5">
              <li>
                <strong className="text-white">Ticketing & Gate Admittance:</strong> Attendee full name, email address, contact telephone number, payment verification receipts, and digital cryptographic QR check-in records.
              </li>
              <li>
                <strong className="text-white">Volunteer & Crew Applications:</strong> Legal name, contact details, identity verification photography for security passes, emergency contacts, and background qualifications.
              </li>
              <li>
                <strong className="text-white">Partnership & Inquiries:</strong> Brand representatives, company details, sponsorship preferences, and direct correspondence messages.
              </li>
              <li>
                <strong className="text-white">Technical Diagnostics:</strong> IP address, browser user-agent, device characteristics, and edge diagnostic metrics collected via Cloudflare and Vercel.
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> Purpose & Legal Basis for Processing
            </h2>
            <p>Your data is processed strictly for legitimate operational purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-g5">
              <li>Issuing non-transferable verified digital gate passes and preventing counterfeit entry fraud.</li>
              <li>Organizing volunteer shifts, crew safety, and emergency medical preparedness during high-capacity events.</li>
              <li>Responding to brand sponsorship inquiries and operational communications.</li>
              <li>Complying with municipal safety regulations and security audit protocols.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> Data Security & Storage Architecture
            </h2>
            <p>
              Your sensitive records are stored securely in PostgreSQL databases hosted by Supabase with Row Level Security (RLS) and encrypted at rest using AES-256. Public-facing web ingress is protected by Cloudflare Edge Web Application Firewalls (WAF) and SSL/TLS 1.3 encryption. We never sell, rent, or monetize your personal information to third-party marketing brokers.
            </p>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">05.</span> Cookies & Edge Telemetry
            </h2>
            <p>
              VELVT utilizes strictly necessary session cookies for administrative access and minimal, anonymized telemetry (via Vercel Web Analytics and Google Analytics) to monitor server response times and Core Web Vitals. You can modify your browser settings to reject non-essential cookies at any time.
            </p>
          </section>

          <section className="space-y-3 bg-white/[0.02] p-6 sm:p-8 rounded-2xl border border-white/[0.06]">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">06.</span> Your Rights & Inquiries
            </h2>
            <p>
              Under applicable Indian privacy and digital data protection laws, you retain the right to request access to your stored records, rectify inaccuracies, or request permanent deletion of your data once event verification obligations have concluded.
            </p>
            <p className="pt-2">
              For privacy-related inquiries, contact our data protection team directly at{" "}
              <a
                href="mailto:contact@velvt.in"
                className="text-primary hover:underline font-mono"
              >
                contact@velvt.in
              </a>{" "}
              or message us via our official WhatsApp operations group.
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
            href="/terms"
            className="text-xs font-mono uppercase tracking-widest text-primary hover:text-white transition-colors"
          >
            Terms & Conditions →
          </Link>
        </div>
      </div>
    </div>
  );
}
