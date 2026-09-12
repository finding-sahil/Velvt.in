"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { getAdminPrefix } from "@/lib/admin-path";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);

    if (result.success) {
      if (result.role === "gateman") {
        router.push(`${getAdminPrefix()}/gate`);
      } else {
        router.push(getAdminPrefix());
      }
      router.refresh();
    } else {
      setError(result.error || "Authentication failed. Please verify your credentials.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-10 rounded-[20px] space-y-8 relative z-10 shadow-[0_0_40px_rgba(200,16,46,0.25)]">
        <div className="text-center space-y-3">
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white">
            Secure Access
          </h1>

          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />

          <p className="text-xs text-muted leading-relaxed">
            Authorized personnel only. Enter your credentials to continue.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-red-glow bg-red-dim text-xs text-white font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-mono uppercase tracking-wider text-muted"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-5 py-3.5 bg-black/70 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-mono uppercase tracking-wider text-muted"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full px-5 py-3.5 bg-black/70 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_14px_rgba(200,16,46,0.35)] transition-all font-mono"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              loading={loading}
              size="lg"
              variant="primary"
              className="w-full font-mono tracking-wider text-xs uppercase"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>

          <div className="text-center pt-2">
            <a
              href="/"
              className="text-[11px] font-mono text-muted hover:text-white transition-colors"
            >
              ← Return to public site
            </a>
          </div>
        </form>

        <p className="text-[10px] text-center font-mono text-muted/40 uppercase tracking-widest pt-4 border-t border-white/[0.06]">
          VELVT Secure Portal
        </p>
      </div>
    </div>
  );
}
