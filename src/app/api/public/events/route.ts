import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: { in: ["upcoming", "ongoing"] } },
      select: { id: true, name: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
