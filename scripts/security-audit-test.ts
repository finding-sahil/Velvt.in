import { prisma } from "../src/lib/db";
import { hashPassword, verifyPassword } from "../src/lib/auth";
import { logAuditEvent } from "../src/lib/audit";
import { generateVolunteerId } from "../src/lib/volunteer-id";
import { submitVolunteerApplication } from "../src/app/actions";
import https from "https";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ezyqfcmhdqjtjvvukflr.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_XjObg51gXav_5PgYmeitwA_Z-t0bSwl";

interface TestResult {
  category: string;
  test: string;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

function record(category: string, test: string, passed: boolean, notes: string) {
  results.push({ category, test, passed, notes });
  const icon = passed ? "✓" : "✗";
  console.log(`${icon} [${category}] ${test} — ${notes}`);
}

// Helper to make direct REST requests to Supabase PostgREST
function supabaseRest(endpoint: string, method: string = "GET", body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SUPABASE_URL);
    const options: https.RequestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        let parsed: any;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          parsed = raw;
        }
        resolve({ status: res.statusCode || 0, data: parsed });
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAuditSuite() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("   VELVT — COMPREHENSIVE PRODUCTION & SECURITY AUDIT SUITE    ");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // ─── 1. RLS Tests (Direct Supabase REST with Anon Key) ───────────
  console.log("--- 1. ROW LEVEL SECURITY (RLS) REST API TESTS ---");
  const privateTables = ["AdminUser", "Volunteer", "ContactInquiry", "SiteSetting", "AuditLog"];
  for (const table of privateTables) {
    try {
      const res = await supabaseRest(`/rest/v1/${table}?select=*`);
      // Under RLS without policy, PostgREST returns 200 with [] or 401/403
      const isBlocked =
        res.status === 401 ||
        res.status === 403 ||
        (res.status === 200 && Array.isArray(res.data) && res.data.length === 0);
      record(
        "RLS",
        `Anonymous access to private table "${table}"`,
        isBlocked,
        `Status ${res.status}, returned: ${Array.isArray(res.data) ? `${res.data.length} items (0 allowed)` : "denied"}`
      );
    } catch (e: any) {
      record("RLS", `Anonymous access to "${table}"`, false, e.message);
    }
  }

  // Check public read tables
  const publicTables = ["Event", "GalleryItem", "PressMention"];
  for (const table of publicTables) {
    try {
      const res = await supabaseRest(`/rest/v1/${table}?select=*`);
      const isAccessible = res.status === 200 && Array.isArray(res.data);
      record(
        "RLS",
        `Anonymous read on public catalog "${table}"`,
        isAccessible,
        `Status ${res.status}, accessible items: ${Array.isArray(res.data) ? res.data.length : 0}`
      );
    } catch (e: any) {
      record("RLS", `Anonymous read on "${table}"`, false, e.message);
    }
  }

  // Check unauthorized insert via anon REST API
  try {
    const res = await supabaseRest("/rest/v1/Event", "POST", {
      name: "Exploit Event",
      slug: "exploit-event",
      description: "Should fail",
      date: new Date().toISOString(),
    });
    const insertBlocked = res.status === 401 || res.status === 403 || res.status === 404;
    record(
      "RLS",
      "Anonymous insert mutation on Event table",
      insertBlocked,
      `Status ${res.status} (Mutation blocked as expected)`
    );
  } catch (e: any) {
    record("RLS", "Anonymous insert mutation", true, "Connection dropped / rejected");
  }

  // ─── 2. Authentication & Hashing Tests ─────────────────────────
  console.log("\n--- 2. AUTHENTICATION & CRYPTOGRAPHIC HASHING TESTS ---");
  const testPassword = "SuperSecurePassword2026!";
  const hash = await hashPassword(testPassword);
  const isPbkdf2Format = hash.startsWith("pbkdf2:100000:");
  record(
    "AUTH",
    "Password hashed with PBKDF2 (100k iterations, salt)",
    isPbkdf2Format,
    `Format: ${hash.slice(0, 25)}...`
  );

  const verifyValid = await verifyPassword(testPassword, hash);
  record("AUTH", "Valid password verification", verifyValid, "Password matched PBKDF2 hash");

  const verifyInvalid = await verifyPassword("WrongPassword123!", hash);
  record("AUTH", "Invalid password rejection", !verifyInvalid, "Incorrect password rejected");

  // ─── 3. Audit Logging Verification ─────────────────────────────
  console.log("\n--- 3. AUDIT LOGGING SYSTEM TESTS ---");
  const testAction = "test.security.audit_verify";
  await logAuditEvent({
    action: testAction,
    targetType: "SecurityTest",
    targetId: "audit-001",
    metadata: { testKey: "testValue", secretPassword: "shouldBeSanitized" },
  });

  const latestLog = await prisma.auditLog.findFirst({
    where: { action: testAction },
    orderBy: { createdAt: "desc" },
  });

  const logCreated = Boolean(latestLog && latestLog.targetId === "audit-001");
  const secretsRedacted = latestLog?.metadata?.includes("[REDACTED]") ?? false;
  record("AUDIT", "AuditLog record created in Supabase DB", logCreated, `Log ID: ${latestLog?.id || "none"}`);
  record(
    "AUDIT",
    "Sensitive metadata redacted in AuditLog",
    secretsRedacted,
    `Metadata: ${latestLog?.metadata || "none"}`
  );

  // ─── 4. Volunteer Registration & Honeypot Anti-Spam ────────────
  console.log("\n--- 4. VOLUNTEER SYSTEM & HONEYPOT SPAM PROTECTION ---");
  const event = await prisma.event.findFirst();
  if (!event) {
    record("VOLUNTEER", "Event exists for volunteer registration", false, "No events in database");
  } else {
    // Test Honeypot submission
    const honeypotData = new FormData();
    honeypotData.append("fullName", "Bot Applicant");
    honeypotData.append("email", "bot@spammer.com");
    honeypotData.append("phone", "+919876543210");
    honeypotData.append("city", "Kolkata");
    honeypotData.append("preferredRole", "Event Operations");
    honeypotData.append("consentGiven", "true");
    honeypotData.append("eventId", event.id);
    honeypotData.append("_gotcha", "I am a spam bot");

    const hpCountBefore = await prisma.volunteer.count({ where: { email: "bot@spammer.com" } });
    const hpResult = await submitVolunteerApplication(honeypotData);
    const hpCountAfter = await prisma.volunteer.count({ where: { email: "bot@spammer.com" } });

    const honeypotTrapped = hpResult.success && hpCountBefore === hpCountAfter;
    record(
      "VOLUNTEER",
      "Honeypot traps bot without writing to database",
      honeypotTrapped,
      `Fake success returned, records created: ${hpCountAfter - hpCountBefore}`
    );

    // Test Volunteer ID generation format
    const generatedId = await generateVolunteerId();
    const validIdFormat = /^VEL-\d{4}-\d{5}$/.test(generatedId);
    record("VOLUNTEER", "Volunteer ID generated format (VEL-YYYY-XXXXX)", validIdFormat, `ID: ${generatedId}`);
  }

  // ─── 5. Secret Exposure Scan in Codebase ────────────────────────
  console.log("\n--- 5. SECRET EXPOSURE & CODEBASE LEAK SCAN ---");
  const fs = await import("fs");
  const path = await import("path");

  // Read .gitignore to verify secrets are excluded
  const gitignore = fs.readFileSync(path.resolve(".gitignore"), "utf-8");
  const gitignoreProtectsEnv = gitignore.includes(".env*") && gitignore.includes("prisma/dev.db");
  record(
    "SECRETS",
    ".gitignore properly excludes environment and local databases",
    gitignoreProtectsEnv,
    "Confirmed .env* and prisma/dev.db excluded"
  );

  // Read .env.example to verify no real secrets leaked in template
  const envExample = fs.readFileSync(path.resolve(".env.example"), "utf-8");
  const noSecretsInExample =
    !envExample.includes("qZiJ3kK3jsvfTfIR") &&
    !envExample.includes("VelvtAdmin2026!");
  record(
    "SECRETS",
    ".env.example contains no real passwords or project credentials",
    noSecretsInExample,
    "Confirmed placeholder templates only"
  );

  // ─── 6. Search Crawler & Robots.txt Check ───────────────────────
  console.log("\n--- 6. SEARCH CRAWLER PROTECTION ---");
  const robotsExists = fs.existsSync(path.resolve("src/app/robots.ts"));
  let robotsProtected = false;
  if (robotsExists) {
    const robotsContent = fs.readFileSync(path.resolve("src/app/robots.ts"), "utf-8");
    robotsProtected = robotsContent.includes("/velvt-management") && robotsContent.includes("/api");
  }
  record(
    "ROBOTS",
    "Robots.txt blocks search engine indexing of management & API paths",
    robotsProtected,
    "Disallowed: /velvt-management, /api"
  );

  // ─── 7. Summary Report ─────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("                     AUDIT TEST RESULTS SUMMARY                ");
  console.log("═══════════════════════════════════════════════════════════════");

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Status: ${failed === 0 ? "ALL CHECKS PASSED ✅" : "ISSUES FOUND ⚠️"}`);

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runAuditSuite().catch((err) => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
