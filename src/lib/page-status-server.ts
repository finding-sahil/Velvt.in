import { CONTROLLED_PAGES, PageStatus } from "./page-status";
import { getCachedSiteSettings } from "./settings-cache";

export async function getPageStatus(pageKey: string): Promise<{
  status: PageStatus;
  customTitle?: string;
  customSubtitle?: string;
}> {
  const page = CONTROLLED_PAGES.find((p) => p.key === pageKey);
  const defaultStatus = page?.defaultStatus || "active";

  try {
    const settings = await getCachedSiteSettings();
    const statusVal = settings[`page_status_${pageKey}`];
    const titleVal = settings[`page_title_${pageKey}`];
    const subVal = settings[`page_sub_${pageKey}`];

    const status = (statusVal as PageStatus) || defaultStatus;

    return {
      status,
      customTitle: titleVal || undefined,
      customSubtitle: subVal || undefined,
    };
  } catch {
    return { status: defaultStatus };
  }
}
