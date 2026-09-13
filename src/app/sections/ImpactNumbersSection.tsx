interface ImpactNumbersSectionProps {
  title?: string;
  subtitle?: string;
  eventsCount?: string;
  volunteersCount?: string;
  artistsCount?: string;
  reachCount?: string;
}

export function ImpactNumbersSection({
  title = "Impact & Numbers.",
  subtitle = "Real, verifiable metrics from our flagship productions and underground community in Silchar.",
  eventsCount = "2+",
  volunteersCount = "50+",
  artistsCount = "15+",
  reachCount = "1,500+",
}: ImpactNumbersSectionProps) {
  const stats = [
    {
      metric: eventsCount,
      label: "Events Hosted",
      detail: "Flagship productions & curated underground experiences",
      accent: "from-red/30 to-transparent",
    },
    {
      metric: volunteersCount,
      label: "Volunteers & Crew",
      detail: "Verified production staff with official credentials",
      accent: "from-white/10 to-transparent",
    },
    {
      metric: artistsCount,
      label: "Artists & Creators",
      detail: "Musicians, electronic DJs, and stage sculptors",
      accent: "from-red/20 to-transparent",
    },
    {
      metric: reachCount,
      label: "Community Reach",
      detail: "Attendees engaged across Assam & Northeast India",
      accent: "from-white/10 to-transparent",
    },
  ];

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <div className="container-velvt space-y-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            <span>Verifiable Scale</span>
          </div>
          <h2 className="section-title">
            {title}
          </h2>
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] my-3" />
          <p className="text-sm sm:text-base text-g5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 backdrop-blur-md hover:border-red/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.2)] transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight group-hover:text-red transition-colors inline-block drop-shadow-[0_0_15px_rgba(200,16,46,0.3)]">
                  {stat.metric}
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg uppercase tracking-wider text-white">
                  {stat.label}
                </h3>
              </div>
              <p className="text-xs text-g5 leading-relaxed pt-3 border-t border-white/[0.08] mt-4">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
