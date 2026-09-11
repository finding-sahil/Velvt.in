import { prisma } from "../src/lib/db";

async function run() {
  console.log("=== DB AUDIT INSPECTION ===");
  const tables = await prisma.$queryRawUnsafe<any[]>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );
  console.log("Public tables:", tables.map((t) => t.table_name));

  const storageBuckets = await prisma.$queryRawUnsafe<any[]>(
    "SELECT id, name, public FROM storage.buckets;"
  ).catch((e) => {
    console.log("storage.buckets query error:", e.message);
    return [];
  });
  console.log("Storage buckets in DB:", storageBuckets);

  const rlsStatus = await prisma.$queryRawUnsafe<any[]>(
    "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
  );
  console.log("Public tables RLS status:", rlsStatus);

  const policies = await prisma.$queryRawUnsafe<any[]>(
    "SELECT policyname, tablename, cmd, qual FROM pg_policies WHERE schemaname = 'public';"
  );
  console.log("Active public policies:", policies);

  // Check counts
  const eventCount = await prisma.event.count();
  const adminCount = await prisma.adminUser.count();
  const volCount = await prisma.volunteer.count();
  const inquiryCount = await prisma.contactInquiry.count();
  const teamCount = await prisma.teamMember.count();
  const galleryCount = await prisma.galleryItem.count();
  const partnerCount = await prisma.partner.count();
  const pressCount = await prisma.pressMention.count();
  const settingCount = await prisma.siteSetting.count();

  console.log("Data counts in Supabase:");
  console.log({
    eventCount,
    adminCount,
    volCount,
    inquiryCount,
    teamCount,
    galleryCount,
    partnerCount,
    pressCount,
    settingCount,
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
