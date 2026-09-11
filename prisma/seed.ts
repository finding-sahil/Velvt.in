// VELVET — Database Seed Script
// Run: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
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

async function main() {
  console.log("🌑 Seeding VELVET database...\n");

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@velvet.in";
  const adminPassword = process.env.ADMIN_PASSWORD || "VelvetAdmin2026!";

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "VELVET Admin",
      },
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  } else {
    console.log(`→ Admin user already exists: ${adminEmail}`);
  }

  // ─── VELVET CURSE 2.O Event ──────────────────────────────────────────────────
  const existingEvent = await prisma.event.findUnique({
    where: { slug: "velvet-curse-2-o" },
  });

  if (!existingEvent) {
    const event = await prisma.event.create({
      data: {
        name: "VELVET CURSE 2.O",
        slug: "velvet-curse-2-o",
        description:
          "Step into the darkness. VELVET CURSE 2.O is an immersive Halloween experience that blends cinematic atmosphere, live performances, interactive installations, and curated entertainment into one unforgettable night. This is not just a party — it's an experience crafted to haunt your memory long after the night ends.",
        theme:
          "A cinematic Halloween experience — dark, immersive, and unforgettable. Expect atmospheric lighting, curated music, themed installations, and a night designed to be remembered.",
        date: new Date("2026-10-31T19:00:00+05:30"),
        time: "7:00 PM onwards",
        status: "upcoming",
        ageRestriction: "18+ only. Valid ID required at entry.",
        dressCode:
          "Dark formal, gothic, horror-inspired, or Halloween costumes encouraged. No casual wear.",
        entryInfo:
          "Entry is by ticket only. Gates open at 7:00 PM. Latecomers will be admitted until 9:00 PM. No re-entry allowed.",
        isFeatured: true,
        displayOrder: 1,
      },
    });

    console.log(`✓ Event created: ${event.name}`);

    // Venue
    await prisma.venue.create({
      data: {
        name: "Venue To Be Announced",
        address: "Venue details will be confirmed closer to the event",
        city: "Kolkata",
        accessInfo:
          "Exact venue location and directions will be shared with ticket holders before the event.",
        eventId: event.id,
      },
    });
    console.log("✓ Venue placeholder created");

    // Ticket Types
    await prisma.ticketType.createMany({
      data: [
        {
          name: "Early Bird",
          description:
            "Limited early bird passes at a special price. Includes full event access.",
          priceInPaise: 49900,
          totalQuantity: 100,
          soldCount: 0,
          isActive: true,
          displayOrder: 1,
          eventId: event.id,
        },
        {
          name: "General Entry",
          description:
            "Standard entry pass. Full access to all event areas and experiences.",
          priceInPaise: 79900,
          totalQuantity: 300,
          soldCount: 0,
          isActive: true,
          displayOrder: 2,
          eventId: event.id,
        },
        {
          name: "VIP Experience",
          description:
            "Premium access with priority entry, exclusive areas, complimentary refreshments, and a VELVET merchandise pack.",
          priceInPaise: 149900,
          totalQuantity: 50,
          soldCount: 0,
          isActive: false,
          displayOrder: 3,
          eventId: event.id,
        },
      ],
    });
    console.log("✓ Ticket types created");

    // Schedule Items
    await prisma.eventScheduleItem.createMany({
      data: [
        {
          time: "7:00 PM",
          title: "Gates Open",
          description: "Welcome to VELVET CURSE 2.O. Entry begins.",
          displayOrder: 1,
          eventId: event.id,
        },
        {
          time: "7:30 PM",
          title: "Immersive Experience Begins",
          description:
            "Explore the themed installations and atmospheric zones.",
          displayOrder: 2,
          eventId: event.id,
        },
        {
          time: "8:30 PM",
          title: "Live Performances",
          description: "Curated performances and entertainment.",
          displayOrder: 3,
          eventId: event.id,
        },
        {
          time: "10:00 PM",
          title: "Main Event",
          description: "The centrepiece experience of the evening.",
          displayOrder: 4,
          eventId: event.id,
        },
        {
          time: "12:00 AM",
          title: "Closing",
          description: "The night draws to a close. Until next time.",
          displayOrder: 5,
          eventId: event.id,
        },
      ],
    });
    console.log("✓ Schedule items created");

    // FAQs
    await prisma.eventFAQ.createMany({
      data: [
        {
          question: "What is VELVET CURSE 2.O?",
          answer:
            "VELVET CURSE 2.O is an immersive Halloween-themed event by VELVET. It combines atmospheric design, live entertainment, interactive installations, and curated music into one premium experience.",
          displayOrder: 1,
          eventId: event.id,
        },
        {
          question: "Is there an age restriction?",
          answer:
            "Yes, this is an 18+ event. Valid government-issued photo ID is required at entry.",
          displayOrder: 2,
          eventId: event.id,
        },
        {
          question: "What should I wear?",
          answer:
            "Dark formal, gothic, horror-inspired attire, or Halloween costumes are encouraged. No casual wear will be permitted.",
          displayOrder: 3,
          eventId: event.id,
        },
        {
          question: "Can I get a refund?",
          answer:
            "Tickets are non-refundable once purchased. Transfers may be allowed on a case-by-case basis — contact us for details.",
          displayOrder: 4,
          eventId: event.id,
        },
        {
          question: "How do I become a volunteer?",
          answer:
            "Visit our Volunteers page and submit a registration form. Our team will review your application and reach out if selected.",
          displayOrder: 5,
          eventId: event.id,
        },
      ],
    });
    console.log("✓ FAQs created");

    // Announcements
    await prisma.eventAnnouncement.create({
      data: {
        title: "VELVET CURSE 2.O Announced",
        content:
          "We're excited to announce VELVET CURSE 2.O — our biggest Halloween experience yet. Stay tuned for ticket sales, venue details, and more.",
        isPublished: true,
        eventId: event.id,
      },
    });
    console.log("✓ Announcement created");
  } else {
    console.log(`→ Event already exists: ${existingEvent.name}`);
  }

  // ─── Volunteer Roles (Site Settings) ─────────────────────────────────────────
  const roles = [
    "Event Operations",
    "Registration Desk",
    "Crowd Management",
    "Guest Relations",
    "Media & Photography",
    "Social Media",
    "Creative Team",
    "Logistics",
    "Technical Support",
    "Hospitality",
  ];

  const existingRoles = await prisma.siteSetting.findUnique({
    where: { key: "volunteer_roles" },
  });

  if (!existingRoles) {
    await prisma.siteSetting.create({
      data: {
        key: "volunteer_roles",
        value: JSON.stringify(roles),
      },
    });
    console.log("✓ Volunteer roles configured");
  }

  // ─── Site Settings ───────────────────────────────────────────────────────────
  const settings = [
    { key: "brand_name", value: "VELVT" },
    { key: "tagline", value: "It starts as a thought, ends as a memory." },
    { key: "contact_email", value: "" },
    { key: "social_instagram", value: "https://www.instagram.com/velvt.in" },
    { key: "social_twitter", value: "" },
    { key: "social_youtube", value: "" },
  ];

  for (const setting of settings) {
    const existing = await prisma.siteSetting.findUnique({
      where: { key: setting.key },
    });
    if (!existing) {
      await prisma.siteSetting.create({ data: setting });
    }
  }
  console.log("✓ Site settings configured");

  console.log("\n🌕 Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
