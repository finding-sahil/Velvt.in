import { unstable_cache, revalidateTag, updateTag } from "next/cache";
import { prisma } from "@/lib/db";

/**
 * Cached site settings provider.
 * Uses Next.js data cache with ISR tag 'site-settings'.
 * Deduplicates repeated queries across RootLayout, Footer, PageStatusGate, and individual page sections.
 */
export const getCachedSiteSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const settingsList = await prisma.siteSetting.findMany();
      const settings: Record<string, string> = {};
      for (const s of settingsList) {
        settings[s.key] = s.value;
      }
      return settings;
    } catch {
      return {};
    }
  },
  ["site-settings-map"],
  {
    revalidate: 120, // 2 minutes background ISR
    tags: ["site-settings"],
  }
);

/**
 * Purge cached site settings across all server components and routes.
 */
export function revalidateSiteSettings() {
  try {
    if (typeof updateTag === "function") {
      updateTag("site-settings");
    } else {
      revalidateTag("site-settings", "max");
    }
  } catch {
    try {
      revalidateTag("site-settings", "max");
    } catch {
      // Graceful fallback outside request context
    }
  }
}
