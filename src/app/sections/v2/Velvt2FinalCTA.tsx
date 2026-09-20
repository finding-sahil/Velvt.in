import Link from "next/link";

interface Velvt2FinalCTAProps {
  title?: string;
  buttonText?: string;
}

export function Velvt2FinalCTA({
  title = "The Night Awaits.",
  buttonText = "Collaborate With Us",
}: Velvt2FinalCTAProps) {
  return (
    <section className="py-24 md:py-36 relative border-t border-white/[0.06] text-center px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-neutral-400 font-sans max-w-md mx-auto leading-relaxed">
          Open for collaborations, venue takeovers, and brand partnerships in Silchar, Assam.
        </p>

        <div className="pt-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-red text-white text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-300 hover:bg-[#a31526] hover:shadow-[0_8px_24px_rgba(200,16,46,0.35)] min-h-[48px]"
          >
            <span>{buttonText}</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
