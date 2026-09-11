import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl =
    process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
      ? process.env.DATABASE_URL
      : process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "";
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
      resolvedSource: process.env.DATABASE_URL
        ? "DATABASE_URL"
        : process.env.POSTGRES_PRISMA_URL
        ? "POSTGRES_PRISMA_URL"
        : "POSTGRES_URL",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        database: "connection_failed",
        errorName: error?.name,
        errorMessage: error?.message,
        dbHost: maskedUrl.includes("@") ? maskedUrl.split("@")[1] : "not_specified",
        hasDbUrl: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""),
        hasDirectUrl: Boolean(process.env.DIRECT_URL && process.env.DIRECT_URL.trim() !== ""),
        hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
        hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
      },
      { status: 500 }
    );
  }
}
