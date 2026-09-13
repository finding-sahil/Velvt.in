"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/app/actions";

interface NewsletterSectionProps {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function NewsletterSection({
  badge = "INNER CIRCLE DISPATCHES",
  title = "Never Miss a Chapter",
  subtitle = "Be the first to receive secret venue coordinates, artist drops, and priority ticket drops directly to your inbox.",
}: NewsletterSectionProps = {}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }
    if (!consent) {
      setStatus("error");
      setMessage("Please confirm your consent to receive communications.");
      return;
    }

    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("consent", consent ? "true" : "false");

      const res = await subscribeNewsletter(formData);
      if (res.success) {
        setStatus("success");
        setMessage(res.message || "You are now on the VELVT dispatch list.");
        setEmail("");
        setConsent(false);
      } else {
        setStatus("error");
        setMessage(res.error || "Failed to subscribe. Please try again.");
      }
    });
  };

  return (
    <section className="relative py-16 px-4 border-t border-white/[0.08] overflow-hidden bg-black">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-g5">
          <span className="w-1.5 h-1.5 rounded-full bg-red animate-ping" />
          <span>{badge}</span>
        </div>

        <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-wider text-white">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-g5 font-sans max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3.5 pt-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              disabled={isPending || status === "success"}
              className="flex-1 bg-white/[0.04] border border-white/10 focus:border-red rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-g5 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isPending || status === "success"}
              className="px-6 py-3 rounded-xl bg-red hover:bg-red/90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.3)] hover:shadow-[0_0_30px_rgba(200,16,46,0.5)] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Joining...</span>
                </>
              ) : status === "success" ? (
                <span>Subscribed ✓</span>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </div>

          {/* Explicit Consent Checkbox */}
          <label className="flex items-start gap-2.5 text-left text-[11px] font-mono text-g5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-0.5 rounded border-white/20 bg-white/5 text-red focus:ring-0 cursor-pointer"
            />
            <span className="leading-snug">
              I agree to receive confidential event coordinates, artist reveals, and priority access passes from VELVT. No spam, ever.
            </span>
          </label>

          {/* Feedback Messages */}
          {status === "success" && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono animate-fade-in">
              {message}
            </div>
          )}
          {status === "error" && (
            <div className="p-3 rounded-xl bg-red-dim border border-red/40 text-red text-xs font-mono animate-fade-in">
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
