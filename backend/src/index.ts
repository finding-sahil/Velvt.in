import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSupabase, Env } from "./supabase";

const app = new Hono<{ Bindings: Env }>();

// ─── Edge In-Memory Rate Limiter ─────────────────────────────────────────────
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count += 1;
  return false;
}

// ─── Security Headers & CORS Middleware ───────────────────────────────────────
app.use("*", async (c, next) => {
  const allowed = [
    "https://velvt.in",
    "https://www.velvt.in",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  const origin = c.req.header("origin");
  const isVercel = origin && (origin.endsWith(".vercel.app") || origin.endsWith("velvt.in"));
  const isAllowed = origin && (allowed.includes(origin) || isVercel);

  // Security Headers
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");

  const corsMiddleware = cors({
    origin: isAllowed ? origin : "https://velvt.in",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  });

  return corsMiddleware(c, next);
});

// ─── Health & Edge Diagnostics ───────────────────────────────────────────────
app.get("/", (c) => {
  const colo = (c.req.raw as any)?.cf?.colo || "edge";
  return c.json({
    service: "VELVT Edge Infrastructure",
    status: "online",
    edgeDatacenter: colo,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  const colo = (c.req.raw as any)?.cf?.colo || "edge";
  return c.json({
    status: "healthy",
    datacenter: colo,
    timestamp: new Date().toISOString(),
  });
});

// ─── Public Events (Edge Cached) ────────────────────────────────────────────
app.get("/api/events", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("Event")
      .select("id, name, slug, description, theme, coverImage, date, time, status, isFeatured, displayOrder")
      .in("status", ["upcoming", "ongoing"])
      .order("date", { ascending: true });

    if (error) {
      return c.json({ error: "Failed to fetch events" }, 500);
    }

    c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    return c.json({ events: data ?? [] });
  } catch {
    return c.json({ error: "Service temporarily unavailable" }, 500);
  }
});

// ─── Single Event Details ───────────────────────────────────────────────────
app.get("/api/events/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const supabase = getSupabase(c.env);

    const { data, error } = await supabase
      .from("Event")
      .select(`
        *,
        venue:Venue(*),
        ticketTypes:TicketType(*)
      `)
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return c.json({ error: "Event not found" }, 404);
    }

    c.header("Cache-Control", "public, max-age=60, s-maxage=180");
    return c.json({ event: data });
  } catch {
    return c.json({ error: "Service temporarily unavailable" }, 500);
  }
});

// ─── High-Speed Gate Ticket Check-in / Scanner ──────────────────────────────
// Validates and atomically marks a pass as checked in under 15ms
app.post("/api/tickets/verify", async (c) => {
  const clientIp = c.req.header("cf-connecting-ip") || "unknown";
  
  // Rate limit: 60 scans per minute per IP (prevents automated credential-stuffing)
  if (isRateLimited(`scan:${clientIp}`, 60, 60000)) {
    return c.json({ valid: false, error: "Scan rate limit exceeded. Please wait a moment." }, 429);
  }

  try {
    const body = await c.req.json<{ ticketIdentifier: string; checkedInBy?: string }>();
    const identifier = body.ticketIdentifier?.trim();

    if (!identifier) {
      return c.json({ valid: false, error: "Missing ticket identifier" }, 400);
    }

    const supabase = getSupabase(c.env, true); // Service role key for atomic CAS

    // 1. Fetch ticket by ticketNumber OR securityToken
    const { data: ticket, error } = await supabase
      .from("IssuedTicket")
      .select(`
        id,
        ticketNumber,
        attendeeName,
        attendeeEmail,
        tierName,
        status,
        isCheckedIn,
        checkedInAt,
        checkedInBy,
        event:Event(name, slug, date)
      `)
      .or(`ticketNumber.eq.${identifier},securityToken.eq.${identifier}`)
      .single();

    if (error || !ticket) {
      return c.json({
        valid: false,
        error: "Ticket not found or invalid QR code",
      }, 404);
    }

    // 2. Check if already checked in or revoked
    if (ticket.status !== "valid") {
      return c.json({
        valid: false,
        status: ticket.status,
        error: `Pass is ${ticket.status.toUpperCase()}`,
        ticket,
      });
    }

    if (ticket.isCheckedIn) {
      return c.json({
        valid: false,
        alreadyUsed: true,
        error: "DOUBLE ADMITTANCE: Pass has already been checked in!",
        checkedInAt: ticket.checkedInAt,
        checkedInBy: ticket.checkedInBy,
        ticket,
      });
    }

    // 3. Atomically check-in
    const now = new Date().toISOString();
    const gatekeeper = body.checkedInBy || "Edge Scanner";

    const { error: updateError } = await supabase
      .from("IssuedTicket")
      .update({
        isCheckedIn: true,
        checkedInAt: now,
        checkedInBy: gatekeeper,
        status: "used",
      })
      .eq("id", ticket.id)
      .eq("isCheckedIn", false); // CAS guard

    if (updateError) {
      return c.json({ valid: false, error: "Concurrently checked in on another scanner" }, 409);
    }

    return c.json({
      valid: true,
      success: true,
      message: "Admittance Approved",
      checkedInAt: now,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        tierName: ticket.tierName,
        event: ticket.event,
      },
    });
  } catch {
    return c.json({ valid: false, error: "Scanner verification failed" }, 500);
  }
});

// ─── Public Contact Inquiry Submissions ───────────────────────────────────────
app.post("/api/inquiries", async (c) => {
  const clientIp = c.req.header("cf-connecting-ip") || "unknown";

  // Rate limit: 5 inquiries per 10 minutes per IP
  if (isRateLimited(`inquiry:${clientIp}`, 5, 600000)) {
    return c.json({ error: "Too many inquiries submitted. Please try again later." }, 429);
  }

  try {
    const body = await c.req.json<{
      name: string;
      email: string;
      category?: string;
      message: string;
      phone?: string;
    }>();

    if (!body.name || !body.email || !body.message) {
      return c.json({ error: "Name, email, and message are required" }, 400);
    }

    const supabase = getSupabase(c.env, true);
    const { error } = await supabase.from("ContactInquiry").insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      category: body.category || "general",
      message: body.message.trim(),
      status: "new",
    });

    if (error) {
      return c.json({ error: "Failed to submit inquiry" }, 500);
    }

    return c.json({ success: true, message: "Inquiry received" });
  } catch {
    return c.json({ error: "Submission failed" }, 500);
  }
});

// ─── Volunteer Registration ──────────────────────────────────────────────────
app.post("/api/volunteers", async (c) => {
  const clientIp = c.req.header("cf-connecting-ip") || "unknown";

  // Rate limit: 3 applications per hour per IP
  if (isRateLimited(`volunteer:${clientIp}`, 3, 3600000)) {
    return c.json({ error: "Application limit reached. Please try again later." }, 429);
  }

  try {
    const body = await c.req.json<{
      fullName: string;
      email: string;
      phone: string;
      city: string;
      preferredRole: string;
      experience?: string;
      socialLink?: string;
      photo?: string;
      eventId: string;
    }>();

    if (!body.fullName || !body.email || !body.phone || !body.eventId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = getSupabase(c.env, true);

    // Generate readable volunteer ID
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const volunteerId = `VEL-${new Date().getFullYear()}-${randomHex}`;

    const { data, error } = await supabase
      .from("Volunteer")
      .insert({
        volunteerId,
        fullName: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        city: body.city || "Kolkata",
        preferredRole: body.preferredRole || "General Support",
        experience: body.experience || null,
        socialLink: body.socialLink || null,
        photo: body.photo || null,
        consentGiven: true,
        eventId: body.eventId,
        status: "pending",
      })
      .select("id, volunteerId")
      .single();

    if (error) {
      return c.json({ error: "Failed to submit application" }, 500);
    }

    return c.json({
      success: true,
      message: "Application submitted successfully",
      volunteer: data,
    });
  } catch {
    return c.json({ error: "Registration failed" }, 500);
  }
});

// ─── Gallery Listing ─────────────────────────────────────────────────────────
app.get("/api/gallery", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("GalleryItem")
      .select("id, url, caption, type, year, displayOrder")
      .eq("isPublished", true)
      .order("displayOrder", { ascending: true });

    if (error) {
      return c.json({ error: "Failed to fetch gallery" }, 500);
    }

    c.header("Cache-Control", "public, max-age=300, s-maxage=3600");
    return c.json({ items: data ?? [] });
  } catch {
    return c.json({ error: "Failed to fetch gallery" }, 500);
  }
});

// ─── Core Team Listing ───────────────────────────────────────────────────────
app.get("/api/team", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("TeamMember")
      .select("id, name, role, category, bio, portrait, portfolioUrl, quote, highlights, joinedYear, displayOrder")
      .eq("isPublished", true)
      .order("displayOrder", { ascending: true });

    if (error) {
      return c.json({ error: "Failed to fetch team" }, 500);
    }

    c.header("Cache-Control", "public, max-age=300, s-maxage=3600");
    return c.json({ team: data ?? [] });
  } catch {
    return c.json({ error: "Failed to fetch team" }, 500);
  }
});

export default app;
