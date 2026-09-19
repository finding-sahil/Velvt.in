import { prisma } from "@/lib/db";
import { getCachedSiteSettings } from "@/lib/settings-cache";
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
import { FloatingTestimonialsSection } from "./sections/FloatingTestimonialsSection";
import { FinalCTASection } from "./sections/FinalCTASection";
import { NewsletterSection } from "@/components/ui/NewsletterSection";
import { isSectionEnabled } from "@/lib/section-switchboard";
import { CinematicHeroSection } from "./sections/CinematicHeroSection";
import { CinematicFeaturedEvent } from "./sections/CinematicFeaturedEvent";
import { CinematicHomePage } from "./sections/CinematicHomePage";

export const revalidate = 60; // Instant cached serving with background ISR

export default async function HomePage() {
  // 1. Instant cached settings provider (0ms memory cache)
  const settings = await getCachedSiteSettings();

  // 2. Prepare featured event query based on settings
  const featuredEventQuery = settings.featured_event_id
    ? prisma.event.findUnique({
        where: { id: settings.featured_event_id },
        include: {
          venue: true,
          ticketTypes: { where: { isActive: true }, orderBy: { displayOrder: "asc" } },
        },
      }).catch(() => null)
    : prisma.event.findFirst({
        where: { isFeatured: true, status: { not: "draft" } },
        include: {
          venue: true,
          ticketTypes: { where: { isActive: true }, orderBy: { displayOrder: "asc" } },
        },
      }).catch(() => null);

  // 3. Parallelize all database queries concurrently in a single round-trip pool
  const [recentEvents, teamMembers, partners, testimonials, initialFeaturedEvent] = await Promise.all([
    prisma.event.findMany({
      where: { status: { not: "draft" } },
      include: { venue: true },
      orderBy: { date: "desc" },
      take: 6,
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
    prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { displayOrder: "asc" },
      take: 12,
    }).catch(() => []),
    featuredEventQuery,
  ]);

  let featuredEvent = initialFeaturedEvent;
  if (!featuredEvent && settings.featured_event_id) {
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

  // Determine the server-side theme (used for initial render; client will hydrate)
  const siteTheme = settings.site_theme || "legacy";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          CINEMATIC THEME — Minimal, atmospheric, progressive disclosure
          Flow: HOOK → ATMOSPHERE → EVENT → PROOF → ACTION
          ═══════════════════════════════════════════════════════════════════ */}
      <CinematicHomePage
        settings={settings}
        featuredEvent={featuredEvent}
        testimonials={testimonials}
        siteTheme={siteTheme}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          LEGACY THEME — The original VELVT experience, fully preserved
          ═══════════════════════════════════════════════════════════════════ */}
      <LegacyHomePage
        settings={settings}
        featuredEvent={featuredEvent}
        recentEvents={recentEvents}
        teamMembers={teamMembers}
        partners={partners}
        testimonials={testimonials}
        experienceHighlights={experienceHighlights}
      />
    </>
  );
}

/* ─── LEGACY HOME PAGE (Exact original, untouched) ────────────────────────────── */

function LegacyHomePage({
  settings,
  featuredEvent,
  recentEvents,
  teamMembers,
  partners,
  testimonials,
  experienceHighlights,
}: {
  settings: Record<string, string>;
  featuredEvent: any;
  recentEvents: any[];
  teamMembers: any[];
  partners: any[];
  testimonials: any[];
  experienceHighlights: any;
}) {
  return (
    <div className="legacy-home" data-theme-content="legacy">
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

      {/* Historical Past Events Archive (Excludes active upcoming/ongoing events) */}
      {(() => {
        const pastEvents = recentEvents.filter(
          (e) =>
            e.id !== featuredEvent?.id &&
            (e.status === "completed" || e.status === "archived")
        );
        if (!isSectionEnabled(settings, "section_event_archive") || pastEvents.length === 0) return null;
        return (
          <>
            <EventArchiveSection events={pastEvents} />
            <div className="section-separator" />
          </>
        );
      })()}

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

      {/* Floating Testimonials Ambient Marquee */}
      {isSectionEnabled(settings, "section_testimonials") && (
        <>
          <FloatingTestimonialsSection testimonials={testimonials} />
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
    </div>
  );
}

