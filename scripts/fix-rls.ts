import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking RLS status on all public tables in Supabase Postgres...\n");

  const tables: Array<{ tablename: string; rowsecurity: boolean }> = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename ASC;
  `);

  console.table(tables);

  const disabledTables = tables.filter((t) => !t.rowsecurity);
  if (disabledTables.length === 0) {
    console.log("✅ All public tables already have RLS enabled!");
  } else {
    console.log(`⚠️ Found ${disabledTables.length} table(s) with RLS disabled. Enabling now...\n`);
    for (const t of disabledTables) {
      console.log(`Enabling RLS on "${t.tablename}"...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "${t.tablename}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ RLS enabled on "${t.tablename}"`);
    }
  }

  // Double check all tables again
  const recheck: Array<{ tablename: string; rowsecurity: boolean }> = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename ASC;
  `);

  console.log("\n🔒 Final RLS Status in public schema:");
  console.table(recheck);
}

main()
  .catch((e) => {
    console.error("Error checking/fixing RLS:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
