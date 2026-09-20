interface ExperiencePillar {
  index: string;
  tag: string;
  title: string;
  description: string;
}

const defaultPillars: ExperiencePillar[] = [
  {
    index: "01",
    tag: "Atmosphere",
    title: "The Cursed Chamber",
    description: "Sub-zero fog, lighting monoliths, and surreal gothic staging.",
  },
  {
    index: "02",
    tag: "Dress Code",
    title: "Gothic Masquerade",
    description: "Dark tailoring, crushed velvet, and Venetian masquerade masks.",
  },
  {
    index: "03",
    tag: "Acoustics",
    title: "Subterranean Sound",
    description: "Heavy electronic frequencies engineered for physical sensation.",
  },
  {
    index: "04",
    tag: "Refinement",
    title: "Thematic Mixology",
    description: "Botanical infusions and curated sensory refreshments.",
  },
];

interface Velvt2ExperienceProps {
  title?: string;
  subtitle?: string;
}

export function Velvt2Experience({
  title = "The Experience",
  subtitle = "Sensory staging, thematic immersion, and curated sound.",
}: Velvt2ExperienceProps) {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container-velvt">
        {/* Section Header */}
        <div className="mb-12 md:mb-16 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2 font-medium">
            Sensory Architecture
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-sans mt-3 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 4 Clean Minimal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {defaultPillars.map((pillar) => (
            <div
              key={pillar.index}
              className="p-6 sm:p-8 rounded-lg bg-[#0e0e0e] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-red font-bold tracking-wider">{pillar.index}</span>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg sm:text-xl text-white uppercase tracking-wide">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
