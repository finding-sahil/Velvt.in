import { Button } from "@/components/ui/Button";

export function VolunteerPreviewSection() {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      {/* Ambient Red Blob */}
      <div className="absolute top-1/2 -left-24 w-[380px] h-[380px] rounded-full bg-red filter blur-[120px] opacity-[0.12] pointer-events-none" />

      <div className="container-narrow relative text-center flex flex-col items-center space-y-6">
        <h2 className="section-title">
          Volunteer &amp; Production Crew.
        </h2>

        <div className="red-rule center" />

        <p className="section-intro max-w-md mx-auto text-g5">
          Official digital credentials issued to verified contributors and crew members across our live productions.
        </p>

        {/* Verification Preview Card */}
        <div className="glass-card max-w-xs w-full p-5 text-left space-y-2.5 relative group">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified
            </span>
            <span className="text-g5">KOLKATA</span>
          </div>

          <div>
            <span className="text-[9px] font-mono text-g5 uppercase block">Credential ID</span>
            <p className="font-display font-black text-xl tracking-wider text-white">
              VLV-2026-001
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button href="/verify" variant="primary" size="md">
            Verify A Contributor &rarr;
          </Button>
          <Button href="/volunteers" variant="secondary" size="md">
            Volunteer Registry
          </Button>
        </div>
      </div>
    </section>
  );
}
