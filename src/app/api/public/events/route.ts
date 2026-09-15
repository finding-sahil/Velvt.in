import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: { in: ["upcoming", "ongoing"] } },
      select: { id: true, name: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ events: [] });
  }
}

