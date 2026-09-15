// VELVT — Authentication Utilities
// Session-based auth using PBKDF2 password hashing + signed cookies

import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./db";

const SESSION_COOKIE = "velvt_admin_session";
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "velvt-dev-secret";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── PBKDF2 Password Hashing ──────────────────────────────────────────────────

/**
 * Hash a password using PBKDF2 with a random salt.
 * Format: `pbkdf2:iterations:salt:hash` (all hex-encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const iterations = 100000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `pbkdf2:${iterations}:${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash.
 * Supports both PBKDF2 and legacy SHA-256 formats for migration.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (storedHash.startsWith("pbkdf2:")) {
    // New PBKDF2 format
    const parts = storedHash.split(":");
    if (parts.length !== 4) return false;

    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const expectedHashHex = parts[3];

    const salt = new Uint8Array(
      saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const computedHex = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    if (computedHex.length !== expectedHashHex.length) return false;
    let diff = 0;
    for (let i = 0; i < computedHex.length; i++) {
      diff |= computedHex.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
    }
    return diff === 0;
  } else {
    // Legacy SHA-256 format: salt:hash
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;

    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const computedHash = await crypto.subtle.digest("SHA-256", data);
    const computedHex = Array.from(new Uint8Array(computedHash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return constantTimeEqual(computedHex, hash);
  }
}

// ─── Session Management ────────────────────────────────────────────────────────

async function hashToken(
  token: string,
  userId: string,
  timestamp: string | number
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${token}|${userId}|${timestamp}|${SESSION_SECRET}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Fallback verification for sessions created prior to HMAC binding
async function hashTokenLegacy(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + SESSION_SECRET);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomUUID();
  const timestamp = Date.now();
  const sessionHash = await hashToken(token, userId, timestamp);

  // Cookie value format: token|userId|sessionHash|timestamp
  const sessionValue = `${token}|${userId}|${sessionHash}|${timestamp}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  assignedEventId: string | null;
  teamMemberId: string | null;
  isActive: boolean;
}

export interface SessionData {
  userId: string;
  user: SessionUser;
}

export const getSession = cache(async (): Promise<SessionData | null> => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) return null;

    const parts = sessionCookie.value.split("|");
    if (parts.length !== 4) return null;

    const [token, storedUserId, storedHash, timestampStr] = parts;
    if (!token || !storedUserId || !storedHash || !timestampStr) return null;

    // Check session expiry
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE * 1000) {
      return null;
    }

    // Verify the token hash (checks bound signature first, falls back to legacy)
    const computedHash = await hashToken(token, storedUserId, timestampStr);
    const legacyHash = await hashTokenLegacy(token);

    const isValid =
      constantTimeEqual(computedHash, storedHash) ||
      constantTimeEqual(legacyHash, storedHash);

    if (!isValid) return null;

    // Verify user exists and is active
    const user = await prisma.adminUser.findUnique({
      where: { id: storedUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedEventId: true,
        teamMemberId: true,
        isActive: true,
      },
    });

    if (!user || user.isActive === false) return null;

    return { userId: user.id, user };
  } catch {
    return null;
  }
});

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "admin" && session.user.role !== "founder") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function requireFounder() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "founder") {
    throw new Error("Unauthorized: Founder access required");
  }
  return session;
}

export async function requireStaffOrAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const allowed = ["founder", "admin", "core_team"];
  if (!allowed.includes(session.user.role)) {
    throw new Error("Unauthorized: Staff access required");
  }
  return session;
}

export async function requireGatemanOrAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Gatekeeper or Admin login required");
  }
  const allowed = ["founder", "admin", "core_team", "gateman"];
  if (!allowed.includes(session.user.role)) {
    throw new Error("Unauthorized: Gatekeeper access required");
  }
  return session;
}

export const ROOT_ADMIN_EMAIL = "admin@velvt.in";

/**
 * Checks if a user is the root system administrator.
 * Root admin has master system authority and is kept strictly invisible from founder and core team views.
 */
export function isRootAdmin(user?: { email?: string; role?: string } | null): boolean {
  if (!user?.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === ROOT_ADMIN_EMAIL || (user.role === "admin" && email.startsWith("admin@"));
}

