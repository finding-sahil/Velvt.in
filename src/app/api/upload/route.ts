// VELVET — Secure File Upload Endpoint
// Auth-protected, rate-limited, with file validation

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// File magic bytes for validation
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39], // GIF89a
  ],
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

export async function POST(req: NextRequest) {
  try {
    // ─── Auth Check ──────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("velvet_admin_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Basic session format check
    const sessionParts = sessionCookie.value.split("|");
    if (sessionParts.length !== 4) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ─── Rate Limiting ────────────────────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResult = checkRateLimit(`upload:${ip}`, RATE_LIMITS.upload);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Too many uploads. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds || 60),
          },
        }
      );
    }

    // ─── File Processing ──────────────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate mime type (SVG removed — XSS vector)
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes match claimed MIME type
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { success: false, error: "File content does not match its declared type." },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate clean unique filename — aggressive sanitization + path traversal protection
    const ext = path.extname(file.name).toLowerCase().replace(/[^a-z.]/g, "") || ".jpg";
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { success: false, error: "Invalid file extension." },
        { status: 400 }
      );
    }

    const cleanBase = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_{2,}/g, "_")
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const filename = `${cleanBase}-${uniqueSuffix}${ext}`;

    // Path traversal protection — ensure final path is within uploads dir
    const filePath = path.resolve(uploadsDir, filename);
    if (!filePath.startsWith(path.resolve(uploadsDir))) {
      return NextResponse.json(
        { success: false, error: "Invalid filename." },
        { status: 400 }
      );
    }

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch {
    console.error("Upload error occurred");
    return NextResponse.json(
      { success: false, error: "Failed to process upload." },
      { status: 500 }
    );
  }
}
