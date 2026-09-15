import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "volunteer_roles" },
    });
    const roles = setting ? JSON.parse(setting.value) : [];
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

