"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("velvt_cookie_consent");
      if (!consent) {
        // Small 1-second delay so it doesn't affect initial FCP or LCP
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback for private browsing mode
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("velvt_cookie_consent", "accepted");
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("velvt_cookie_consent", "essential_only");
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in"
    >
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl shadow-black/80 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🍪</span>
            <p className="text-xs font-display font-bold uppercase tracking-wider text-white">
              Data &amp; Cookie Consent
            </p>
          </div>
          <button
            onClick={handleDecline}
            className="text-g5 hover:text-white text-xs transition-colors p-1"
            aria-label="Close cookie banner"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-g6 leading-relaxed">
          VELVT uses essential cookies to ensure secure ticketing, anti-fraud gate verification, and privacy-preserving analytics. Read our{" "}
          <Link
            href="/privacy"
            className="text-primary underline decoration-primary/40 hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
          >
            Accept All
          </button>
          <button
            onClick={handleDecline}
            className="py-2 px-3 text-xs font-mono uppercase tracking-wider text-g5 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all active:scale-[0.98]"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
