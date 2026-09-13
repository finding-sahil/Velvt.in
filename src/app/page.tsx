import { prisma } from "@/lib/db";
import { HeroSection } from "./sections/HeroSection";
import { FeaturedEventSection } from "./sections/FeaturedEventSection";
import { FeaturedEventStorySection } from "./sections/FeaturedEventStorySection";
import { ImpactNumbersSection } from "./sections/ImpactNumbersSection";
import { WhyVelvtSection } from "./sections/WhyVelvtSection";
import { HalloweenExperienceSection } from "./sections/HalloweenExperienceSection";
import { BrandIntroSection } from "./sections/BrandIntroSection";
import { EventArchiveSection } from "./sections/EventArchiveSection";
import { ServicesSection } from "./sections/ServicesSection";
import { TeamPreviewSection } from "./sections/TeamPreviewSection";
import { VolunteerPreviewSection } from "./sections/VolunteerPreviewSection";
import { PartnersPreviewSection } from "./sections/PartnersPreviewSection";
import { FinalCTASection } from "./sections/FinalCTASection";
import { NewsletterSection } from "@/components/ui/NewsletterSection";
import { isSectionEnabled } from "@/lib/section-switchboard";

export const revalidate = 60; // Instant cached serving with background ISR

export default async function HomePage() {
  // Fetch initial queries in parallel to eliminate waterfall network latency
  const [siteSettings, recentEvents, teamMembers, partners] = await Promise.all([
    prisma.siteSetting.findMany().catch(() => []),
    prisma.event.findMany({
      where: { status: { not: "draft" } },
      include: { venue: true },
      orderBy: { date: "desc" },
      take: 4,
    }).catch(() => []),
    prisma.teamMember.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
      take: 8,
    }).catch(() => []),
    prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 8,
    }).catch(() => []),
  ]);

  const settings: Record<string, string> = {};
  for (const s of siteSettings) {
    settings[s.key] = s.value;
  }

  // Fetch featured event
  let featuredEvent = null;
  if (settings.featured_event_id) {
    featuredEvent = await prisma.event.findUnique({
      where: { id: settings.featured_event_id },
      include: {
        venue: true,
        ticketTypes: { where: { isActive: true }, orderBy: { displayOrder: "asc" } },
      },
    }).catch(() => null);
  }

  if (!featuredEvent) {
    featuredEvent = await prisma.event.findFirst({
      where: { isFeatured: true, status: { not: "draft" } },
      include: {
        venue: true,
        ticketTypes: { where: { isActive: true }, orderBy: { displayOrder: "asc" } },
      },
    }).catch(() => null);
  }

  // Parse CMS Experience Highlights if present
  let experienceHighlights;
  if (settings.experience_highlights) {
    try {
      experienceHighlights = JSON.parse(settings.experience_highlights);
    } catch {
      experienceHighlights = undefined;
    }
  }

  return (
    <>
      {isSectionEnabled(settings, "section_hero") && (
        <>
          <HeroSection
            title={settings.hero_title}
            tagline={settings.hero_tagline}
            sub={settings.hero_sub}
            primaryCta={settings.hero_cta_primary}
            primaryHref={featuredEvent ? `/events/${featuredEvent.slug}` : "/events"}
            secondaryCta={settings.hero_cta_secondary}
          />
          <div className="section-separator" />
        </>
      )}

      {/* Impact & Numbers (Real, Verifiable Scale) */}
      {isSectionEnabled(settings, "section_impact") && (
        <>
          <ImpactNumbersSection
            title={settings.impact_title}
            subtitle={settings.impact_subtitle}
            eventsCount={settings.impact_events_hosted || "2+"}
            volunteersCount={settings.impact_volunteers_involved || "50+"}
            artistsCount={settings.impact_artists_featured || "15+"}
            reachCount={settings.impact_community_reach || "1,500+"}
          />
          <div className="section-separator" />
        </>
      )}

      {featuredEvent && (
        <>
          {isSectionEnabled(settings, "section_featured_event") && (
            <>
              <FeaturedEventSection event={featuredEvent} />
              <div className="section-separator" />
            </>
          )}

          {/* Deep Storytelling Presentation of the Flagship Event */}
          {isSectionEnabled(settings, "section_featured_story") && (
            <>
              <FeaturedEventStorySection
                event={featuredEvent}
                storyTitle={settings.featured_story_title}
                storySubtitle={settings.featured_story_subtitle}
              />
              <div className="section-separator" />
            </>
          )}

          {isSectionEnabled(settings, "section_experience_highlights") && (
            <>
              <HalloweenExperienceSection
                title={settings.experience_highlights_title}
                dossierHref={`/events/${featuredEvent.slug}`}
                dossierLabel={settings.experience_highlights_cta_label}
                highlights={experienceHighlights}
                eventDressCode={featuredEvent.dressCode}
              />
              <div className="section-separator" />
            </>
          )}
        </>
      )}

      {/* Why VELVT Exists: Mission, Purpose, Culture, Differentiators */}
      {isSectionEnabled(settings, "section_why_velvt") && (
        <>
          <WhyVelvtSection
            title={settings.why_velvt_title}
            subtitle={settings.why_velvt_subtitle}
          />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_brand_intro") && (
        <>
          <BrandIntroSection
            title={settings.brand_intro_title}
            headline={settings.brand_intro_headline}
            body={settings.brand_intro_body}
            badge={settings.brand_intro_badge}
          />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_event_archive") && recentEvents.length > 0 && (
        <>
          <EventArchiveSection events={recentEvents} />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_services") && (
        <>
          <ServicesSection
            title={settings.services_title}
            subtitle={settings.services_subtitle}
          />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_team") && teamMembers.length > 0 && (
        <>
          <TeamPreviewSection members={teamMembers} />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_volunteer") && (
        <>
          <VolunteerPreviewSection />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_partners") && partners.length > 0 && (
        <>
          <PartnersPreviewSection partners={partners} />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_newsletter") && (
        <>
          <NewsletterSection
            title={settings.newsletter_title}
            subtitle={settings.newsletter_subtitle}
            badge={settings.newsletter_badge}
          />
          <div className="section-separator" />
        </>
      )}

      {isSectionEnabled(settings, "section_final_cta") && (
        <FinalCTASection
          title={settings.final_cta_title}
          buttonText={settings.final_cta_button}
        />
      )}
    </>
  );
}
