import { prisma } from "../src/lib/db";

async function main() {
  const tables = [
    "Testimonial",
    "IssuedTicket",
    "SponsorInquiry",
    "NewsletterSubscriber",
    "AdminUser",
    "Event",
    "Venue",
    "TicketType",
    "EventScheduleItem",
    "EventAnnouncement",
    "EventFAQ",
    "Volunteer",
    "TeamMember",
    "GalleryItem",
    "Partner",
    "PressMention",
    "SiteSetting",
    "ContactInquiry",
    "AuditLog",
  ];

  console.log("Enabling Row Level Security (RLS) on all Supabase tables...");
  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS "${t}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ Enabled RLS for table: "${t}"`);
    } catch (e: any) {
      console.error(`✗ Error for table "${t}":`, e.message);
    }
  }
}

main()
  .then(() => {
    console.log("All RLS operations complete.");
    return prisma.$disconnect();
  })
  .catch((err) => {
    console.error("Fatal error:", err);
    return prisma.$disconnect();
  });
