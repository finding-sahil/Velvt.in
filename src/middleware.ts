// VELVT — Edge Middleware
// Route protection, security headers, and admin path obfuscation

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PREFIX = process.env.ADMIN_ROUTE_PREFIX || "/velvt-management";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security Headers ──────────────────────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Cross-Origin-Opener-Policy for origin isolation (Lighthouse security audit)
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  // Basic Content-Security-Policy (permissive enough for the app's needs)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // ─── Block source maps in production ────────────────────────────────────────
  if (
    process.env.NODE_ENV === "production" &&
    pathname.endsWith(".map")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // ─── Block old /admin route — return 404, don't reveal anything ──────────
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  // ─── Protect admin management routes ────────────────────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    // Add robots blocking header for admin routes
    response.headers.set("X-Robots-Tag", "noindex, nofollow");

    // Allow login page without auth
    if (pathname === `${ADMIN_PREFIX}/login`) {
      return response;
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get("velvt_admin_session");

    if (!sessionCookie?.value) {
      // Redirect to admin login page
      const loginUrl = new URL(`${ADMIN_PREFIX}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Basic session format validation (token|userId|hash|timestamp)
    const parts = sessionCookie.value.split("|");
    if (parts.length !== 4) {
      const loginUrl = new URL(`${ADMIN_PREFIX}/login`, request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("velvt_admin_session");
      return res;
    }

    // Check session timestamp hasn't expired (7 days)
    const timestamp = parseInt(parts[3], 10);
    const maxAge = 60 * 60 * 24 * 7 * 1000; // 7 days in ms
    if (isNaN(timestamp) || Date.now() - timestamp > maxAge) {
      // Expired — clear cookie and redirect to login
      const loginUrl = new URL(`${ADMIN_PREFIX}/login`, request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("velvt_admin_session");
      return res;
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets and internals
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
