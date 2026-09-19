"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { CinematicHeroSection } from "./CinematicHeroSection";
import { CinematicFeaturedEvent } from "./CinematicFeaturedEvent";
import { FloatingTestimonialsSection } from "./FloatingTestimonialsSection";
import Link from "next/link";

interface CinematicHomePageProps {
  settings: Record<string, string>;
  featuredEvent: any;
  testimonials: any[];
  siteTheme: string;
}

export function CinematicHomePage({
  settings,
  featuredEvent,
  testimonials,
  siteTheme,
}: CinematicHomePageProps) {
  const { theme } = useTheme();

  // Only render cinematic content when cinematic theme is active
  if (theme !== "cinematic") return null;

  return (
    <div className="cinematic-home" data-theme-content="cinematic">
      {/* 1. HOOK — Full-viewport atmospheric hero */}
      <CinematicHeroSection
        title={settings.hero_title || "VELVT"}
        tagline={settings.hero_tagline || "CURSE 2.O"}
        sub={settings.hero_sub || "It starts as a thought. Ends as a memory."}
        primaryCta={settings.hero_cta_primary || "Enter Curse 2.O"}
        primaryHref={featuredEvent ? `/events/${featuredEvent.slug}` : "/events"}
        eventDate="31 October"
        eventLocation="Silchar"
      />

      {/* 2. EVENT — Cinematic featured event showcase */}
      {featuredEvent && (
        <CinematicFeaturedEvent event={featuredEvent} />
      )}

      {/* 3. PROOF — Testimonials (existing component, styled via CSS) */}
      {testimonials && testimonials.length > 0 && (
        <FloatingTestimonialsSection testimonials={testimonials} />
      )}

      {/* 4. ACTION — Minimal final CTA */}
      <section className="cin-section" style={{ padding: "clamp(5rem, 10vh, 8rem) 0" }}>
        <div className="w-full max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <h2
            className="cin-display-title text-[var(--cin-text,#e8e4df)] mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {settings.final_cta_title || "The night awaits."}
          </h2>
          <p className="cin-body text-[var(--cin-text-muted,#8a8680)] text-sm sm:text-base mb-8 max-w-md mx-auto">
            Open for collaborations, venue takeovers, and partnerships.
          </p>
          <Link
            href="/contact"
            className="cin-cta-primary inline-flex items-center gap-2.5 px-8 py-3.5 bg-[var(--red,#a31526)] text-[var(--cin-text,#e8e4df)] text-sm font-medium tracking-wide transition-all duration-300 hover:bg-[#8a1020]"
            style={{ borderRadius: "2px" }}
          >
            <span>{settings.final_cta_button || "Get In Touch"}</span>
            <span className="opacity-60">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
