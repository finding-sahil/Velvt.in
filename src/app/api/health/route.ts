import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession().catch(() => null);
  const isAdmin = Boolean(
    session && (session.user.role === "admin" || session.user.role === "founder")
  );

  try {
    const [eventCount, adminCount] = await Promise.all([
      prisma.event.count(),
      prisma.adminUser.count(),
    ]);

    if (!isAdmin) {
      return NextResponse.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }

    const dbUrl =
      process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
        ? process.env.DATABASE_URL
        : process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "";
    const maskedUrl = dbUrl ? dbUrl.replace(/:([^:@]+)@/, ":****@") : "NOT_SET";

    return NextResponse.json({
      status: "ok",
      database: "connected",
      eventCount,
      adminCount,
      dbHost: maskedUrl.includes("@") ? maskedUrl.split("@")[1] : "not_specified",
      resolvedSource: process.env.DATABASE_URL
        ? "DATABASE_URL"
        : process.env.POSTGRES_PRISMA_URL
        ? "POSTGRES_PRISMA_URL"
        : "POSTGRES_URL",
    });
  } catch (error: any) {
    if (!isAdmin) {
      return NextResponse.json(
        { status: "degraded", timestamp: new Date().toISOString() },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        database: "connection_failed",
        errorName: error?.name,
        errorMessage: error?.message,
        hasDbUrl: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""),
        hasDirectUrl: Boolean(process.env.DIRECT_URL && process.env.DIRECT_URL.trim() !== ""),
      },
      { status: 500 }
    );
  }
}
