import { redirect } from "next/navigation";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { adminPath } from "@/lib/admin-path";
import { prisma } from "@/lib/db";
import { MediaLibraryManager, MediaItem } from "./MediaLibraryManager";

export const metadata = {
  title: "Media Library | VELVT Admin",
};

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminPath("/login"));
  }

  // 1. Query all database records that reference media assets
  const [events, teamMembers, partners, galleryItems, testimonials, siteSettings] = await Promise.all([
    prisma.event.findMany({ select: { id: true, name: true, coverImage: true } }).catch(() => []),
    prisma.teamMember.findMany({ select: { id: true, name: true, portrait: true } }).catch(() => []),
    prisma.partner.findMany({ select: { id: true, name: true, logo: true } }).catch(() => []),
    prisma.galleryItem.findMany({ select: { id: true, caption: true, url: true } }).catch(() => []),
    prisma.testimonial.findMany({ select: { id: true, authorName: true, avatarUrl: true } }).catch(() => []),
    prisma.siteSetting.findMany({ select: { key: true, value: true } }).catch(() => []),
  ]);

  // 2. Build normalized usage dictionary
  const usageMap = new Map<string, string[]>();

  const registerUsage = (rawUrl: string | null | undefined, label: string) => {
    if (!rawUrl || typeof rawUrl !== "string") return;
    const trimmed = rawUrl.trim();
    if (!trimmed) return;

    // Extract filename and pathname
    const cleanPath = trimmed.split("?")[0];
    const filename = path.basename(cleanPath);
    const normalized = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    const keys = [normalized, cleanPath, filename, decodeURIComponent(filename)];

    for (const key of keys) {
      if (!key) continue;
      const existing = usageMap.get(key) || [];
      if (!existing.includes(label)) {
        existing.push(label);
        usageMap.set(key, existing);
      }
    }
  };

  // Populate usage from events
  for (const ev of events) {
    registerUsage(ev.coverImage, `Event Cover: ${ev.name}`);
  }

  // Populate usage from team members
  for (const tm of teamMembers) {
    registerUsage(tm.portrait, `Team Portrait: ${tm.name}`);
  }

  // Populate usage from partners
  for (const p of partners) {
    registerUsage(p.logo, `Partner Logo: ${p.name}`);
  }

  // Populate usage from gallery
  for (const g of galleryItems) {
    registerUsage(g.url, `Gallery: ${g.caption || "Exhibition Photo"}`);
  }

  // Populate usage from testimonials
  for (const t of testimonials) {
    registerUsage(t.avatarUrl, `Testimonial Avatar: ${t.authorName}`);
  }

  // Populate usage from site settings (e.g. hero, linktree avatar, etc.)
  for (const s of siteSettings) {
    if (s.value && (s.value.includes("/") || s.value.includes("."))) {
      if (s.key === "linktree_config") {
        try {
          const parsed = JSON.parse(s.value);
          if (parsed.avatarUrl) registerUsage(parsed.avatarUrl, "Link Tree Avatar");
        } catch {}
      } else if (s.value.startsWith("/") || s.value.startsWith("http")) {
        registerUsage(s.value, `CMS Setting: ${s.key}`);
      }
    }
  }

  // Protect system branding files by default
  registerUsage("/logo.png", "Core Brand Logo");
  registerUsage("logo.png", "Core Brand Logo");

  const items: MediaItem[] = [];

  // Helper to check if an unreferenced file is considered cache or clutter
  const isClutterFile = (filename: string, relativeFolder: string): boolean => {
    const lower = filename.toLowerCase();
    // Timestamped or hash-generated upload patterns (e.g. name-1789134742513-x3akg.png or Screenshot_...)
    if (/\d{10,}/.test(filename)) return true;
    if (lower.startsWith("screenshot_") || lower.startsWith("chatgpt_") || lower.startsWith("tmp-") || lower.startsWith("temp-")) {
      return true;
    }
    // Orphaned upload files that were never attached to any event or profile
    if (relativeFolder === "uploads") return true;
    return false;
  };

  // Helper to read a directory of assets
  const scanDirectory = async (
    relativeFolder: string,
    category: "upload" | "gallery" | "brand"
  ) => {
    const dirPath = path.join(process.cwd(), "public", relativeFolder);
    if (!existsSync(dirPath)) return;

    try {
      const files = await readdir(dirPath);
      for (const file of files) {
        if (file.startsWith(".")) continue;

        const ext = path.extname(file).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
          continue;
        }

        const filePath = path.join(dirPath, file);
        const fileStat = await stat(filePath);
        const url = `/${relativeFolder}/${file}`;

        // Look up usages
        const directMatches = usageMap.get(url) || usageMap.get(file) || [];
        const isInUse = directMatches.length > 0;
        const isClutter = !isInUse && isClutterFile(file, relativeFolder);

        const usageStatus: "in_use" | "not_in_use" | "cache_clutter" = isInUse
          ? "in_use"
          : isClutter
          ? "cache_clutter"
          : "not_in_use";

        items.push({
          id: `${category}-${file}`,
          name: file,
          url,
          size: fileStat.size,
          category,
          modifiedAt: fileStat.mtime.toISOString(),
          usageStatus,
          usedIn: directMatches,
        });
      }
    } catch (err) {
      console.warn(`Failed to scan media directory ${relativeFolder}:`, err);
    }
  };

  // Scan uploads, gallery, and images
  await scanDirectory("uploads", "upload");
  await scanDirectory("gallery", "gallery");
  await scanDirectory("images", "brand");

  // Also include root logo if present
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (existsSync(logoPath)) {
    try {
      const s = await stat(logoPath);
      items.push({
        id: "brand-logo",
        name: "logo.png",
        url: "/logo.png",
        size: s.size,
        category: "brand",
        modifiedAt: s.mtime.toISOString(),
        usageStatus: "in_use",
        usedIn: ["Core Brand Logo"],
      });
    } catch (e) {}
  }

  // Sort: Clutter and Not in use first, or by modification time descending
  items.sort((a, b) => {
    const timeA = a.modifiedAt ? new Date(a.modifiedAt).getTime() : 0;
    const timeB = b.modifiedAt ? new Date(b.modifiedAt).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="space-y-6">
      <MediaLibraryManager initialItems={items} />
    </div>
  );
}
