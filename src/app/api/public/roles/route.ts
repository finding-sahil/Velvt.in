import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "volunteer_roles" },
    });
    const roles = setting ? JSON.parse(setting.value) : [];
    return NextResponse.json({ roles });
  } catch {
    return NextResponse.json({ roles: [] });
  }
}
