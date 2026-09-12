import { Button } from "@/components/ui/Button";

const crewRoles = [
  { title: "Stage & Lighting", icon: "⚡" },
  { title: "Artist Hospitality", icon: "🍸" },
  { title: "Gate & Access Control", icon: "🎟️" },
  { title: "Crowd Experience", icon: "🔥" },
  { title: "Sound & Audio Ops", icon: "🔊" },
  { title: "Photography & Media", icon: "📸" },
];

export function VolunteerPreviewSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Ambient Red Glow Halo */}
      <div className="absolute top-1/2 -left-24 w-[420px] h-[420px] rounded-full bg-red filter blur-[140px] opacity-[0.14] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[340px] h-[340px] rounded-full bg-red filter blur-[120px] opacity-[0.08] pointer-events-none" />

      <div className="container-velvt relative space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-red uppercase font-semibold">
            Join The Movement
          </span>
          <h2 className="section-title">
            Volunteer &amp; Production Crew
          </h2>
          <div className="red-rule center" />
          <p className="section-intro text-g5 max-w-lg mx-auto">
            The heart and pulse of every VELVT experience. Official digital credentials,
            hands-on event production experience, and access to the underground creative network.
          </p>
        </div>

        {/* Dynamic Crew Roles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {crewRoles.map((role) => (
            <div
              key={role.title}
              className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-red/40 hover:bg-red/[0.04] transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {role.icon}
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-g6 group-hover:text-white">
                {role.title}
              </span>
            </div>
          ))}
        </div>

        {/* Verification Preview Showcase */}
        <div className="max-w-xl mx-auto rounded-3xl border border-white/15 bg-black/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.7)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red/10 rounded-full filter blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                VERIFIED OFFICIAL CREDENTIAL
              </span>
              <h3 className="font-display font-black text-2xl text-white tracking-wide uppercase pt-1">
                VELVT Production Crew
              </h3>
            </div>
            <span className="text-xs font-mono tracking-widest text-g5 bg-white/[0.05] px-3 py-1 rounded-full border border-white/10">
              SILCHAR, IN
            </span>
          </div>

          <div className="py-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-g5 block text-[10px] uppercase">Credential ID</span>
              <span className="text-white font-bold tracking-wider">VEL-2026-00042</span>
            </div>
            <div>
              <span className="text-g5 block text-[10px] uppercase">Department</span>
              <span className="text-red font-bold">Stage Production</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-g5 block text-[10px] uppercase">Authenticity</span>
              <span className="text-emerald-400">Cryptographically Sealed</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <Button href="/volunteers" variant="primary" size="md" className="flex-1 sm:flex-none uppercase tracking-wider font-bold">
              Join As Volunteer &rarr;
            </Button>
            <Button href="/verify" variant="outline" size="md" className="flex-1 sm:flex-none uppercase tracking-wider">
              Verify Credential
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
