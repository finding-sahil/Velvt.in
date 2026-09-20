"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { isSectionEnabled } from "@/lib/section-switchboard";
import { Velvt2Hero } from "./Velvt2Hero";
import { ImpactNumbersSection } from "../ImpactNumbersSection";
import { FeaturedEventSection } from "../FeaturedEventSection";
import { FeaturedEventStorySection } from "../FeaturedEventStorySection";
import { HalloweenExperienceSection } from "../HalloweenExperienceSection";
import { WhyVelvtSection } from "../WhyVelvtSection";
import { BrandIntroSection } from "../BrandIntroSection";
import { EventArchiveSection } from "../EventArchiveSection";
import { ServicesSection } from "../ServicesSection";
import { TeamPreviewSection } from "../TeamPreviewSection";
import { VolunteerPreviewSection } from "../VolunteerPreviewSection";
import { FloatingTestimonialsSection } from "../FloatingTestimonialsSection";
import { PartnersPreviewSection } from "../PartnersPreviewSection";
import { NewsletterSection } from "@/components/ui/NewsletterSection";
import { FinalCTASection } from "../FinalCTASection";

interface Velvt2HomePageProps {
  settings: Record<string, string>;
  featuredEvent: any;
  recentEvents: any[];
  teamMembers: any[];
  partners: any[];
  testimonials: any[];
  experienceHighlights?: any;
  siteTheme: string;
}

export function Velvt2HomePage({
  settings,
  featuredEvent,
  recentEvents,
  teamMembers,
  partners,
  testimonials,
  experienceHighlights,
}: Velvt2HomePageProps) {
  const { theme } = useTheme();

  // Only render VELVT 2.0 content when velvt2 theme is active
  if (theme !== "velvt2") return null;

  return (
    <div className="velvt2-home" data-theme-content="velvt2">
      {/* 1. HERO — Iconic Brand Headline, Tagline, Compact Subtitle, Ambient Halos */}
      {isSectionEnabled(settings, "section_hero") && (
        <Velvt2Hero
          title={settings.hero_title || "VELVT"}
          tagline={settings.hero_tagline || "It starts as a thought, ends as a memory."}
          sub={settings.hero_sub || "Immersive nightlife · Silchar, Assam"}
          primaryCta={settings.hero_cta_primary || "Explore Curse 2.O"}
          primaryHref={featuredEvent ? `/events/${featuredEvent.slug}` : "/events"}
          secondaryCta={settings.hero_cta_secondary || "Book Passes"}
          secondaryHref="/tickets"
        />
      )}

      {/* 2. IMPACT & SCALE NUMBERS — Real, verifiable metrics */}
      {isSectionEnabled(settings, "section_impact") && (
        <ImpactNumbersSection
          title={settings.impact_title}
          subtitle={settings.impact_subtitle}
          eventsCount={settings.impact_events_hosted || "2+"}
          volunteersCount={settings.impact_volunteers_involved || "50+"}
          artistsCount={settings.impact_artists_featured || "15+"}
          reachCount={settings.impact_community_reach || "1,500+"}
        />
      )}

      {/* 3. FEATURED EVENT — Poster, Countdown, Details & Actions */}
      {featuredEvent && (
        <>
          {isSectionEnabled(settings, "section_featured_event") && (
            <FeaturedEventSection event={featuredEvent} />
          )}

          {/* 4. EVENT CHRONICLE / STORY — Narrative Lore */}
          {isSectionEnabled(settings, "section_featured_story") && (
            <FeaturedEventStorySection
              event={featuredEvent}
              storyTitle={settings.featured_story_title}
              storySubtitle={settings.featured_story_subtitle}
            />
          )}

          {/* 5. EXPERIENCE HIGHLIGHTS — Sensory Pillars & Dress Code */}
          {isSectionEnabled(settings, "section_experience_highlights") && (
            <HalloweenExperienceSection
              title={settings.experience_highlights_title}
              dossierHref={`/events/${featuredEvent.slug}`}
              dossierLabel={settings.experience_highlights_cta_label}
              highlights={experienceHighlights}
              eventDressCode={featuredEvent.dressCode}
            />
          )}
        </>
      )}

      {/* 6. WHY VELVT EXISTS — Culture, Mission & Differentiators */}
      {isSectionEnabled(settings, "section_why_velvt") && (
        <WhyVelvtSection
          title={settings.why_velvt_title}
          subtitle={settings.why_velvt_subtitle}
        />
      )}

      {/* 7. BRAND INTRO — Sensory Architecture Manifesto */}
      {isSectionEnabled(settings, "section_brand_intro") && (
        <BrandIntroSection
          title={settings.brand_intro_title}
          headline={settings.brand_intro_headline}
          body={settings.brand_intro_body}
          badge={settings.brand_intro_badge}
        />
      )}

      {/* 8. HISTORICAL PAST EVENTS ARCHIVE */}
      {(() => {
        const pastEvents = recentEvents.filter(
          (e) =>
            e.id !== featuredEvent?.id &&
            (e.status === "completed" || e.status === "archived")
        );
        if (!isSectionEnabled(settings, "section_event_archive") || pastEvents.length === 0) return null;
        return <EventArchiveSection events={pastEvents} />;
      })()}

      {/* 9. SERVICES — What We Do */}
      {isSectionEnabled(settings, "section_services") && (
        <ServicesSection
          title={settings.services_title}
          subtitle={settings.services_subtitle}
        />
      )}

      {/* 10. CORE TEAM — Production Leadership */}
      {isSectionEnabled(settings, "section_team") && teamMembers && teamMembers.length > 0 && (
        <TeamPreviewSection members={teamMembers} />
      )}

      {/* 11. PRODUCTION CREW — Volunteer Recruitment */}
      {isSectionEnabled(settings, "section_volunteer") && (
        <VolunteerPreviewSection />
      )}

      {/* 12. VOICES OF THE UNDERGROUND — Compacted Testimonials */}
      {isSectionEnabled(settings, "section_testimonials") && (
        <FloatingTestimonialsSection
          testimonials={testimonials}
          compact={true}
        />
      )}

      {/* 13. PARTNERS & COLLABORATORS */}
      {isSectionEnabled(settings, "section_partners") && partners && partners.length > 0 && (
        <PartnersPreviewSection partners={partners} />
      )}

      {/* 14. NEWSLETTER DISPATCH */}
      {isSectionEnabled(settings, "section_newsletter") && (
        <NewsletterSection
          title={settings.newsletter_title}
          subtitle={settings.newsletter_subtitle}
          badge={settings.newsletter_badge}
        />
      )}

      {/* 15. FINAL CALL TO ACTION */}
      {isSectionEnabled(settings, "section_final_cta") && (
        <FinalCTASection
          title={settings.final_cta_title}
          buttonText={settings.final_cta_button}
        />
      )}
    </div>
  );
}
