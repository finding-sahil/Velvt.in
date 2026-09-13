// VELVT — Server-Side Rate Limiter
// In-memory sliding window rate limiter
// For production with multiple instances, replace with Redis (e.g. Upstash)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000); // Clean every minute
  // Don't prevent Node.js process from exiting (important for serverless/dev)
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

/**
 * Check rate limit for a given identifier (usually IP + action)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  // No existing entry or window expired — allow
  if (!entry || now > entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowSeconds * 1000,
    };
  }

  // Within window — check count
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Rate limited
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return {
    success: false,
    remaining: 0,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

/**
 * Reset rate limits. If prefix is provided, removes matching keys.
 * If no prefix is provided, clears all rate limits across the system.
 */
export function resetRateLimits(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix) || key === prefix) {
      store.delete(key);
    }
  }
}

// ─── Pre-configured Rate Limiters ──────────────────────────────────────────────

export const RATE_LIMITS = {
  /** Admin login: 5 attempts per 15 minutes */
  adminLogin: { maxRequests: 5, windowSeconds: 900 },
  /** Volunteer registration: 3 per 10 minutes */
  volunteerRegistration: { maxRequests: 3, windowSeconds: 600 },
  /** Contact form: 5 per 10 minutes */
  contactForm: { maxRequests: 5, windowSeconds: 600 },
  /** Verification lookup: 20 per minute */
  verification: { maxRequests: 20, windowSeconds: 60 },
  /** File upload: 10 per 5 minutes */
  upload: { maxRequests: 10, windowSeconds: 300 },
  /** Public API: 60 per minute */
  publicApi: { maxRequests: 60, windowSeconds: 60 },
  /** Sponsor inquiry: 5 per 15 minutes */
  sponsorInquiry: { maxRequests: 5, windowSeconds: 900 },
  /** Newsletter subscription: 5 per 10 minutes */
  newsletter: { maxRequests: 5, windowSeconds: 600 },
} as const;

/**
 * Extract a client identifier from headers for rate limiting.
 * Uses X-Forwarded-For (set by proxies/Vercel) or falls back to a default.
 */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown-client";
}
