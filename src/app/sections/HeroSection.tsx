import { Button } from "@/components/ui/Button";

interface HeroSectionProps {
  title?: string;
  tagline?: string;
  sub?: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
}

export function HeroSection({
  title = "VELVT",
  tagline = "It starts as a thought, ends as a memory.",
  sub = "Thematic nightlife, immersive staging, and sensory productions in Silchar, Assam, India.",
  primaryCta = "Explore Curse 2.O",
  primaryHref = "/events/velvt-curse-2-o",
  secondaryCta = "Book Passes",
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[78vh] flex items-center justify-center text-center pt-24 pb-14 sm:py-24 px-4 overflow-hidden">
      {/* UNTOLDSURI Atmospheric Ambient Lighting Halos */}
      <div className="absolute top-1/4 -right-24 w-[480px] h-[480px] rounded-full bg-red filter blur-[150px] opacity-[0.16] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-[380px] h-[380px] rounded-full bg-red filter blur-[140px] opacity-[0.10] pointer-events-none" />

      {/* Floating subtle ambient glow */}
      <div className="hero-bubbles overflow-hidden pointer-events-none" aria-hidden="true">
        <span className="w-56 h-56 top-[15%] left-[10%]" />
        <span className="w-72 h-72 top-[10%] right-[10%]" />
        <span className="w-44 h-44 bottom-[20%] right-[15%]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center px-2 sm:px-4">
        {/* Main Brand Title — Bold & Commanding */}
        <h1 className="hero-title text-white tracking-tighter mb-4 animate-fade-in-up drop-shadow-[0_12px_45px_rgba(0,0,0,0.9)] relative inline-block select-none">
          {title.includes(".") ? (
            title
          ) : (
            <>
              <span className="relative inline-block">
                {title}
                {/* Embedded realistic blood drip on 'V' (active in thematic themes, hidden in legacy) */}
                <span
                  className="text-blood-drips absolute -bottom-3.5 left-[10%] pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 12 24"
                    className="w-2.5 sm:w-3.5 h-5 sm:h-7 text-[#880808] fill-current filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    <path d="M6 0 C6 0 7.5 7 7.5 13 C7.5 17 8.5 19 8.5 21 C8.5 23.2 7 24 5.5 24 C4 24 2.5 23.2 2.5 21 C2.5 19 3.5 17 3.5 13 C3.5 7 5 0 6 0 Z" />
                    <circle cx="5.5" cy="21" r="1.5" fill="#b30000" opacity="0.8" />
                  </svg>
                </span>
              </span>
              <span className="relative inline-block text-red drop-shadow-[0_0_25px_rgba(200,16,46,0.9)]">
                .in
                {/* Embedded realistic blood drips hanging from .in (active in thematic themes, hidden in legacy) */}
                <span
                  className="text-blood-drips absolute -bottom-4 left-0 right-0 pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 80 28"
                    preserveAspectRatio="none"
                    className="w-full h-5 sm:h-7 text-[#880808] fill-current filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    {/* Drip under '.' */}
                    <path d="M 8 0 C 8 0 10 3 10 8 C 10 11 11 13 11 15 C 11 17 9.5 18 8 18 C 6.5 18 5 17 5 15 C 5 13 6 11 6 8 C 6 3 8 0 8 0 Z" />
                    <circle cx="8" cy="15" r="1.5" fill="#b30000" opacity="0.8" />
                    {/* Drip under 'i' */}
                    <path d="M 32 0 C 32 0 34 4 34 10 C 34 14 35 17 35 20 C 35 22.5 33.5 24 32 24 C 30.5 24 29 22.5 29 20 C 29 17 30 14 30 10 C 30 4 32 0 32 0 Z" />
                    <circle cx="32" cy="20" r="1.5" fill="#b30000" opacity="0.8" />
                    {/* Drips under 'n' */}
                    <path d="M 52 0 C 52 0 54 3 54 8 C 54 11 55 13 55 15 C 55 17 53.5 18 52 18 C 50.5 18 49 17 49 15 C 49 13 50 11 50 8 C 50 3 52 0 52 0 Z" />
                    <path d="M 70 0 C 70 0 72 5 72 13 C 72 18 73 22 73 24 C 73 26.2 71.5 27.5 70 27.5 C 68.5 27.5 67 26.2 67 24 C 67 22 68 18 68 13 C 68 5 70 0 70 0 Z" />
                    <circle cx="70" cy="24" r="1.6" fill="#b30000" opacity="0.8" />
                  </svg>
                </span>
              </span>
            </>
          )}
        </h1>

        {/* Signature Glowing Crimson Rule */}
        <div className="red-rule center animate-fade-in-up animation-delay-100" />

        {/* Cinematic Tagline */}
        <p className="hero-tagline text-white animate-fade-in-up animation-delay-200">
          {tagline}
        </p>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-g6 max-w-xl mx-auto mt-2 mb-8 leading-relaxed animate-fade-in-up animation-delay-300">
          {sub}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto animate-fade-in-up animation-delay-400">
          <Button href={primaryHref} variant="primary" size="md" className="w-full sm:w-auto">
            <span>{primaryCta}</span>
            <span>&rarr;</span>
          </Button>
          <Button href="/tickets" variant="secondary" size="md" className="w-full sm:w-auto">
            {secondaryCta}
          </Button>
          <Button href="/volunteers" variant="outline" size="md" className="w-full sm:w-auto">
            Join The Crew
          </Button>
        </div>

        {/* Social Community Connect Bar (Instagram + WhatsApp) */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animation-delay-400">
          <a
            href="https://www.instagram.com/velvt.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono uppercase tracking-wider text-g6 hover:text-white hover:border-red/50 hover:bg-red-dim transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group"
          >
            <svg
              className="w-3.5 h-3.5 text-red group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Follow @velvt.in</span>
          </a>

          <a
            href="https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono uppercase tracking-wider text-g6 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-950/40 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group"
          >
            <svg
              className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>WhatsApp Updates Group</span>
          </a>
        </div>
      </div>
    </section>
  );
}

