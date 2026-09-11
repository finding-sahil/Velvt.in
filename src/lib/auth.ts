// VELVET — Authentication Utilities
// Session-based auth using PBKDF2 password hashing + signed cookies

import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE = "velvet_admin_session";
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "velvet-dev-secret";
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
    return computedHex === hash;
  }
}

// ─── Session Management ────────────────────────────────────────────────────────

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + SESSION_SECRET);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomUUID();
  const sessionHash = await hashToken(token);
  const timestamp = Date.now();

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

export async function getSession(): Promise<{
  userId: string;
  user: { id: string; email: string; name: string };
} | null> {
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

    // Verify the token hash
    const computedHash = await hashToken(token);
    if (computedHash.length !== storedHash.length) return null;
    let diff = 0;
    for (let i = 0; i < computedHash.length; i++) {
      diff |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    if (diff !== 0) return null;

    // Verify user exists
    const user = await prisma.adminUser.findUnique({
      where: { id: storedUserId },
      select: { id: true, email: true, name: true },
    });

    if (!user) return null;

    return { userId: user.id, user };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
