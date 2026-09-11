import { prisma } from "@/lib/db";
import { HeroSection } from "./sections/HeroSection";
import { FeaturedEventSection } from "./sections/FeaturedEventSection";
import { HalloweenExperienceSection } from "./sections/HalloweenExperienceSection";
import { BrandIntroSection } from "./sections/BrandIntroSection";
import { EventArchiveSection } from "./sections/EventArchiveSection";
import { ServicesSection } from "./sections/ServicesSection";
import { TeamPreviewSection } from "./sections/TeamPreviewSection";
import { VolunteerPreviewSection } from "./sections/VolunteerPreviewSection";
import { PartnersPreviewSection } from "./sections/PartnersPreviewSection";
import { FinalCTASection } from "./sections/FinalCTASection";

export const revalidate = 0; // Dynamic on load

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
      <HeroSection
        title={settings.hero_title}
        tagline={settings.hero_tagline}
        sub={settings.hero_sub}
        primaryCta={settings.hero_cta_primary}
        primaryHref={featuredEvent ? `/events/${featuredEvent.slug}` : "/events"}
        secondaryCta={settings.hero_cta_secondary}
      />
      <div className="section-separator" />
      {featuredEvent && (
        <>
          <FeaturedEventSection event={featuredEvent} />
          <div className="section-separator" />
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
      <BrandIntroSection
        title={settings.brand_intro_title}
        headline={settings.brand_intro_headline}
        body={settings.brand_intro_body}
        badge={settings.brand_intro_badge}
      />
      <div className="section-separator" />
      {recentEvents.length > 0 && (
        <>
          <EventArchiveSection events={recentEvents} />
          <div className="section-separator" />
        </>
      )}
      <ServicesSection
        title={settings.services_title}
        subtitle={settings.services_subtitle}
      />
      <div className="section-separator" />
      {teamMembers.length > 0 && (
        <>
          <TeamPreviewSection members={teamMembers} />
          <div className="section-separator" />
        </>
      )}
      <VolunteerPreviewSection />
      <div className="section-separator" />
      {partners.length > 0 && (
        <>
          <PartnersPreviewSection partners={partners} />
          <div className="section-separator" />
        </>
      )}
      <FinalCTASection
        title={settings.final_cta_title}
        buttonText={settings.final_cta_button}
      />
    </>
  );
}

