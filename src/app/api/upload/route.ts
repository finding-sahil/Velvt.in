// VELVT — Secure File Upload Endpoint
// Auth-protected, rate-limited, with file validation

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { cookies } from "next/headers";
import sharp from "sharp";
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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const purpose = formData.get("purpose") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // ─── Auth Check ──────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("velvt_admin_session");
    const isAdmin = Boolean(sessionCookie?.value && sessionCookie.value.split("|").length === 4);

    // If not admin, the only permitted upload is a volunteer badge photo
    const isVolunteerBadge = purpose === "volunteer-badge";

    if (!isAdmin && !isVolunteerBadge) {
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

    const rateKey = isAdmin ? `upload:admin:${ip}` : `upload:volunteer:${ip}`;
    const rateConfig = isAdmin
      ? RATE_LIMITS.upload
      : { maxRequests: 3, windowSeconds: 10 * 60 }; // 3 per 10 mins for applicants

    const rateLimitResult = checkRateLimit(rateKey, rateConfig);
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

    // ─── File Validation ──────────────────────────────────────────────────
    // Validate mime type (SVG strictly forbidden — XSS vector)
    const validMimes = isAdmin
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["image/jpeg", "image/png", "image/webp"]; // No GIF for badge photos

    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP." },
        { status: 400 }
      );
    }

    // Validate size: 10MB raw limit (sharp will compress it down significantly)
    const MAX_SIZE = isAdmin ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const maxMb = isAdmin ? "10MB" : "5MB";
      return NextResponse.json(
        { success: false, error: `File size exceeds ${maxMb} limit.` },
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

    // ─── WebP Conversion & Compression Pipeline ───────────────────────────
    // Downscale oversized images while preserving retina clarity (1920px max for admin, 1000px for badge)
    const maxDimension = isVolunteerBadge ? 1000 : 1920;
    const webpBuffer = await sharp(buffer)
      .rotate() // Auto-orient phone camera photos via EXIF
      .resize(maxDimension, maxDimension, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    // Generate clean unique filename with .webp extension
    const cleanBase = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_{2,}/g, "_")
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const filename = `${cleanBase}-${uniqueSuffix}.webp`;

    // Path traversal protection — ensure final path is within uploads dir
    const filePath = path.resolve(uploadsDir, filename);
    if (!filePath.startsWith(path.resolve(uploadsDir))) {
      return NextResponse.json(
        { success: false, error: "Invalid filename." },
        { status: 400 }
      );
    }

    await writeFile(filePath, webpBuffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      originalSize: file.size,
      compressedSize: webpBuffer.length,
      format: "webp",
    });
  } catch (error) {
    console.error("Upload error occurred:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process and optimize image upload." },
      { status: 500 }
    );
  }
}
