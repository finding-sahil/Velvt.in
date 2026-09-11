// VELVT — Database Seed Script
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
  console.log("🌑 Seeding VELVT database...\n");

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@velvt.in";
  const adminPassword = process.env.ADMIN_PASSWORD || "VelvtAdmin2026!";

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "VELVT Admin",
      },
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  } else {
    console.log(`→ Admin user already exists: ${adminEmail}`);
  }

  // ─── VELVT CURSE 2.O Event ──────────────────────────────────────────────────
  const existingEvent = await prisma.event.findUnique({
    where: { slug: "velvt-curse-2-o" },
  });

  if (!existingEvent) {
    const event = await prisma.event.create({
      data: {
        name: "VELVT CURSE 2.O",
        slug: "velvt-curse-2-o",
        description:
          "Step into the darkness. VELVT CURSE 2.O is an immersive Halloween experience that blends cinematic atmosphere, live performances, interactive installations, and curated entertainment into one unforgettable night. This is not just a party — it's an experience crafted to haunt your memory long after the night ends.",
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
        city: "Silchar",
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
            "Premium access with priority entry, exclusive areas, complimentary refreshments, and a VELVT merchandise pack.",
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
          description: "Welcome to VELVT CURSE 2.O. Entry begins.",
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
          question: "What is VELVT CURSE 2.O?",
          answer:
            "VELVT CURSE 2.O is an immersive Halloween-themed event by VELVT. It combines atmospheric design, live entertainment, interactive installations, and curated music into one premium experience.",
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
        title: "VELVT CURSE 2.O Announced",
        content:
          "We're excited to announce VELVT CURSE 2.O — our biggest Halloween experience yet. Stay tuned for ticket sales, venue details, and more.",
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
  // ─── Gallery Items (Archive) ────────────────────────────────────────────────
  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    const galleryItems = [
      {
        url: "/gallery/velvt.in_0a1a5f8e120e4995bd181e9fe32fa75d.jpg",
        caption: "The Obsidian Stage • Light Sculptures",
        type: "image",
        year: 2026,
        displayOrder: 1,
        isPublished: true,
      },
      {
        url: "/gallery/bhumicoree_d771374cdb47419ca9c5b4a04c851761.jpg",
        caption: "Midnight Descent • Crowd Cadence",
        type: "image",
        year: 2026,
        displayOrder: 2,
        isPublished: true,
      },
      {
        url: "/gallery/velvt.in_6737fe3cefc340b6b19188090e18877f.jpg",
        caption: "Curse 2.O Teaser Set • Crimson Wash",
        type: "image",
        year: 2026,
        displayOrder: 3,
        isPublished: true,
      },
      {
        url: "/gallery/bhumicoree_6a1cce4fd02f45389436de63f664d219.jpg",
        caption: "Behind The Scenes • Crew Moments",
        type: "image",
        year: 2026,
        displayOrder: 4,
        isPublished: true,
      },
      {
        url: "/gallery/velvt.in_5af6dea848094553ac360dcf9ceca279.jpg",
        caption: "Gilded Corridor • Interactive Installations",
        type: "image",
        year: 2026,
        displayOrder: 5,
        isPublished: true,
      },
      {
        url: "/gallery/Dia de los Muertos vibes. (2).jpg",
        caption: "Dia de los Muertos • Face Art",
        type: "image",
        year: 2026,
        displayOrder: 6,
        isPublished: true,
      },
      {
        url: "/gallery/bhumicoree_0fd7e50029d24a0db163db145ed07934.jpg",
        caption: "The Finale • Ephemeral Moments",
        type: "image",
        year: 2026,
        displayOrder: 7,
        isPublished: true,
      },
      {
        url: "/gallery/velvt.in_93c7e8ba417a41ad9e961368c44e35ff.jpg",
        caption: "Velvt Nights • Atmosphere & Energy",
        type: "image",
        year: 2026,
        displayOrder: 8,
        isPublished: true,
      },
    ];

    for (const item of galleryItems) {
      await prisma.galleryItem.create({ data: item });
    }
    console.log("✓ Gallery items seeded to Supabase");
  }

  // ─── Press Mentions ──────────────────────────────────────────────────────────
  const pressCount = await prisma.pressMention.count();
  if (pressCount === 0) {
    const pressMentions = [
      {
        title: "How VELVT Is Redefining Experiential Nightlife in 2026",
        publication: "The Culture Journal",
        url: "https://velvt.in",
        excerpt:
          "A rare synthesis of theatrical art direction, architectural acoustics, and underground hospitality — VELVT creates spaces that feel both forbidden and welcoming.",
        publishDate: new Date("2026-10-15"),
        isPublished: true,
        displayOrder: 1,
      },
      {
        title: "Behind the Curtain: The Production Engineering of Velvt Curse",
        publication: "Urban Sound Review",
        url: "https://velvt.in",
        excerpt:
          "From custom audio arrays to dynamic projection systems, the team behind Velvt Curse treats every venue as a living sculpture.",
        publishDate: new Date("2026-11-01"),
        isPublished: true,
        displayOrder: 2,
      },
      {
        title: "Community-Driven Event Operations Done Right",
        publication: "Metropolis Creative",
        url: "https://velvt.in",
        excerpt:
          "By establishing a verified credential system for volunteers and production crew, VELVT sets a new standard for independent event organizations.",
        publishDate: new Date("2026-12-05"),
        isPublished: true,
        displayOrder: 3,
      },
    ];

    for (const p of pressMentions) {
      await prisma.pressMention.create({ data: p });
    }
    console.log("✓ Press mentions seeded to Supabase");
  }

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
