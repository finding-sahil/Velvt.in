interface BrandIntroSectionProps {
  title?: string;
  headline?: string;
  body?: string;
  badge?: string;
}

export function BrandIntroSection({
  title = "Sensory Architecture.",
  headline = "We don't just organize events — we construct immersive nocturnal worlds.",
  body = "From subterranean set design to synchronized lighting and acoustics, VELVT crafts experiences that linger long after the night ends.",
  badge = "Thematic Event Production • Kolkata",
}: BrandIntroSectionProps) {
  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="container-narrow text-center flex flex-col items-center">
        <h2 className="section-title mb-2">
          {title}
        </h2>

        <div className="red-rule center" />

        <div className="glass-card p-6 sm:p-8 text-center max-w-xl mt-6 space-y-3">
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
            {headline}
          </p>
          <p className="text-xs sm:text-sm text-g5 leading-relaxed">
            {body}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-red">
            <span>✦</span>
            <span className="tracking-widest uppercase">{badge}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
