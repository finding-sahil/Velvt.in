import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sensitiveTables = [
  "AdminUser",
  "AuditLog",
  "Volunteer",
  "ContactInquiry",
  "SiteSetting",
];

async function main() {
  console.log("🔒 Hardening sensitive tables with FORCE RLS and REVOKE on public PostgREST roles...\n");

  for (const table of sensitiveTables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "${table}" FROM anon, authenticated;`);
      console.log(`✓ Table "${table}" secured: RLS enabled, FORCE RLS enabled, anon/authenticated revoked.`);
    } catch (e: any) {
      console.error(`Error on ${table}:`, e.message);
    }
  }

  console.log("\n🛡️ Verifying RLS & policy status from pg_tables:");
  const res = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename ASC;
  `);
  console.table(res);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
