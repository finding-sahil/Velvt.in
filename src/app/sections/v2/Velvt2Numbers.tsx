interface Velvt2NumbersProps {
  eventsCount?: string;
  volunteersCount?: string;
  artistsCount?: string;
  reachCount?: string;
}

export function Velvt2Numbers({
  eventsCount = "2+",
  volunteersCount = "50+",
  artistsCount = "15+",
  reachCount = "1,500+",
}: Velvt2NumbersProps) {
  const stats = [
    { metric: eventsCount, label: "Flagship Productions" },
    { metric: volunteersCount, label: "Production Crew" },
    { metric: artistsCount, label: "Featured Artists" },
    { metric: reachCount, label: "Community Reach" },
  ];

  return (
    <section className="py-20 md:py-24 relative border-t border-white/[0.06]">
      <div className="container-velvt">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <span className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight block">
                {stat.metric}
              </span>
              <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-neutral-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
