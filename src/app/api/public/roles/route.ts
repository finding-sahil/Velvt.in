import { NextResponse } from "next/server";
import { getCachedSiteSettings } from "@/lib/settings-cache";

export const revalidate = 300;

export async function GET() {
  try {
    const settings = await getCachedSiteSettings();
    const rawRoles = settings.volunteer_roles;
    const roles = rawRoles ? JSON.parse(rawRoles) : [];
    return NextResponse.json(
      { roles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ roles: [] });
  }
}

