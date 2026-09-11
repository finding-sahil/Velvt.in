import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCE_DIR = path.resolve("C:/Users/Sahil Mazumder/Desktop/VELVET.in/velvet-web/VELVET ZONE");
const DEST_DIR = path.resolve(process.cwd(), "public/gallery");

function sanitizeFilename(rawName: string): string {
  const ext = path.extname(rawName);
  let base = path.basename(rawName, ext);

  // Handle special case patterns
  if (base.toLowerCase().includes("dia de los muertos")) {
    const numMatch = base.match(/\((\d+)\)/);
    const num = numMatch ? numMatch[1] : "0";
    return `dia-de-los-muertos-vibes-${num}.webp`;
  }

  if (base.toLowerCase().startsWith("screenshot")) {
    const hash = base.slice(-12);
    return `velvt-live-coverage-${hash}.webp`;
  }

  // General clean: remove double underscores, dots, leading underscores
  base = base
    .replace(/^_+/, "")
    .replace(/_+$/, "")
    .replace(/\.+/g, "-")
    .replace(/_{2,}/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .toLowerCase();

  return `${base}.webp`;
}

function generateCaption(filename: string): string {
  const lower = filename.toLowerCase();

  if (lower.includes("dia-de-los-muertos") || lower.includes("dia de los muertos")) {
    return "Dia de los Muertos • Nocturnal Masquerade";
  }
  if (lower.includes("sumayyyaaaa")) {
    return "Atmospheric Focus • Captured by @sumayyyaaaa";
  }
  if (lower.includes("swas-b") || lower.includes("_swas_b_")) {
    return "Stage Energy & Cadence • Captured by @_swas_b_";
  }
  if (lower.includes("bhumicoree")) {
    return "Crowd Synthesis • Captured by @bhumicoree";
  }
  if (lower.includes("caramel-jitschiato") || lower.includes("caramel_jitschiato")) {
    return "Light Sculptures & Aura • Captured by @caramel_jitschiato";
  }
  if (lower.includes("jd-tattoo369") || lower.includes("jd_tattoo369")) {
    return "Live Production Detail • Captured by @jd_tattoo369";
  }
  if (lower.includes("kamiya-jin") || lower.includes("kamiya_jin")) {
    return "Sonic Immersion • Captured by @kamiya_jin__";
  }
  if (lower.includes("lucky-suklabaidya") || lower.includes("lucky_suklabaidya")) {
    return "Nocturnal Perspective • Captured by @lucky_suklabaidya";
  }
  if (lower.includes("mystic-melody") || lower.includes("mystic__melody")) {
    return "Resonance & Mood • Captured by @mystic__melody___";
  }
  if (lower.includes("namandeep-singh") || lower.includes("namandeep_singh")) {
    return "Rhythm & Expression • Captured by @namandeep_singh___";
  }
  if (lower.includes("rohon-chatterjee") || lower.includes("rohon_chatterjee")) {
    return "Kinetic Stage Energy • Captured by @rohon_chatterjee__";
  }
  if (lower.includes("vawmpier")) {
    return "Shadow & Light • Captured by @vawmpier";
  }
  if (lower.includes("screenshot")) {
    return "Live Production Broadcast • VELVT Coverage";
  }

  return "VELVT CURSE 2.O • Official Visual Archive";
}

async function main() {
  console.log("=== VELVT Archive WebP Conversion & Database Ingestion ===");
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Destination: ${DEST_DIR}`);

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  // Fetch the active event (VELVT CURSE 2.O)
  const event = await prisma.event.findFirst({
    where: { slug: "velvt-curse-2-o" },
  });
  const eventId = event?.id || null;
  console.log(`Associated Event ID: ${eventId} (${event?.name || "None"})`);

  const files = fs.readdirSync(SOURCE_DIR);
  // Filter out video files, process only images
  const imageFiles = files.filter((f) => !f.toLowerCase().endsWith(".mp4"));
  console.log(`Found ${imageFiles.length} image files to process (skipped ${files.length - imageFiles.length} videos).`);

  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  const processedItems: { url: string; caption: string; displayOrder: number }[] = [];

  // Remove existing files in public/gallery that are not webp or belong to previous unorganized batch
  const existingGalleryFiles = fs.readdirSync(DEST_DIR);
  for (const f of existingGalleryFiles) {
    const fullPath = path.join(DEST_DIR, f);
    if (fs.statSync(fullPath).isFile()) {
      fs.unlinkSync(fullPath);
    }
  }
  console.log(`Cleaned existing temporary files from ${DEST_DIR}`);

  for (let i = 0; i < imageFiles.length; i++) {
    const rawFile = imageFiles[i];
    const srcPath = path.join(SOURCE_DIR, rawFile);
    const origStat = fs.statSync(srcPath);
    totalOriginalBytes += origStat.size;

    const webpName = sanitizeFilename(rawFile);
    const destPath = path.join(DEST_DIR, webpName);

    try {
      // Process image through sharp: rotate based on EXIF, resize to max 1600px, compress to WebP
      const info = await sharp(srcPath)
        .rotate()
        .resize(1600, 1600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 4 })
        .toFile(destPath);

      totalWebpBytes += info.size;
      const caption = generateCaption(webpName);

      processedItems.push({
        url: `/gallery/${webpName}`,
        caption,
        displayOrder: i + 1,
      });

      console.log(
        `[${i + 1}/${imageFiles.length}] ${rawFile} -> ${webpName} ` +
          `(${Math.round(origStat.size / 1024)}KB -> ${Math.round(info.size / 1024)}KB)`
      );
    } catch (err) {
      console.error(`Error processing ${rawFile}:`, err);
    }
  }

  const originalMB = (totalOriginalBytes / 1024 / 1024).toFixed(2);
  const webpMB = (totalWebpBytes / 1024 / 1024).toFixed(2);
  const savingsPct = (((totalOriginalBytes - totalWebpBytes) / totalOriginalBytes) * 100).toFixed(1);

  console.log("\n--- Compression Summary ---");
  console.log(`Original total size: ${originalMB} MB`);
  console.log(`Optimized WebP size: ${webpMB} MB`);
  console.log(`Total space saved:   ${savingsPct}% reduction!\n`);

  console.log("Updating Supabase GalleryItem records...");
  // Clear old gallery items
  await prisma.galleryItem.deleteMany({});
  console.log("Cleared old GalleryItem rows.");

  // Bulk create the new gallery items
  await prisma.galleryItem.createMany({
    data: processedItems.map((item) => ({
      url: item.url,
      caption: item.caption,
      type: "image",
      year: 2026,
      displayOrder: item.displayOrder,
      isPublished: true,
      eventId: eventId,
    })),
  });

  const finalCount = await prisma.galleryItem.count();
  console.log(`Successfully ingested ${finalCount} items into Supabase GalleryItem table!`);
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
