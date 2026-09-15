// VELVT — Granular Section Switchboard & Minute Visibility Controls
// Allows fine-grained control over every individual section and atmospheric feature across the platform.

export type SectionControlCategory =
  | "homepage"
  | "global"
  | "event_page"
  | "about_page"
  | "volunteers_page"
  | "tickets_page"
  | "gallery_page"
  | "press_page";

export interface SectionControlItem {
  key: string;
  name: string;
  category: SectionControlCategory;
  description: string;
  defaultValue?: boolean;
  previewNote?: string;
}

export const SECTION_CONTROLS: SectionControlItem[] = [
  // ─── Homepage Sections ──────────────────────────────────────────────────────
  {
    key: "section_hero",
    name: "Hero Section",
    category: "homepage",
    description: "Main viewport with headline, blood moon / theme animation, and primary CTAs.",
    previewNote: "Top of Homepage",
  },
  {
    key: "section_impact",
    name: "Impact & Scale Metrics",
    category: "homepage",
    description: "Statistics banner (Events Hosted, Volunteers, Artists, Community Reach).",
    previewNote: "Directly under Hero",
  },
  {
    key: "section_featured_event",
    name: "Featured Event Showcase",
    category: "homepage",
    description: "Active flagship event card with dates, venue, and pass booking buttons.",
    previewNote: "Featured production",
  },
  {
    key: "section_featured_story",
    name: "Flagship Event Narrative Lore",
    category: "homepage",
    description: "Deep narrative storytelling section introducing the event's concept & dark descent.",
    previewNote: "Storytelling chapter",
  },
  {
    key: "section_experience_highlights",
    name: "Experience Pillars & Highlights",
    category: "homepage",
    description: "Thematic pillars (Subterranean Acoustics, Dark Elegance, Curated Crowd, etc.).",
    previewNote: "Sensory pillars",
  },
  {
    key: "section_why_velvt",
    name: "Why VELVT Exists",
    category: "homepage",
    description: "Brand purpose, culture, differentiators, and nocturnal mission statement.",
    previewNote: "Mission & Culture",
  },
  {
    key: "section_brand_intro",
    name: "Brand Intro & Sensory Architecture",
    category: "homepage",
    description: "High-impact brand declaration with location tag & thematic backdrop.",
    previewNote: "Brand manifesto",
  },
  {
    key: "section_event_archive",
    name: "Past Events Visual Archive",
    category: "homepage",
    description: "Archive cards for recent past productions & underground sessions.",
    previewNote: "Event history carousel",
  },
  {
    key: "section_services",
    name: "Services / What We Do",
    category: "homepage",
    description: "Breakdown of event production capabilities, stage design, and soundscapes.",
    previewNote: "Service capabilities",
  },
  {
    key: "section_team",
    name: "Core Team & Leadership Preview",
    category: "homepage",
    description: "Spotlight cards for the creative directors, operations heads, and founders.",
    previewNote: "Team preview",
  },
  {
    key: "section_volunteer",
    name: "Volunteer & Crew Recruitment Banner",
    category: "homepage",
    description: "Callout inviting youth and creators to join the verified production crew.",
    previewNote: "Volunteer CTA",
  },
  {
    key: "section_partners",
    name: "Partners & Official Sponsors",
    category: "homepage",
    description: "Logos of brands, beverage partners, and media collaborators.",
    previewNote: "Sponsor showcase",
  },
  {
    key: "section_testimonials",
    name: "Floating Testimonials Showcase",
    category: "homepage",
    description: "Floating ambient marquee of testimonials from attendees, sponsors, and production crew.",
    previewNote: "Floating feedback carousel",
    defaultValue: true,
  },
  {
    key: "section_newsletter",
    name: "Newsletter Dispatch Form",
    category: "homepage",
    description: "'Never Miss a Chapter' inner circle subscription box.",
    previewNote: "Newsletter signup",
  },
  {
    key: "section_final_cta",
    name: "Final Call to Action Banner",
    category: "homepage",
    description: "Bottom action prompt encouraging visitors to explore upcoming events.",
    previewNote: "Footer CTA",
  },

  // ─── Global Features & Atmospheric FX ───────────────────────────────────────
  {
    key: "feature_thematic_atmosphere",
    name: "Atmospheric FX & Particles",
    category: "global",
    description: "Floating embers, fog effects, and blood drip animations across the site.",
    previewNote: "Global visual effects",
  },
  {
    key: "feature_custom_cursor",
    name: "Interactive Glowing Custom Cursor",
    category: "global",
    description: "Red neon follower dot with interactive hover expander.",
    previewNote: "Desktop interaction",
  },
  {
    key: "feature_film_grain",
    name: "Cinematic Film Grain & Scanlines",
    category: "global",
    description: "Subtle analog retro film noise texture across background layers.",
    previewNote: "Texture overlay",
  },
  {
    key: "feature_global_search",
    name: "Global Command Search Palette",
    category: "global",
    description: "Search trigger icon in navbar opening instant keyboard-navigable search modal.",
    previewNote: "Navigation search",
  },
  {
    key: "feature_scroll_to_top",
    name: "Floating Scroll-To-Top Button",
    category: "global",
    description: "Smooth return-to-top floating button on long pages.",
    previewNote: "Bottom right corner",
  },
  {
    key: "feature_footer_socials",
    name: "Footer Social & Community Channels",
    category: "global",
    description: "Instagram, WhatsApp group, and email contact links in footer.",
    previewNote: "Footer links",
  },
  {
    key: "feature_footer_newsletter",
    name: "Footer Newsletter Subscription",
    category: "global",
    description: "Compact newsletter signup box in the site footer.",
    previewNote: "Footer column",
  },

  // ─── Event Detail Pages ─────────────────────────────────────────────────────
  {
    key: "event_section_schedule",
    name: "Event Schedule / Timeline",
    category: "event_page",
    description: "Hour-by-hour operational timeline on dedicated event pages.",
    previewNote: "/events/[slug]",
  },
  {
    key: "event_section_faqs",
    name: "Event FAQs Accordion",
    category: "event_page",
    description: "Interactive FAQ accordion for ticketing, dress code, and venue rules.",
    previewNote: "/events/[slug]",
  },
  {
    key: "event_section_partners",
    name: "Event Sponsors & Partners Grid",
    category: "event_page",
    description: "Partner logos associated specifically with the event.",
    previewNote: "/events/[slug]",
  },
  {
    key: "event_section_gallery",
    name: "Event Visual Archive / Media Gallery",
    category: "event_page",
    description: "High-resolution photo and video gallery of the event.",
    previewNote: "/events/[slug]",
  },
  {
    key: "event_section_volunteer_cta",
    name: "Event Crew / Volunteer Application Callout",
    category: "event_page",
    description: "Call-to-action inviting visitors to join the crew for this specific event.",
    previewNote: "/events/[slug]",
  },

  // ─── About Page Sections ────────────────────────────────────────────────────
  {
    key: "about_section_hero",
    name: "Hero Header & Tagline",
    category: "about_page",
    description: "Top headline: 'An Idea, A Feeling, An Experience.' and sub-tagline.",
    previewNote: "/about",
  },
  {
    key: "about_section_story",
    name: "Brand Narrative ('What is VELVT?')",
    category: "about_page",
    description: "Detailed brand story and creative event studio overview.",
    previewNote: "/about",
  },
  {
    key: "about_section_mission",
    name: "Mission & Vision Statements",
    category: "about_page",
    description: "Dual cards outlining community focus and cinematic experiential vision.",
    previewNote: "/about",
  },
  {
    key: "about_section_philosophy",
    name: "The Experience Philosophy",
    category: "about_page",
    description: "Nocturnal philosophy on intentionality, pacing, and atmosphere.",
    previewNote: "/about",
  },

  // ─── Volunteers Page Sections ───────────────────────────────────────────────
  {
    key: "volunteers_section_positions",
    name: "Open Crew Positions & Opportunities",
    category: "volunteers_page",
    description: "Department opportunities grid with real-time application status badges.",
    previewNote: "/volunteers",
  },
  {
    key: "volunteers_section_skills",
    name: "Crew Benefits / What You Gain",
    category: "volunteers_page",
    description: "4-card breakdown of mentorship, network, and live operational craft.",
    previewNote: "/volunteers",
  },
  {
    key: "volunteers_section_registry",
    name: "Verified Volunteer Credential Registry",
    category: "volunteers_page",
    description: "Searchable registry table of approved crew members and QR pass IDs.",
    previewNote: "/volunteers",
  },
  {
    key: "volunteers_section_apply_cta",
    name: "Bottom Join the Crew CTA Card",
    category: "volunteers_page",
    description: "Direct call-to-action banner linking to registration portal.",
    previewNote: "/volunteers",
  },

  // ─── Tickets Page Sections ──────────────────────────────────────────────────
  {
    key: "tickets_section_tiers",
    name: "Pass Categories & Ticket Cards",
    category: "tickets_page",
    description: "Tier cards (Early Bird, General Entry, VIP) with pricing and booking buttons.",
    previewNote: "/tickets",
  },
  {
    key: "tickets_section_admission_info",
    name: "Important Admission & Venue Rules Box",
    category: "tickets_page",
    description: "Entry criteria, age restrictions, and venue dress code rules.",
    previewNote: "/tickets",
  },

  // ─── Gallery Page Sections ──────────────────────────────────────────────────
  {
    key: "gallery_section_archive",
    name: "Visual Media Grid & Lightbox",
    category: "gallery_page",
    description: "High-resolution photographic capture grid with category filtering and full-screen lightbox.",
    previewNote: "/gallery",
  },
  {
    key: "gallery_section_submissions_cta",
    name: "Photographer Inquiries & Submissions Card",
    category: "gallery_page",
    description: "Bottom collaborative callout: 'Were you behind the lens?'.",
    previewNote: "/gallery",
  },

  // ─── Press Page Sections ────────────────────────────────────────────────────
  {
    key: "press_section_mediakit",
    name: "Official Media Kit & Assets Banner",
    category: "press_page",
    description: "Download banner for SVG logos, color palettes, and press imagery.",
    previewNote: "/press",
  },
  {
    key: "press_section_articles",
    name: "Featured Press Coverage Grid",
    category: "press_page",
    description: "3-column editorial articles from publications and media partners.",
    previewNote: "/press",
  },
];

/**
 * Checks whether a specific section is enabled in the database site settings.
 * Defaults to true unless explicitly toggled off (value === "false" or "0").
 */
export function isSectionEnabled(
  settings: Record<string, string>,
  key: string,
  defaultValue = true
): boolean {
  if (!settings || settings[key] === undefined || settings[key] === "") {
    return defaultValue;
  }
  return settings[key] === "true" || settings[key] === "1";
}
