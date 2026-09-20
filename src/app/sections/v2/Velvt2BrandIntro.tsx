interface Velvt2BrandIntroProps {
  title?: string;
  headline?: string;
  body?: string;
  badge?: string;
}

export function Velvt2BrandIntro({
  title = "Sensory Architecture",
  headline = "We don't just organize events — we construct immersive nocturnal worlds.",
  body = "From subterranean set design to synchronized lighting and acoustics, VELVT crafts experiences that linger long after the night ends.",
  badge = "Thematic Event Production • Silchar, Assam",
}: Velvt2BrandIntroProps) {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container-narrow text-center flex flex-col items-center space-y-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-medium">
          {badge}
        </p>

        <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
          {title}
        </h2>

        <p className="text-lg sm:text-xl md:text-2xl text-white font-medium max-w-xl leading-relaxed">
          {headline}
        </p>

        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-lg leading-relaxed">
          {body}
        </p>
      </div>
    </section>
  );
}
