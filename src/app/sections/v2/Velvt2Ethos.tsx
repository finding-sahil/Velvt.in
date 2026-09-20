const pillars = [
  {
    title: "Theatrical Lore",
    text: "Story-driven experiences where attendees step inside a living, overarching narrative.",
  },
  {
    title: "Sensory Staging",
    text: "Subterranean acoustics, custom lighting monoliths, and bespoke set design.",
  },
  {
    title: "Production Rigor",
    text: "Cryptographically verified digital gate access, trained staff, and strict safety standards.",
  },
  {
    title: "Underground Culture",
    text: "Championing dark electronic sounds, indie artists, and respectful community culture.",
  },
];

export function Velvt2Ethos() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container-velvt">
        <div className="mb-12 md:mb-16 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2 font-medium">
            Brand Ethos
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
            Why VELVT Exists
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-sans mt-3 leading-relaxed">
            We engineer theatrical nocturnal worlds that reject formulaic nightlife.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="space-y-3">
              <span className="text-red font-mono text-xs font-bold tracking-wider">
                0{idx + 1}
              </span>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
