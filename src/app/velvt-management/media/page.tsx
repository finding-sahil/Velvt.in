import { redirect } from "next/navigation";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { adminPath } from "@/lib/admin-path";
import { prisma } from "@/lib/db";
import { getCachedSiteSettings } from "@/lib/settings-cache";
import { MediaLibraryManager, MediaItem } from "./MediaLibraryManager";

export const metadata = {
  title: "Media Library | VELVT Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MediaLibraryPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminPath("/login"));
  }

  // 1. Query all database records that reference media assets
  const [
    events,
    teamMembers,
    partners,
    galleryItems,
    testimonials,
    volunteers,
    venues,
    pressMentions,
    siteSettings,
  ] = await Promise.all([
    prisma.event.findMany({ select: { id: true, name: true, coverImage: true } }).catch(() => []),
    prisma.teamMember.findMany({ select: { id: true, name: true, portrait: true } }).catch(() => []),
    prisma.partner.findMany({ select: { id: true, name: true, logo: true } }).catch(() => []),
    prisma.galleryItem.findMany({ select: { id: true, caption: true, url: true } }).catch(() => []),
    prisma.testimonial.findMany({ select: { id: true, authorName: true, avatarUrl: true } }).catch(() => []),
    prisma.volunteer.findMany({ select: { id: true, fullName: true, photo: true } }).catch(() => []),
    prisma.venue.findMany({ select: { id: true, name: true, image: true } }).catch(() => []),
    prisma.pressMention.findMany({ select: { id: true, publication: true, logo: true } }).catch(() => []),
    getCachedSiteSettings(),
  ]);

  // 2. Build normalized usage dictionary
  const usageMap = new Map<string, string[]>();

  const registerUsage = (rawUrl: string | null | undefined, label: string) => {
    if (!rawUrl || typeof rawUrl !== "string") return;
    const trimmed = rawUrl.trim();
    if (!trimmed) return;

    // Extract filename and pathname
    const cleanPath = trimmed.split("?")[0].split("#")[0];
    const filename = path.basename(cleanPath);
    const decodedFilename = decodeURIComponent(filename);
    const normalized = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    const keys = [normalized, cleanPath, filename, decodedFilename, trimmed];

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

  // Populate usage from volunteers
  for (const v of volunteers) {
    registerUsage(v.photo, `Volunteer Badge: ${v.fullName}`);
  }

  // Populate usage from venues
  for (const vn of venues) {
    registerUsage(vn.image, `Venue Photo: ${vn.name}`);
  }

  // Populate usage from press mentions
  for (const pm of pressMentions) {
    registerUsage(pm.logo, `Press Logo: ${pm.publication}`);
  }

  // Populate usage from site settings (e.g. hero, linktree avatar, etc.)
  for (const [key, val] of Object.entries(siteSettings)) {
    if (val && (val.includes("/") || val.includes("."))) {
      if (key === "linktree_config") {
        try {
          const parsed = JSON.parse(val);
          if (parsed.avatarUrl) registerUsage(parsed.avatarUrl, "Link Tree Avatar");
          if (parsed.desktopBackgroundUrl) registerUsage(parsed.desktopBackgroundUrl, "Link Tree Desktop BG");
          if (parsed.mobileBackgroundUrl) registerUsage(parsed.mobileBackgroundUrl, "Link Tree Mobile BG");
        } catch {}
      } else if (val.startsWith("/") || val.startsWith("http")) {
        registerUsage(val, `CMS Setting: ${key}`);
      }
    }
  }

  // Protect system branding files by default
  registerUsage("/logo.png", "Core Brand Logo");
  registerUsage("logo.png", "Core Brand Logo");

  const itemsMap = new Map<string, MediaItem>();

  // Helper to check if an unreferenced file is considered cache or clutter
  const isClutterFile = (filename: string, relativeFolder: string): boolean => {
    const lower = filename.toLowerCase();
    // Timestamped or hash-generated upload patterns (e.g. name-1789134742513-x3akg.png or Screenshot_...)
    if (/\d{10,}/.test(filename)) return true;
    if (
      lower.startsWith("screenshot_") ||
      lower.startsWith("chatgpt_") ||
      lower.startsWith("tmp-") ||
      lower.startsWith("temp-")
    ) {
      return true;
    }
    // Orphaned upload files that were never attached to any event or profile
    if (relativeFolder === "uploads") return true;
    return false;
  };

  // 3. Fetch objects directly from Supabase Storage 'uploads' bucket with strict timeout
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(`${supabaseUrl}/storage/v1/object/list/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix: "",
          limit: 500,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        }),
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const files = await res.json();
        if (Array.isArray(files)) {
          for (const file of files) {
            if (!file?.name || file.name.startsWith(".")) continue;

            const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${file.name}`;
            const directMatches =
              usageMap.get(publicUrl) ||
              usageMap.get(file.name) ||
              usageMap.get(`/uploads/${file.name}`) ||
              [];
            const isInUse = directMatches.length > 0;
            const isClutter = !isInUse && isClutterFile(file.name, "uploads");

            const usageStatus: "in_use" | "not_in_use" | "cache_clutter" = isInUse
              ? "in_use"
              : isClutter
              ? "cache_clutter"
              : "not_in_use";

            itemsMap.set(file.name, {
              id: `supabase-${file.name}`,
              name: file.name,
              url: publicUrl,
              size: file.metadata?.size || file.metadata?.contentLength || 0,
              category: "upload",
              modifiedAt: file.updated_at || file.created_at || new Date().toISOString(),
              usageStatus,
              usedIn: directMatches,
            });
          }
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Supabase storage list skipped or timed out:", err);
    }
  }

  // 4. Helper to scan local filesystem folders in parallel
  const scanDirectory = async (
    relativeFolder: string,
    category: "upload" | "gallery" | "brand"
  ) => {
    const dirPath = path.join(process.cwd(), "public", relativeFolder);
    if (!existsSync(dirPath)) return;

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      const imageEntries = entries.filter((ent) => {
        if (!ent.isFile() || ent.name.startsWith(".")) return false;
        const ext = path.extname(ent.name).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext);
      });

      await Promise.all(
        imageEntries.map(async (ent) => {
          const file = ent.name;
          const filePath = path.join(dirPath, file);
          let fileSize = 0;
          let fileMtime = new Date().toISOString();
          try {
            const fileStat = await stat(filePath);
            fileSize = fileStat.size;
            fileMtime = fileStat.mtime.toISOString();
          } catch {}

          const url = `/${relativeFolder}/${file}`;

          // Look up usages
          const directMatches =
            usageMap.get(url) ||
            usageMap.get(file) ||
            usageMap.get(decodeURIComponent(file)) ||
            [];
          const isInUse = directMatches.length > 0;
          const isClutter = !isInUse && isClutterFile(file, relativeFolder);

          const usageStatus: "in_use" | "not_in_use" | "cache_clutter" = isInUse
            ? "in_use"
            : isClutter
            ? "cache_clutter"
            : "not_in_use";

          // If item was already found in Supabase Storage, update size if 0 or keep existing
          if (itemsMap.has(file)) {
            const existing = itemsMap.get(file)!;
            if (!existing.size && fileSize) {
              existing.size = fileSize;
            }
            if (directMatches.length > 0 && existing.usedIn.length === 0) {
              existing.usedIn = directMatches;
              existing.usageStatus = "in_use";
            }
          } else {
            itemsMap.set(file, {
              id: `${category}-${file}`,
              name: file,
              url,
              size: fileSize,
              category,
              modifiedAt: fileMtime,
              usageStatus,
              usedIn: directMatches,
            });
          }
        })
      );
    } catch (err) {
      console.warn(`Failed to scan media directory ${relativeFolder}:`, err);
    }
  };

  // Scan local uploads, gallery, and images concurrently
  await Promise.all([
    scanDirectory("uploads", "upload"),
    scanDirectory("gallery", "gallery"),
    scanDirectory("images", "brand"),
  ]);

  // Root brand logo if present
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (existsSync(logoPath) && !itemsMap.has("logo.png")) {
    try {
      const s = await stat(logoPath);
      itemsMap.set("logo.png", {
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

  // 5. Ingest any remaining database-referenced media URLs that aren't on disk or in list
  for (const [rawUrl, labels] of usageMap.entries()) {
    if (!rawUrl || (!rawUrl.startsWith("/") && !rawUrl.startsWith("http"))) continue;
    const clean = rawUrl.split("?")[0].split("#")[0];
    const filename = path.basename(clean);
    if (!filename || filename === "/" || itemsMap.has(filename)) continue;

    const isSupabaseUrl = rawUrl.includes("supabase.co");
    const category: "upload" | "gallery" | "brand" = rawUrl.includes("/gallery/")
      ? "gallery"
      : isSupabaseUrl || rawUrl.includes("/uploads/")
      ? "upload"
      : "brand";

    itemsMap.set(filename, {
      id: `db-${filename}`,
      name: filename,
      url: rawUrl,
      size: 0,
      category,
      modifiedAt: new Date().toISOString(),
      usageStatus: "in_use",
      usedIn: labels,
    });
  }

  const items = Array.from(itemsMap.values());

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
