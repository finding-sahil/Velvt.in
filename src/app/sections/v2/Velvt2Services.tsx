const services = [
  {
    title: "Event Planning",
    description: "End-to-end planning, stage logistics, and crowd orchestration.",
    icon: "✦",
  },
  {
    title: "Experience Design",
    description: "Thematic environments, lighting architecture, and spatial art.",
    icon: "◈",
  },
  {
    title: "Community Gatherings",
    description: "Curated underground nightlife, cultural showcases, and meetups.",
    icon: "◇",
  },
  {
    title: "Creative Production",
    description: "Stage art direction, visual identity, and theatrical concepts.",
    icon: "⬡",
  },
  {
    title: "Crew Coordination",
    description: "Verified credential registry, specialized roles, and crowd safety.",
    icon: "◎",
  },
  {
    title: "Brand Collaborations",
    description: "Curated partner integrations and experiential activations.",
    icon: "⊕",
  },
];

interface Velvt2ServicesProps {
  title?: string;
  subtitle?: string;
}

export function Velvt2Services({
  title = "What We Do",
  subtitle = "The planning, design, and production craft behind every VELVT experience.",
}: Velvt2ServicesProps) {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container-velvt">
        <div className="mb-12 md:mb-16 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2 font-medium">
            Capabilities
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-sans mt-3 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="p-6 rounded-lg bg-[#0e0e0e] border border-white/[0.08] hover:border-white/20 transition-all duration-300 space-y-3"
            >
              <span className="text-red font-mono text-sm block">
                {service.icon}
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wide">
                {service.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
