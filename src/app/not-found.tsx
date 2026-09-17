import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden py-24 px-6">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-8 animate-fade-in">

        {/* Large Decorative 404 */}
        <div className="relative">
          <span
            aria-hidden="true"
            className="font-display font-black text-8xl sm:text-9xl tracking-tight text-white/5 select-none absolute inset-0 flex items-center justify-center -translate-y-2 uppercase pointer-events-none"
          >
            404
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white relative z-10 tracking-tight uppercase">
            Lost in the Shadows.
          </h1>
        </div>

        {/* Glowing Red Rule */}
        <div className="w-14 h-0.5 bg-primary shadow-[0_0_14px_#c8102e] mx-auto" />

        <p className="text-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          The experience or document you are seeking has either moved, concluded, or does not exist within the VELVT archive.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button href="/" variant="primary" size="lg">
            Return to Main Stage
          </Button>
          <Button href="/events" variant="secondary" size="lg">
            Explore Events
          </Button>
        </div>

        {/* Quick links */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-6 text-xs text-muted font-mono uppercase tracking-wider">
          <Link href="/tickets" className="hover:text-primary transition-colors">
            Tickets &amp; Passes
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/volunteers" className="hover:text-primary transition-colors">
            Volunteer Directory
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
