import Link from "next/link";

interface CinematicHeroSectionProps {
  title?: string;
  tagline?: string;
  sub?: string;
  primaryCta?: string;
  primaryHref?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}

export function CinematicHeroSection({
  title = "VELVT",
  tagline = "CURSE 2.O",
  sub = "It starts as a thought. Ends as a memory.",
  primaryCta = "Enter Curse 2.O",
  primaryHref = "/events/velvt-curse-2-o",
  eventDate = "31 October",
  eventLocation = "Silchar",
}: CinematicHeroSectionProps) {
  return (
    <section className="cin-hero relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Cinematic atmospheric background — near-black with extremely subtle burgundy wisps */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[#08080a]" />
        {/* Single subtle atmospheric gradient — not red, not glow, just depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(80,15,25,0.12)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(40,10,15,0.08)_0%,transparent_70%)] blur-3xl" />
        {/* Subtle film grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 sm:px-8 flex flex-col items-center">
        {/* Brand mark */}
        <h1
          className="cin-display-title text-[var(--cin-text,#e8e4df)] mb-6 select-none"
          style={{
            fontSize: "clamp(3.5rem, 14vw, 11rem)",
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
          }}
        >
          {title.includes(".") ? (
            title
          ) : (
            <>
              <span>{title}</span>
              <span className="text-[var(--red,#a31526)]" style={{ fontSize: "0.6em" }}>.in</span>
            </>
          )}
        </h1>

        {/* Event name — large but secondary to brand */}
        <p
          className="cin-display-title text-[var(--cin-text,#e8e4df)] mb-8"
          style={{
            fontSize: "clamp(1.6rem, 5vw, 3.2rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
          }}
        >
          {tagline}
        </p>

        {/* Hook copy — restrained, muted */}
        <p className="cin-body text-[var(--cin-text-muted,#8a8680)] text-sm sm:text-base mb-6 max-w-md leading-relaxed cin-fade-in cin-delay-1">
          {sub}
        </p>

        {/* Date + Location — small, precise label */}
        <p className="cin-body text-[var(--cin-text-dim,#5c5955)] text-xs uppercase tracking-[0.2em] mb-10 cin-fade-in cin-delay-2">
          {eventDate} · {eventLocation}
        </p>

        {/* Single primary CTA — clean, no glow, no decoration */}
        <Link
          href={primaryHref}
          className="cin-cta-primary inline-flex items-center gap-2.5 px-8 py-3.5 bg-[var(--red,#a31526)] text-[var(--cin-text,#e8e4df)] text-sm font-medium tracking-wide transition-all duration-300 hover:bg-[#8a1020] cin-fade-in cin-delay-3"
          style={{ borderRadius: "2px" }}
        >
          <span>{primaryCta}</span>
          <span className="text-[var(--cin-text,#e8e4df)]/60">→</span>
        </Link>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 cin-fade-in cin-delay-4" aria-hidden="true">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>
    </section>
  );
}
