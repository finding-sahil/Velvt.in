import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating SiteSetting social_whatsapp in Supabase...");
  await prisma.siteSetting.upsert({
    where: { key: "social_whatsapp" },
    update: { value: "https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8" },
    create: {
      key: "social_whatsapp",
      value: "https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8",
    },
  });
  console.log("✓ SiteSetting social_whatsapp updated successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
