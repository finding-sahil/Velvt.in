import { redirect } from "next/navigation";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getSession } from "@/lib/auth";
import { adminPath } from "@/lib/admin-path";
import { MediaLibraryManager, MediaItem } from "./MediaLibraryManager";

export const metadata = {
  title: "Media Library | VELVT Admin",
};

export default async function MediaLibraryPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminPath("/login"));
  }

  const items: MediaItem[] = [];

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
        // Skip hidden files or system files
        if (file.startsWith(".")) continue;

        const ext = path.extname(file).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
          continue;
        }

        const filePath = path.join(dirPath, file);
        const fileStat = await stat(filePath);

        items.push({
          id: `${category}-${file}`,
          name: file,
          url: `/${relativeFolder}/${file}`,
          size: fileStat.size,
          category,
          modifiedAt: fileStat.mtime.toISOString(),
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
      });
    } catch (e) {}
  }

  // Sort by modification time descending
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
