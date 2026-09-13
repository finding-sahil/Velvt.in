interface WhyVelvtSectionProps {
  title?: string;
  subtitle?: string;
}

export function WhyVelvtSection({
  title = "Why VELVT Exists.",
  subtitle = "We reject formulaic nightlife. VELVT was founded to establish theatrical sensory experiences, uncompromising production standards, and an authentic nocturnal community.",
}: WhyVelvtSectionProps) {
  const pillars = [
    {
      number: "01",
      title: "Sensory Architecture",
      badge: "Production Craft",
      description:
        "Every event is designed as a living sculpture. From synchronized soundscapes and bespoke lighting rigs to spatial set design, every sensory touchpoint is intentional.",
    },
    {
      number: "02",
      title: "Theatrical Narrative",
      badge: "Thematic Immersion",
      description:
        "We craft lore-driven nocturnal worlds — from the dark elegance of VELVT CURSE to gothic subterranean installations. Guests don't just attend; they step into the story.",
    },
    {
      number: "03",
      title: "Verified Crew Ecosystem",
      badge: "Operational Rigor",
      description:
        "The first independent event studio in Northeast India with cryptographically signed digital IDs and real-time gate scanners, empowering local youth with professional production experience.",
    },
    {
      number: "04",
      title: "Community Over Commercialism",
      badge: "Authentic Ethos",
      description:
        "We build genuine creative spaces that celebrate underground music, indie creators, and respectful nightlife culture. It starts as a thought, ends as an indelible memory.",
    },
  ];

  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red/10 blur-[130px] pointer-events-none" />

      <div className="container-velvt space-y-12 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            <span>Mission &amp; Differentiators</span>
          </div>
          <h2 className="section-title">
            {title}
          </h2>
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] my-3" />
          <p className="text-sm sm:text-base text-g5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="p-6 sm:p-7 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md hover:border-red/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.15)] transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-red font-black text-sm tracking-wider">{pillar.number}</span>
                  <span className="text-[10px] uppercase tracking-wider text-g5 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/10">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-red transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-g5 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center gap-1.5 text-[11px] font-mono text-g5">
                <span className="text-red">✦</span>
                <span className="tracking-widest uppercase">The VELVT Standard</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
