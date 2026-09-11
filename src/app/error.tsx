"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Runtime application error:", error);
  }, [error]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-24 px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-glow bg-red-dim backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-white font-medium">
            System Notice • Unexpected Disruption
          </span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white">
          A Momentary Interruption
        </h1>

        <div className="w-14 h-0.5 bg-primary shadow-[0_0_14px_#c8102e] mx-auto" />

        <p className="text-muted text-sm sm:text-base leading-relaxed">
          We encountered an unexpected issue while rendering this experience. Our engineers have been alerted.
        </p>

        {error.digest && (
          <p className="text-[11px] font-mono text-muted/80 bg-white/[0.05] py-2 px-4 rounded-full inline-block border border-white/10">
            Incident Ref: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button onClick={() => reset()} variant="primary">
            Try Again
          </Button>
          <Button href="/" variant="secondary">
            Return to Homepage
          </Button>
        </div>
      </div>
    </main>
  );
}
