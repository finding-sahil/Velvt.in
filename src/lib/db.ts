import { PrismaClient } from "@prisma/client";

// Resolve database URL from standard DATABASE_URL or Vercel-Supabase integration variables
const resolvedDbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
    ? process.env.DATABASE_URL
    : process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "";

if (resolvedDbUrl && (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "")) {
  process.env.DATABASE_URL = resolvedDbUrl;
}

const resolvedDirectUrl =
  process.env.DIRECT_URL && process.env.DIRECT_URL.trim() !== ""
    ? process.env.DIRECT_URL
    : process.env.POSTGRES_URL_NON_POOLING || "";

if (resolvedDirectUrl && (!process.env.DIRECT_URL || process.env.DIRECT_URL.trim() === "")) {
  process.env.DIRECT_URL = resolvedDirectUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedDbUrl
      ? {
          db: {
            url: resolvedDbUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

