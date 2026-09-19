import { PrismaClient } from "@prisma/client";

// Resolve database URL from standard DATABASE_URL or Vercel-Supabase integration variables
const resolvedDbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
    ? process.env.DATABASE_URL
    : process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "";

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL = resolvedDbUrl || "postgresql://postgres:postgres@localhost:5432/postgres";
}

const resolvedDirectUrl =
  process.env.DIRECT_URL && process.env.DIRECT_URL.trim() !== ""
    ? process.env.DIRECT_URL
    : process.env.POSTGRES_URL_NON_POOLING || "";

if (!process.env.DIRECT_URL || process.env.DIRECT_URL.trim() === "") {
  process.env.DIRECT_URL = resolvedDirectUrl || "postgresql://postgres:postgres@localhost:5432/postgres";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let tunedDbUrl = resolvedDbUrl;
if (tunedDbUrl && tunedDbUrl.includes("pgbouncer=true") && !tunedDbUrl.includes("connection_limit")) {
  tunedDbUrl += tunedDbUrl.includes("?") ? "&connection_limit=5&pool_timeout=15" : "?connection_limit=5&pool_timeout=15";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ]
        : ["error"],
    datasources: tunedDbUrl
      ? {
          db: {
            url: tunedDbUrl,
          },
        }
      : undefined,
  });

globalForPrisma.prisma = prisma;

