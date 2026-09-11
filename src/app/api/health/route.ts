import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const maskedUrl = dbUrl ? dbUrl.replace(/:([^:@]+)@/, ":****@") : "NOT_SET";

  try {
    const eventCount = await prisma.event.count();
    const adminCount = await prisma.adminUser.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      eventCount,
      adminCount,
      dbHost: maskedUrl.includes("@") ? maskedUrl.split("@")[1] : "not_specified",
      adminPrefix: process.env.ADMIN_ROUTE_PREFIX || "default",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        database: "connection_failed",
        errorName: error?.name,
        errorMessage: error?.message,
        dbHost: maskedUrl.includes("@") ? maskedUrl.split("@")[1] : "not_specified",
        hasDbUrl: Boolean(process.env.DATABASE_URL),
        hasDirectUrl: Boolean(process.env.DIRECT_URL),
      },
      { status: 500 }
    );
  }
}
