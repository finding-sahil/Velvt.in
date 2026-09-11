import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tables = [
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
  "ContactInquiry",
  "SiteSetting",
];

// Tables that can be safely read publicly via Supabase anon API if needed
const publicReadTables = [
  "Event",
  "Venue",
  "TicketType",
  "EventScheduleItem",
  "EventAnnouncement",
  "EventFAQ",
  "TeamMember",
  "GalleryItem",
  "Partner",
  "PressMention",
];

async function main() {
  console.log("🔒 Enabling Row Level Security (RLS) on all public tables in Supabase...\n");

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ RLS enabled on public."${table}"`);
    } catch (err: any) {
      console.error(`✗ Error on "${table}":`, err.message);
    }
  }

  console.log("\n🛡️ Configuring public SELECT policies for display tables (leaves admin, volunteer, inquiries strictly protected)...\n");

  for (const table of publicReadTables) {
    try {
      const policyName = `Allow public read on ${table}`;
      // Drop if exists first to be idempotent
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "${policyName}" ON "${table}";`);
      await prisma.$executeRawUnsafe(
        `CREATE POLICY "${policyName}" ON "${table}" FOR SELECT USING (true);`
      );
      console.log(`✓ Read policy added to public."${table}"`);
    } catch (err: any) {
      console.error(`✗ Error adding policy on "${table}":`, err.message);
    }
  }

  console.log("\n✨ All 14 tables secured with RLS!");
}

main()
  .catch((e) => {
    console.error("Failed to enable RLS:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
