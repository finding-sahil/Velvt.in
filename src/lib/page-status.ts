export type PageStatus = "active" | "coming_soon" | "inactive";

export interface PageStatusConfig {
  key: string;
  name: string;
  path: string;
  defaultStatus: PageStatus;
  defaultTitle: string;
  defaultSubtitle: string;
}

export const CONTROLLED_PAGES: PageStatusConfig[] = [
  {
    key: "tickets",
    name: "Tickets & Passes",
    path: "/tickets",
    defaultStatus: "coming_soon",
    defaultTitle: "Tickets & Passes Opening Soon",
    defaultSubtitle:
      "Ticket sales and admission passes for the next VELVT experience are opening soon. Follow Instagram for early access.",
  },
  {
    key: "volunteers",
    name: "Volunteer Crew Directory",
    path: "/volunteers",
    defaultStatus: "active",
    defaultTitle: "Volunteer Applications Coming Soon",
    defaultSubtitle:
      "Volunteer and production crew registrations will open soon for the upcoming VELVT experience.",
  },
  {
    key: "gallery",
    name: "Visual Archive / Gallery",
    path: "/gallery",
    defaultStatus: "active",
    defaultTitle: "Visual Archive Curating",
    defaultSubtitle:
      "Our official production photography and visual archive are currently being curated. Check back shortly.",
  },
  {
    key: "team",
    name: "Core Team",
    path: "/team",
    defaultStatus: "active",
    defaultTitle: "Core Team Profiles Coming Soon",
    defaultSubtitle:
      "The creators, directors, and production crew behind VELVT experiences will be unveiled soon.",
  },
  {
    key: "press",
    name: "Press & Media Kit",
    path: "/press",
    defaultStatus: "active",
    defaultTitle: "Press & Editorial Desk Updating",
    defaultSubtitle:
      "Official press releases, media kits, and brand assets are being refreshed for the new season.",
  },
  {
    key: "contact",
    name: "Contact Desk",
    path: "/contact",
    defaultStatus: "active",
    defaultTitle: "Contact Desk Temporarily Paused",
    defaultSubtitle:
      "Direct form submissions are temporarily queued. For urgent inquiries, please contact us via Instagram or WhatsApp.",
  },
  {
    key: "about",
    name: "About VELVT",
    path: "/about",
    defaultStatus: "active",
    defaultTitle: "Brand Manifesto Coming Soon",
    defaultSubtitle:
      "The philosophy and sensory architecture of VELVT is being documented.",
  },
  {
    key: "events",
    name: "Events Archive",
    path: "/events",
    defaultStatus: "active",
    defaultTitle: "Events Lineup Updating",
    defaultSubtitle:
      "New event dates and production schedules will be posted here soon.",
  },
];
