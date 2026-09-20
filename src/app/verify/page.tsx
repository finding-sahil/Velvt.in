"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function VerifySearchPage() {
  const [id, setId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = id.trim().toUpperCase();
    if (trimmed) {
      router.push(`/verify/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="py-12 md:py-20 relative min-h-[80vh]">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-12 relative z-10">
        {/* Header Hero */}
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-dim border border-red/30 text-[11px] font-mono uppercase tracking-widest text-red">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            <span>Accreditation Verification</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase text-white tracking-tight leading-[0.95]">
            Verify Credentials.
          </h1>

          <div className="w-16 h-0.5 bg-primary shadow-[0_0_14px_#c8102e]" />

          <p className="text-sm sm:text-base md:text-lg text-g5 leading-relaxed">
            Cryptographic validation of official VELVT crew accreditation, backstage directorships, and event contributions in Silchar.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Search Card */}
          <div className="lg:col-span-7">
            <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                  Instant Lookup
                </span>
                <h2 className="font-display font-bold text-2xl text-white uppercase tracking-tight">
                  Enter Credential ID
                </h2>
                <p className="text-xs text-g5">
                  Input the official tamper-proof ID issued to verified production staff.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="volunteerId" className="block text-xs font-mono font-medium uppercase tracking-[0.15em] text-muted mb-2">
                    Volunteer ID <span className="text-primary">*</span>
                  </label>
                  <input
                    id="volunteerId"
                    name="volunteerId"
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. VEL-2026-00047"
                    className="w-full px-5 py-4 bg-black/60 border border-white/10 rounded-xl text-white font-mono tracking-wider text-base placeholder:text-muted/30 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(200,16,46,0.35)] transition-all uppercase"
                    aria-label="Volunteer ID"
                    autoComplete="off"
                  />
                  <p className="text-[11px] text-muted/60 font-mono mt-2">
                    Format standard: <span className="text-white/80">VEL-YYYY-NNNNN</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  disabled={!id.trim()}
                >
                  Verify Credential &rarr;
                </Button>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-10 space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                  Tamper-Proof Protocol
                </span>
                <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                  Security &amp; Integrity
                </h3>
              </div>

              <div className="space-y-4 text-xs font-mono text-g5">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-white font-bold block">1. Cryptographic Record</span>
                  <span>Each issued ID maps directly to our immutable PostgreSQL database and official gate authorization registry.</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-white font-bold block">2. Public Badge Verification</span>
                  <span>Verification returns live status, assigned department specialization, event year, and verified photo ID.</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-white font-bold block">3. Revocation Protection</span>
                  <span>Suspended or archived credentials immediately flag as invalid at entry scanning stations.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-muted/80">
                <Link href="/volunteers" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>←</span>
                  <span>Volunteer Hub</span>
                </Link>
                <Link href="/tickets" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>Passes</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
