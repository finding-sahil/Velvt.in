// VELVT — Audit Logging System
// Records administrative actions and security events securely

import { prisma } from "./db";
import { getSession } from "./auth";
import { headers } from "next/headers";
import { getClientIdentifier } from "./rate-limit";

interface AuditEventParams {
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  actor?: { id: string; email: string } | null;
  ipAddress?: string;
}

// Sanitize metadata to prevent accidental secret or password leaks
function sanitizeMetadata(data?: Record<string, any>): string | null {
  if (!data) return null;
  const sanitized: Record<string, any> = {};

  const sensitiveKeys = [
    "password",
    "passwordHash",
    "token",
    "secret",
    "key",
    "cookie",
    "authorization",
  ];

  for (const [k, v] of Object.entries(data)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      sanitized[k] = "[REDACTED]";
    } else {
      sanitized[k] = v;
    }
  }

  return JSON.stringify(sanitized);
}

export async function logAuditEvent({
  action,
  targetType,
  targetId,
  metadata,
  actor,
  ipAddress,
}: AuditEventParams): Promise<void> {
  try {
    let resolvedActor = actor;
    if (resolvedActor === undefined) {
      const session = await getSession();
      resolvedActor = session ? { id: session.userId, email: session.user.email } : null;
    }

    let resolvedIp = ipAddress;
    if (!resolvedIp) {
      try {
        const hdrs = await headers();
        resolvedIp = getClientIdentifier(hdrs);
      } catch {
        resolvedIp = "internal";
      }
    }

    await prisma.auditLog.create({
      data: {
        action,
        actorId: resolvedActor?.id || null,
        actorEmail: resolvedActor?.email || "anonymous",
        targetType: targetType || null,
        targetId: targetId || null,
        metadata: sanitizeMetadata(metadata),
        ipAddress: resolvedIp || null,
      },
    });
  } catch (error) {
    // Non-blocking: Audit failure should not crash primary operations, but should log to stderr
    console.error("[AuditLog Error]: Failed to write audit log:", error);
  }
}
