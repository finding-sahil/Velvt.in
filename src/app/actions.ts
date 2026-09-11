"use server";

import { prisma } from "@/lib/db";
import {
  volunteerRegistrationSchema,
  contactFormSchema,
  adminLoginSchema,
  eventSchema,
  ticketTypeSchema,
  teamMemberSchema,
  galleryItemSchema,
  partnerSchema,
  pressMentionSchema,
} from "@/lib/validations";
import { generateVolunteerId } from "@/lib/volunteer-id";
import { verifyPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ─── Volunteer Registration ────────────────────────────────────────────────────

export async function submitVolunteerApplication(formData: FormData) {
  // Rate limiting
  const hdrs = await headers();
  const clientIp = getClientIdentifier(hdrs);
  const rl = checkRateLimit(`volunteer:${clientIp}`, RATE_LIMITS.volunteerRegistration);
  if (!rl.success) {
    return { success: false, errors: { _form: ["Too many submissions. Please try again later."] } };
  }

  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    city: formData.get("city") as string,
    preferredRole: formData.get("preferredRole") as string,
    experience: (formData.get("experience") as string) || "",
    socialLink: (formData.get("socialLink") as string) || "",
    photo: (formData.get("photo") as string) || "",
    consentGiven: formData.get("consentGiven") === "true",
    eventId: formData.get("eventId") as string,
  };

  const result = volunteerRegistrationSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.volunteer.create({
      data: {
        fullName: result.data.fullName,
        email: result.data.email,
        phone: result.data.phone,
        city: result.data.city,
        preferredRole: result.data.preferredRole,
        experience: result.data.experience || null,
        socialLink: result.data.socialLink || null,
        photo: (formData.get("photo") as string) || null,
        consentGiven: result.data.consentGiven,
        eventId: result.data.eventId,
        status: "pending",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Volunteer registration error:", error);
    return {
      success: false,
      errors: { _form: ["Something went wrong. Please try again."] },
    };
  }
}

// ─── Contact Form ──────────────────────────────────────────────────────────────

export async function submitContactInquiry(formData: FormData) {
  // Rate limiting
  const hdrs = await headers();
  const clientIp = getClientIdentifier(hdrs);
  const rl = checkRateLimit(`contact:${clientIp}`, RATE_LIMITS.contactForm);
  if (!rl.success) {
    return { success: false, errors: { _form: ["Too many submissions. Please try again later."] } };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || "",
    category: formData.get("category") as string,
    message: formData.get("message") as string,
  };

  const result = contactFormSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.contactInquiry.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        category: result.data.category,
        message: result.data.message,
        status: "new",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false,
      errors: { _form: ["Something went wrong. Please try again."] },
    };
  }
}

// ─── Admin Login ───────────────────────────────────────────────────────────────

export async function adminLogin(formData: FormData) {
  // Rate limiting
  const hdrs = await headers();
  const clientIp = getClientIdentifier(hdrs);
  const rl = checkRateLimit(`login:${clientIp}`, RATE_LIMITS.adminLogin);
  if (!rl.success) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = adminLoginSchema.safeParse(raw);

  if (!result.success) {
    return { success: false, error: "Please enter valid credentials." };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: result.data.email },
    });

    if (!admin) {
      return { success: false, error: "Invalid email or password." };
    }

    const isValid = await verifyPassword(
      result.data.password,
      admin.passwordHash
    );

    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    await createSession(admin.id);
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function adminLogout() {
  await destroySession();
  redirect("/velvet-management/login");
}

// ─── Admin: Approve Volunteer ──────────────────────────────────────────────────

export async function approveVolunteer(volunteerId: string, assignedRole?: string) {
  await requireAdmin();

  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
  });

  if (!volunteer) {
    return { success: false, error: "Volunteer not found." };
  }

  const generatedId = await generateVolunteerId();

  await prisma.volunteer.update({
    where: { id: volunteerId },
    data: {
      status: "approved",
      volunteerId: generatedId,
      assignedRole: assignedRole || volunteer.preferredRole,
      approvedAt: new Date(),
    },
  });

  return { success: true, volunteerId: generatedId };
}

// ─── Admin: Revoke Volunteer ───────────────────────────────────────────────────

export async function revokeVolunteer(volunteerId: string) {
  await requireAdmin();

  await prisma.volunteer.update({
    where: { id: volunteerId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
    },
  });

  return { success: true };
}

// ─── Admin: Mark Volunteer Verified ────────────────────────────────────────────

export async function verifyVolunteer(volunteerId: string) {
  await requireAdmin();

  await prisma.volunteer.update({
    where: { id: volunteerId },
    data: {
      status: "verified",
    },
  });

  return { success: true };
}

export async function updateVolunteerPhoto(volunteerId: string, photo: string) {
  await requireAdmin();

  await prisma.volunteer.update({
    where: { id: volunteerId },
    data: {
      photo,
    },
  });

  revalidatePath("/velvet-management/volunteers");
  revalidatePath("/volunteers");
  return { success: true };
}

export async function updateVolunteerSocials(volunteerId: string, socialLink: string) {
  await requireAdmin();

  await prisma.volunteer.update({
    where: { id: volunteerId },
    data: {
      socialLink,
    },
  });

  revalidatePath("/velvet-management/volunteers");
  revalidatePath("/volunteers");
  return { success: true };
}

// ─── Admin: Update Inquiry Status ──────────────────────────────────────────────

export async function updateInquiryStatus(
  inquiryId: string,
  status: string,
  adminNotes?: string
) {
  await requireAdmin();

  await prisma.contactInquiry.update({
    where: { id: inquiryId },
    data: {
      status,
      ...(adminNotes !== undefined && { adminNotes }),
    },
  });

  revalidatePath("/velvet-management/inquiries");
  return { success: true };
}

// ─── Admin: Events ─────────────────────────────────────────────────────────────

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const description = formData.get("description") as string;
  const theme = (formData.get("theme") as string) || null;
  const coverImage = (formData.get("coverImage") as string) || null;
  const dressCode = (formData.get("dressCode") as string) || null;
  const ageRestriction = (formData.get("ageRestriction") as string) || null;
  const entryInfo = (formData.get("entryInfo") as string) || null;
  const dateStr = formData.get("date") as string;
  const time = (formData.get("time") as string) || null;
  const status = (formData.get("status") as string) || "draft";
  const venueName = (formData.get("venueName") as string) || null;
  const venueCity = (formData.get("venueCity") as string) || "Kolkata";
  const venueAddress = (formData.get("venueAddress") as string) || "Kolkata, India";
  const isFeatured = formData.get("isFeatured") === "true";

  if (!name || !description || !dateStr) {
    return { success: false, error: "Name, description, and date are required." };
  }

  try {
    const event = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        theme,
        coverImage,
        dressCode,
        ageRestriction,
        entryInfo,
        date: new Date(dateStr),
        time,
        status,
        isFeatured,
        ...(venueName && {
          venue: {
            create: {
              name: venueName,
              city: venueCity,
              address: venueAddress,
            },
          },
        }),
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvet-management/events");
    return { success: true, event };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { success: false, error: error?.message || "Failed to create event." };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const theme = formData.get("theme") as string;
  const coverImage = formData.get("coverImage") as string | null;
  const dressCode = formData.get("dressCode") as string | null;
  const ageRestriction = formData.get("ageRestriction") as string | null;
  const entryInfo = formData.get("entryInfo") as string | null;
  const dateStr = formData.get("date") as string;
  const time = formData.get("time") as string;
  const status = formData.get("status") as string;
  const isFeatured = formData.get("isFeatured") === "true";
  const venueName = formData.get("venueName") as string;
  const venueCity = formData.get("venueCity") as string;
  const venueAddress = formData.get("venueAddress") as string;

  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(theme !== undefined && { theme }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(dressCode !== undefined && { dressCode: dressCode || null }),
        ...(ageRestriction !== undefined && { ageRestriction: ageRestriction || null }),
        ...(entryInfo !== undefined && { entryInfo: entryInfo || null }),
        ...(dateStr && { date: new Date(dateStr) }),
        ...(time !== undefined && { time }),
        ...(status && { status }),
        isFeatured,
        ...(venueName && {
          venue: {
            upsert: {
              create: {
                name: venueName,
                city: venueCity || "Kolkata",
                address: venueAddress || "Kolkata, India",
              },
              update: {
                name: venueName,
                city: venueCity || "Kolkata",
                address: venueAddress || "Kolkata, India",
              },
            },
          },
        }),
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvet-management/events");
    return { success: true, event };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { success: false, error: error?.message || "Failed to update event." };
  }
}

export async function archiveEvent(eventId: string) {
  await requireAdmin();

  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: "archived" },
  });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/velvet-management/events");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  await requireAdmin();

  await prisma.event.delete({ where: { id: eventId } });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/velvet-management/events");
  return { success: true };
}

// ─── Admin: Ticket Types ───────────────────────────────────────────────────────

export async function createTicketType(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const eventId = formData.get("eventId") as string;
  const description = (formData.get("description") as string) || null;
  const priceInPaise = parseInt(formData.get("priceInPaise") as string, 10) || 0;
  const totalQuantity = parseInt(formData.get("totalQuantity") as string, 10) || 0;
  const bookingUrl = (formData.get("bookingUrl") as string) || null;
  const isActive = formData.get("isActive") !== "false";

  if (!name || !eventId) {
    return { success: false, error: "Name and event are required." };
  }

  try {
    const ticket = await prisma.ticketType.create({
      data: {
        name,
        eventId,
        description,
        priceInPaise,
        totalQuantity,
        bookingUrl,
        isActive,
      },
    });

    revalidatePath("/tickets");
    revalidatePath("/velvet-management/events");
    return { success: true, ticket };
  } catch (error: any) {
    console.error("Create ticket error:", error);
    return { success: false, error: error?.message || "Failed to create ticket." };
  }
}

export async function updateTicketType(ticketId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceInPaise = formData.get("priceInPaise") ? parseInt(formData.get("priceInPaise") as string, 10) : undefined;
  const totalQuantity = formData.get("totalQuantity") ? parseInt(formData.get("totalQuantity") as string, 10) : undefined;
  const bookingUrl = formData.get("bookingUrl") as string;
  const isActive = formData.get("isActive") !== undefined ? formData.get("isActive") === "true" : undefined;

  try {
    const ticket = await prisma.ticketType.update({
      where: { id: ticketId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(priceInPaise !== undefined && { priceInPaise }),
        ...(totalQuantity !== undefined && { totalQuantity }),
        ...(bookingUrl !== undefined && { bookingUrl: bookingUrl || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    revalidatePath("/tickets");
    revalidatePath("/velvet-management/events");
    return { success: true, ticket };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update ticket." };
  }
}

export async function toggleTicketType(ticketId: string, isActive: boolean) {
  await requireAdmin();

  const ticket = await prisma.ticketType.update({
    where: { id: ticketId },
    data: { isActive },
  });

  revalidatePath("/tickets");
  revalidatePath("/velvet-management/events");
  return { success: true, ticket };
}

export async function deleteTicketType(ticketId: string) {
  await requireAdmin();

  await prisma.ticketType.delete({ where: { id: ticketId } });

  revalidatePath("/tickets");
  revalidatePath("/velvet-management/events");
  return { success: true };
}

// ─── Admin: Team Members ───────────────────────────────────────────────────────

export async function createTeamMember(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const category = (formData.get("category") as string) || "Core Team";
  const bio = (formData.get("bio") as string) || null;
  const portrait = (formData.get("portrait") as string) || null;
  const socialLinks = (formData.get("socialLinks") as string) || null;
  const displayOrder = parseInt((formData.get("displayOrder") as string) || "0", 10);
  const isPublished = formData.get("isPublished") !== "false";

  if (!name || !role) {
    return { success: false, error: "Name and role are required." };
  }

  try {
    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        category,
        bio,
        portrait,
        socialLinks,
        displayOrder,
        isPublished,
      },
    });

    revalidatePath("/");
    revalidatePath("/team");
    revalidatePath("/velvet-management/team");
    return { success: true, member };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create team member." };
  }
}

export async function updateTeamMember(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const category = formData.get("category") as string;
  const bio = formData.get("bio") as string;
  const portrait = formData.get("portrait") as string;
  const socialLinks = formData.get("socialLinks") as string;
  const displayOrder = formData.get("displayOrder") ? parseInt(formData.get("displayOrder") as string, 10) : undefined;
  const isPublished = formData.get("isPublished") !== undefined ? formData.get("isPublished") === "true" : undefined;

  try {
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(category && { category }),
        ...(bio !== undefined && { bio }),
        ...(portrait !== undefined && { portrait }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    revalidatePath("/");
    revalidatePath("/team");
    revalidatePath("/velvet-management/team");
    return { success: true, member };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update team member." };
  }
}

export async function toggleTeamMemberPublish(id: string, isPublished: boolean) {
  await requireAdmin();

  const member = await prisma.teamMember.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/velvet-management/team");
  return { success: true, member };
}

export async function deleteTeamMember(id: string) {
  await requireAdmin();

  await prisma.teamMember.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/velvet-management/team");
  return { success: true };
}

// ─── Admin: Gallery Items ──────────────────────────────────────────────────────

export async function createGalleryItem(formData: FormData) {
  await requireAdmin();

  const url = formData.get("url") as string;
  const caption = (formData.get("caption") as string) || null;
  const year = formData.get("year") ? parseInt(formData.get("year") as string, 10) : new Date().getFullYear();
  const type = (formData.get("type") as string) || "image";
  const eventId = (formData.get("eventId") as string) || null;
  const displayOrder = parseInt((formData.get("displayOrder") as string) || "0", 10);
  const isPublished = formData.get("isPublished") !== "false";

  if (!url) {
    return { success: false, error: "Image/media URL is required." };
  }

  try {
    const item = await prisma.galleryItem.create({
      data: {
        url,
        caption,
        year,
        type,
        eventId,
        displayOrder,
        isPublished,
      },
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/velvet-management/gallery");
    return { success: true, item };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to add gallery item." };
  }
}

export async function toggleGalleryPublish(id: string, isPublished: boolean) {
  await requireAdmin();

  const item = await prisma.galleryItem.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/velvet-management/gallery");
  return { success: true, item };
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();

  await prisma.galleryItem.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/velvet-management/gallery");
  return { success: true };
}

// ─── Admin: Partners & Sponsors ───────────────────────────────────────────────

export async function createPartner(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const logo = (formData.get("logo") as string) || null;
  const website = (formData.get("website") as string) || null;
  const type = (formData.get("type") as string) || "partner";
  const eventId = (formData.get("eventId") as string) || null;
  const isActive = formData.get("isActive") !== "false";

  if (!name) {
    return { success: false, error: "Partner name is required." };
  }

  try {
    const partner = await prisma.partner.create({
      data: {
        name,
        logo,
        website,
        type,
        eventId,
        isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/velvet-management/partners");
    return { success: true, partner };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create partner." };
  }
}

export async function togglePartnerActive(id: string, isActive: boolean) {
  await requireAdmin();

  const partner = await prisma.partner.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/");
  revalidatePath("/velvet-management/partners");
  return { success: true, partner };
}

export async function deletePartner(id: string) {
  await requireAdmin();

  await prisma.partner.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/velvet-management/partners");
  return { success: true };
}

// ─── Admin: Press Mentions ─────────────────────────────────────────────────────

export async function createPressMention(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const publication = formData.get("publication") as string;
  const url = (formData.get("url") as string) || null;
  const excerpt = (formData.get("excerpt") as string) || null;
  const isPublished = formData.get("isPublished") !== "false";

  if (!title || !publication) {
    return { success: false, error: "Title and publication are required." };
  }

  try {
    const mention = await prisma.pressMention.create({
      data: {
        title,
        publication,
        url,
        excerpt,
        isPublished,
      },
    });

    revalidatePath("/press");
    revalidatePath("/velvet-management/partners");
    return { success: true, mention };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create press mention." };
  }
}

export async function togglePressPublish(id: string, isPublished: boolean) {
  await requireAdmin();

  const mention = await prisma.pressMention.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath("/press");
  revalidatePath("/velvet-management/partners");
  return { success: true, mention };
}

export async function deletePressMention(id: string) {
  await requireAdmin();

  await prisma.pressMention.delete({ where: { id } });

  revalidatePath("/press");
  revalidatePath("/velvet-management/partners");
  return { success: true };
}

// ─── Admin: Site Settings / CMS ────────────────────────────────────────────────

export async function updateSiteSettings(settings: Record<string, string>) {
  await requireAdmin();

  try {
    for (const [key, value] of Object.entries(settings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/velvet-management/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update settings." };
  }
}

