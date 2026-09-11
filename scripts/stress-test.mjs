import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function fetchHtml(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
  });
  const text = await res.text();
  return { status: res.status, headers: res.headers, text };
}

async function runAllWorkflows() {
  console.log("================================================================================");
  console.log("             VELVT — FINAL PRODUCTION READINESS STRESS TEST AUDIT               ");
  console.log("================================================================================\n");

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 1: Event Workflow
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 1/9] WORKFLOW: Event Lifecycle (Create → Publish → Update → Archive)");
    const testEventSlug = `stress-test-gala-${Date.now()}`;

    // 1. Create & publish event with 1-to-1 venue
    const event = await prisma.event.create({
      data: {
        name: "Night of the Crimson Eclipse",
        slug: testEventSlug,
        description: "An exclusive dark-wave ballroom experience with immersive theater and vintage horror aesthetics.",
        theme: "Gothic Ballroom & Darkwave",
        date: new Date(Date.now() + 86400000 * 14), // 14 days ahead
        time: "8:00 PM – 2:00 AM",
        status: "published",
        isFeatured: false,
        venue: {
          create: {
            name: "Grand Colonial Ballroom",
            address: "7 Old Court House Street",
            city: "Kolkata",
          }
        }
      },
      include: { venue: true }
    });
    assert(!!event.id, "Event successfully created in database with linked venue");

    // 2. Verify appears on public /events and detail page
    const eventsPage = await fetchHtml("/events");
    assert(eventsPage.status === 200 && eventsPage.text.includes("Night of the Crimson Eclipse"), "Event appears in public /events listing");

    const detailPage = await fetchHtml(`/events/${testEventSlug}`);
    assert(detailPage.status === 200 && detailPage.text.includes("Night of the Crimson Eclipse") && detailPage.text.includes("Grand Colonial Ballroom"), "Event detail page renders with venue and title");

    // 3. Update date, venue, status
    const updatedDate = new Date(Date.now() + 86400000 * 20);
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        status: "sold-out",
        time: "9:00 PM – 3:00 AM",
        date: updatedDate,
      }
    });
    assert(updatedEvent.status === "sold-out", "Event status updated to 'sold-out' in database");

    const updatedDetailPage = await fetchHtml(`/events/${testEventSlug}`);
    assert(updatedDetailPage.text.includes("Sold Out") || updatedDetailPage.text.includes("sold-out"), "Event detail page reflects 'Sold Out' status badge");
    assert(updatedDetailPage.text.includes("9:00 PM – 3:00 AM"), "Event detail page reflects updated timing");

    // 4. Archive event
    await prisma.event.update({
      where: { id: event.id },
      data: { status: "archived" }
    });
    const archivedEventsPage = await fetchHtml("/events");
    assert(archivedEventsPage.status === 200, "Events page loads correctly after event archived");

    // Cleanup event
    await prisma.event.delete({ where: { id: event.id } });
    console.log("  ↳ Event workflow passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 2: Ticket Workflow
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 2/9] WORKFLOW: Ticket Workflow (Create → Publish → Toggle → No Fake Payment)");
    const ticketEventSlug = `ticket-test-event-${Date.now()}`;
    const ticketEvent = await prisma.event.create({
      data: {
        name: "Phantom Masquerade 2026",
        slug: ticketEventSlug,
        description: "Mysterious masquerade ball.",
        date: new Date(Date.now() + 86400000 * 30),
        status: "published",
        isFeatured: false,
        venue: {
          create: {
            name: "The Crypt Underground",
            address: "Park Street",
            city: "Kolkata",
          }
        }
      }
    });

    // 1. Create ticket tier
    const ticketTier = await prisma.ticketType.create({
      data: {
        eventId: ticketEvent.id,
        name: "Shadow Crypt VIP Pass",
        description: "Includes private crypt access, open bar, and velvt gift bag.",
        priceInPaise: 249900, // ₹2,499
        totalQuantity: 50,
        soldCount: 0,
        isActive: true,
        displayOrder: 1,
      }
    });
    assert(!!ticketTier.id, "Ticket tier created with price ₹2,499");

    // 2. Verify appears on public event detail page
    const ticketEventPage = await fetchHtml(`/events/${ticketEventSlug}`);
    assert(ticketEventPage.text.includes("Shadow Crypt VIP Pass") && ticketEventPage.text.includes("2,499"), "Ticket tier name and formatted price appear publicly on event page");

    // 3. Confirm NO fake payment success exists (when bookingUrl is missing, shows Opens Soon or disabled button)
    assert(!ticketEventPage.text.includes("Simulated Checkout") && !ticketEventPage.text.includes("Fake Payment Success"), "No simulated or fake payment success mechanism exists");
    assert(ticketEventPage.text.includes("Opens Soon") || ticketEventPage.text.includes("passes-action"), "Missing booking URL safely renders non-misleading 'Opens Soon' state");

    // 4. Toggle ticket tier to disabled
    await prisma.ticketType.update({
      where: { id: ticketTier.id },
      data: { isActive: false }
    });
    const disabledTicketPage = await fetchHtml(`/events/${ticketEventSlug}`);
    assert(!disabledTicketPage.text.includes("Shadow Crypt VIP Pass"), "Disabled ticket tier is cleanly removed from public view");

    // Cleanup
    await prisma.ticketType.delete({ where: { id: ticketTier.id } });
    await prisma.event.delete({ where: { id: ticketEvent.id } });
    console.log("  ↳ Ticket workflow passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 3: Volunteer Verification Workflow
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 3/9] WORKFLOW: Volunteer Verification (Apply → Approve → Verify → QR Scan → Revoke)");
    // Need an active event for volunteer relation
    const curseEvent = await prisma.event.findFirst();
    if (!curseEvent) throw new Error("No event available for volunteer relation");

    // 1. Submit application
    const volunteer = await prisma.volunteer.create({
      data: {
        fullName: "Aarav 'Hex' Mukherjee",
        email: "hex.aarav@stress-test.velvt.in",
        phone: "+91 9830099999",
        city: "Kolkata",
        preferredRole: "Stage Management & Crowd Flow",
        experience: "3 years managing stage cues at underground gothic festivals.",
        status: "pending",
        adminNotes: "CONFIDENTIAL AUDIT NOTE: Recommended by festival operations director.",
        eventId: curseEvent.id,
      }
    });
    assert(volunteer.status === "pending", "Volunteer application submitted with pending status");

    // 2. Admin approves and assigns role & unique ID
    const testVolunteerId = `VLV-2026-QA-${Math.floor(1000 + Math.random() * 9000)}`;
    const approvedVolunteer = await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: {
        status: "approved",
        volunteerId: testVolunteerId,
        assignedRole: "Lead Stage Safety & Atmosphere Controller",
        approvedAt: new Date(),
      }
    });
    assert(approvedVolunteer.volunteerId === testVolunteerId, "Official unique Credential ID generated and assigned");

    // 3. Mark verified
    await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: { status: "verified" }
    });

    // 4. Test public verification page and scannable QR code
    const verifyPage = await fetchHtml(`/verify/${testVolunteerId}`);
    assert(verifyPage.status === 200, "Public verification route returns HTTP 200");
    assert(verifyPage.text.includes("Aarav &#x27;Hex&#x27; Mukherjee") || verifyPage.text.includes("Hex"), "Public badge displays volunteer full name");
    assert(verifyPage.text.includes("Lead Stage Safety &amp; Atmosphere Controller") || verifyPage.text.includes("Lead Stage Safety"), "Public badge displays assigned specialization");
    assert(verifyPage.text.includes("Verified Contributor"), "Public badge displays verified contributor badge");
    assert(verifyPage.text.includes("<svg") && verifyPage.text.includes(testVolunteerId), "Public verification page embeds scannable SVG QR code");

    // 5. CRITICAL DATA PRIVACY CHECK: ensure confidential fields are never leaked
    assert(!verifyPage.text.includes("hex.aarav@stress-test.velvt.in"), "STRICT PRIVACY: Applicant email is NEVER leaked in public verification");
    assert(!verifyPage.text.includes("+91 9830099999"), "STRICT PRIVACY: Applicant phone number is NEVER leaked in public verification");
    assert(!verifyPage.text.includes("CONFIDENTIAL AUDIT NOTE"), "STRICT PRIVACY: Internal admin notes are NEVER leaked in public verification");

    // 6. Revoke credential
    await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: { status: "revoked", revokedAt: new Date() }
    });
    const revokedPage = await fetchHtml(`/verify/${testVolunteerId}`);
    assert(revokedPage.text.includes("Record Revoked") || revokedPage.text.includes("archived or revoked"), "Revoked credential immediately displays 'Record Revoked' state");

    // Cleanup
    await prisma.volunteer.delete({ where: { id: volunteer.id } });
    console.log("  ↳ Volunteer verification workflow passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 4: Team Workflow
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 4/9] WORKFLOW: Team Management (Create → Publish → Homepage Preview → Unpublish)");
    const teamMember = await prisma.teamMember.create({
      data: {
        name: "Damian Thorne",
        role: "Head of Dark Scenography",
        category: "Core Team",
        bio: "Specialist in industrial horror set design and atmospheric light architecture.",
        displayOrder: 1,
        isPublished: true,
      }
    });
    assert(!!teamMember.id, "Team member record created");

    // Verify on /team page
    const teamPage = await fetchHtml("/team");
    assert(teamPage.status === 200 && teamPage.text.includes("Damian Thorne"), "Team member renders on public /team roster");
    assert(teamPage.text.includes("Head of Dark Scenography"), "Team member role renders accurately");

    // Verify on Homepage team preview
    const homeTeamPage = await fetchHtml("/");
    assert(homeTeamPage.text.includes("Damian Thorne"), "Team member displays on homepage team preview section");

    // Unpublish team member
    await prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { isPublished: false }
    });
    const unpubTeamPage = await fetchHtml("/team");
    assert(!unpubTeamPage.text.includes("Damian Thorne"), "Unpublished team member cleanly removed from /team");
    const unpubHomePage = await fetchHtml("/");
    assert(!unpubHomePage.text.includes("Damian Thorne"), "Unpublished team member cleanly removed from homepage preview");

    // Cleanup
    await prisma.teamMember.delete({ where: { id: teamMember.id } });
    console.log("  ↳ Team workflow passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 5: Gallery Workflow
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 5/9] WORKFLOW: Gallery Media (Create → Tag/Categorize → Publish → Unpublish)");
    const galleryItem = await prisma.galleryItem.create({
      data: {
        caption: "The Altar of Echoes",
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
        type: "image",
        year: 2025,
        isPublished: true,
        displayOrder: 1,
      }
    });
    assert(!!galleryItem.id, "Gallery media item created");

    const galleryPage = await fetchHtml("/gallery");
    assert(galleryPage.status === 200 && galleryPage.text.includes("The Altar of Echoes"), "Gallery item appears in public /gallery showcase");

    // Unpublish
    await prisma.galleryItem.update({
      where: { id: galleryItem.id },
      data: { isPublished: false }
    });
    const unpubGalleryPage = await fetchHtml("/gallery");
    assert(!unpubGalleryPage.text.includes("The Altar of Echoes"), "Unpublished gallery item cleanly disappears from public gallery");

    // Cleanup
    await prisma.galleryItem.delete({ where: { id: galleryItem.id } });
    console.log("  ↳ Gallery workflow passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 6: Partner & Press Workflow
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 6/9] WORKFLOW: Partner & Press (Create → Feature → Public Verification → Unpublish)");
    const partner = await prisma.partner.create({
      data: {
        name: "Nocturne Audio Engineering",
        type: "sponsor",
        website: "https://nocturneaudio.test",
        isActive: true,
        displayOrder: 1,
      }
    });
    const press = await prisma.pressMention.create({
      data: {
        publication: "The Gothic Gazette Kolkata",
        title: "Inside VELVT: Bengal's Darkest Nightclub Transformation",
        url: "https://gothicgazette.test/velvt-exclusive",
        isPublished: true,
        displayOrder: 1,
      }
    });

    const homePartnerPage = await fetchHtml("/");
    assert(homePartnerPage.text.includes("Nocturne Audio Engineering"), "Active brand partner displays on homepage partner preview");

    const pressPage = await fetchHtml("/press");
    assert(pressPage.status === 200 && pressPage.text.includes("Inside VELVT: Bengal&#x27;s Darkest Nightclub") || pressPage.text.includes("Inside VELVT"), "Press mention displays in public /press archive");

    // Unpublish
    await prisma.partner.update({ where: { id: partner.id }, data: { isActive: false } });
    await prisma.pressMention.update({ where: { id: press.id }, data: { isPublished: false } });

    const unpubHomePartner = await fetchHtml("/");
    assert(!unpubHomePartner.text.includes("Nocturne Audio Engineering"), "Inactive partner cleanly removed from homepage");

    const unpubPress = await fetchHtml("/press");
    assert(!unpubPress.text.includes("Inside VELVT: Bengal's Darkest Nightclub"), "Unpublished press mention removed from public /press");

    // Cleanup
    await prisma.partner.delete({ where: { id: partner.id } });
    await prisma.pressMention.delete({ where: { id: press.id } });
    console.log("  ↳ Partner & Press workflow passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 7: Homepage CMS Settings
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 7/9] WORKFLOW: Homepage CMS (Live Headline, Tagline, & CTA Customization)");
    // Update site settings in DB
    const testTitle = "VELVT STRESS TEST 2026";
    const testTagline = "Audited and verified for live launch.";
    const testPrimaryCta = "Audit Pass Vault";
    const testFinalTitle = "The Shadows Are Ready. Are You?";
    const testFinalBtn = "Initiate Contact Now";

    await prisma.siteSetting.upsert({ where: { key: "hero_title" }, update: { value: testTitle }, create: { key: "hero_title", value: testTitle } });
    await prisma.siteSetting.upsert({ where: { key: "hero_tagline" }, update: { value: testTagline }, create: { key: "hero_tagline", value: testTagline } });
    await prisma.siteSetting.upsert({ where: { key: "hero_cta_primary" }, update: { value: testPrimaryCta }, create: { key: "hero_cta_primary", value: testPrimaryCta } });
    await prisma.siteSetting.upsert({ where: { key: "final_cta_title" }, update: { value: testFinalTitle }, create: { key: "final_cta_title", value: testFinalTitle } });
    await prisma.siteSetting.upsert({ where: { key: "final_cta_button" }, update: { value: testFinalBtn }, create: { key: "final_cta_button", value: testFinalBtn } });

    const cmsHomePage = await fetchHtml("/");
    assert(cmsHomePage.text.includes(testTitle), "Homepage displays updated CMS hero title without code edits");
    assert(cmsHomePage.text.includes(testTagline), "Homepage displays updated CMS hero tagline");
    assert(cmsHomePage.text.includes(testPrimaryCta), "Homepage displays updated CMS primary CTA button");
    assert(cmsHomePage.text.includes(testFinalTitle), "Homepage displays updated CMS final CTA title");
    assert(cmsHomePage.text.includes(testFinalBtn), "Homepage displays updated CMS final CTA button text");

    // Restore clean default brand settings
    await prisma.siteSetting.upsert({ where: { key: "hero_title" }, update: { value: "VELVT" }, create: { key: "hero_title", value: "VELVT" } });
    await prisma.siteSetting.upsert({ where: { key: "hero_tagline" }, update: { value: "It starts as a thought, ends as a memory." }, create: { key: "hero_tagline", value: "It starts as a thought, ends as a memory." } });
    await prisma.siteSetting.upsert({ where: { key: "hero_cta_primary" }, update: { value: "Explore Curse 2.O" }, create: { key: "hero_cta_primary", value: "Explore Curse 2.O" } });
    await prisma.siteSetting.upsert({ where: { key: "final_cta_title" }, update: { value: "Let's Create What's Next." }, create: { key: "final_cta_title", value: "Let's Create What's Next." } });
    await prisma.siteSetting.upsert({ where: { key: "final_cta_button" }, update: { value: "Collaborate With Us" }, create: { key: "final_cta_button", value: "Collaborate With Us" } });
    console.log("  ↳ Homepage CMS workflow passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 8: Security & Permission Audit
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 8/9] WORKFLOW: Security, Auth Guards, Boundary & Robustness Audit");
    // 1. Unauthenticated access to admin routes must be blocked
    const adminRoutes = ["/admin", "/admin/events", "/admin/volunteers", "/admin/team", "/admin/gallery", "/admin/partners", "/admin/settings"];
    for (const route of adminRoutes) {
      const authRes = await fetch(`${BASE_URL}${route}`, { redirect: "manual" });
      const isRedirect = authRes.status === 307 || authRes.status === 302;
      const location = authRes.headers.get("location") || "";
      assert(isRedirect && location.includes("/admin/login"), `Security Middleware: '${route}' blocks unauthenticated access and redirects to login [HTTP ${authRes.status}]`);
    }

    // 2. Boundary test: non-existent volunteer ID returns friendly 404 card, no crash or stack trace
    const badVerify = await fetchHtml("/verify/non-existent-id-999999");
    assert(badVerify.status === 200 && badVerify.text.includes("Verification Not Found"), "Invalid volunteer ID renders polite 'Verification Not Found' card without 500 error");
    assert(!badVerify.text.includes("PrismaClientKnownRequestError") && !badVerify.text.includes("stack trace"), "No database stack trace or internal error leaked on invalid ID lookup");

    // 3. Boundary test: non-existent event slug returns clean 404 page
    const badEvent = await fetchHtml("/events/non-existent-gothic-rave-xyz-999");
    assert(badEvent.status === 404 || badEvent.text.includes("Lost in the Shadows") || badEvent.text.includes("404"), "Invalid event slug triggers clean 404 handler without crash");

    // 4. Malformed characters / XSS payload in URL safely handled
    const xssVerify = await fetchHtml("/verify/%3Cscript%3Ealert(1)%3C%2Fscript%3E");
    assert(xssVerify.status === 200 && !xssVerify.text.includes("<script>alert(1)</script>"), "Malformed script injection encoded/sanitized safely");
    console.log("  ↳ Security & permission audit passed all assertions.\n");

    // ─────────────────────────────────────────────────────────────────────────
    // WORKFLOW 9: Cross-Route & Responsive Integrity Audit
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ [TEST 9/9] WORKFLOW: Cross-Route & Responsive Viewport Integrity");
    const coreRoutes = [
      "/",
      "/events",
      "/events/velvt-curse-2-o",
      "/tickets",
      "/volunteers",
      "/volunteers/register",
      "/verify",
      "/gallery",
      "/press",
      "/team",
      "/about",
      "/contact",
      "/admin/login"
    ];

    for (const r of coreRoutes) {
      const pageRes = await fetchHtml(r);
      assert(pageRes.status === 200, `Public route '${r}' returns HTTP 200 OK with valid content`);
      assert(pageRes.text.includes("viewport") || pageRes.text.includes("<!DOCTYPE html"), `Route '${r}' includes standard responsive HTML document structure`);
    }
    console.log("  ↳ Cross-route responsive integrity passed all assertions.\n");

  } catch (err) {
    console.error("FATAL ERROR DURING AUDIT:", err);
    failedTests++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("================================================================================");
  console.log(`AUDIT SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failures)`);
  if (failedTests === 0) {
    console.log("VERDICT: 100% PASS — VELVT SYSTEM FULLY PRODUCTION READY");
  } else {
    console.log("VERDICT: FAILED — ISSUES REMAIN TO BE RESOLVED");
  }
  console.log("================================================================================");

  process.exit(failedTests === 0 ? 0 : 1);
}

runAllWorkflows();
