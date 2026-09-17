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
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto text-center rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative z-10 space-y-6">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
          Verify Volunteer Credential
        </h1>

        <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />

        <p className="text-sm text-muted leading-relaxed">
          Enter a VELVT credential ID to instantly verify official registration and event contribution.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 pt-2"
        >
          <label htmlFor="volunteerId" className="sr-only">
            Volunteer Credential ID
          </label>
          <input
            id="volunteerId"
            name="volunteerId"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="VEL-2026-00047"
            className="w-full px-5 py-4 bg-black/60 border border-white/10 rounded-full text-white text-center font-mono tracking-widest text-lg placeholder:text-muted/30 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(200,16,46,0.35)] transition-all"
            aria-label="Volunteer ID"
          />
          <Button type="submit" variant="primary" size="lg" disabled={!id.trim()}>
            Verify Credential
          </Button>
        </form>

        <p className="text-[11px] text-muted/50 font-mono tracking-wider">
          Standard Format: VEL-YYYY-NNNNN
        </p>

        {/* Quick Verification Hub Navigation */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-muted/70">
          <Link href="/volunteers" className="hover:text-primary transition-colors min-h-[36px] flex items-center">
            Volunteer Hub →
          </Link>
          <Link href="/tickets" className="hover:text-primary transition-colors min-h-[36px] flex items-center">
            Event Passes →
          </Link>
        </div>
      </div>
    </div>
  );
}
