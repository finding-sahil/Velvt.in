import Link from "next/link";

export function Velvt2Crew() {
  return (
    <section className="py-20 md:py-28 relative border-t border-white/[0.06]">
      <div className="container-velvt">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-medium">
            Production Network
          </p>

          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
            The Production Crew
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-sans max-w-lg mx-auto leading-relaxed">
            The verified operational backbone behind staging, subterranean sound, gate access, and artist hospitality in Silchar.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/volunteers"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-red text-white text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-300 hover:bg-[#a31526] hover:shadow-[0_8px_24px_rgba(200,16,46,0.35)] min-h-[48px]"
            >
              Join The Crew →
            </Link>

            <Link
              href="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-neutral-400 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors min-h-[48px]"
            >
              Verify Credential
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
