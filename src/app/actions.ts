"use server";

import { prisma } from "@/lib/db";
import {
  volunteerRegistrationSchema,
  contactFormSchema,
  adminLoginSchema,
  eventFaqSchema,
  issueTicketSchema,
  testimonialSchema,
  sponsorInquirySchema,
  newsletterSchema,
  portfolioProfileSchema,
} from "@/lib/validations";
import { generateTicketNumber, generateSecurityToken, generateTicketQRCode } from "@/lib/ticket-generator";
import { generateVolunteerId } from "@/lib/volunteer-id";
import { verifyPassword, hashPassword, createSession, destroySession, getSession, requireAdmin, requireStaffOrAdmin, requireGatemanOrAdmin } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";
import { getAdminPrefix } from "@/lib/admin-path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ─── Volunteer Registration ────────────────────────────────────────────────────

export async function submitVolunteerApplication(formData: FormData) {
  // Anti-spam Honeypot Check (silent drop for automated bots)
  const honeypot = formData.get("_gotcha") || formData.get("website");
  if (honeypot && String(honeypot).trim().length > 0) {
    return { success: true }; // Fake success for bots
  }

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
        availability: (formData.get("availability") as string) || null,
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
  // Anti-spam Honeypot Check (silent drop for automated bots)
  const honeypot = formData.get("_gotcha") || formData.get("website");
  if (honeypot && String(honeypot).trim().length > 0) {
    return { success: true }; // Fake success for bots
  }

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
    await logAuditEvent({
      action: "admin.login.rate_limited",
      ipAddress: clientIp,
    });
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
    const normalizedEmail = result.data.email.trim().toLowerCase();
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      await logAuditEvent({
        action: "admin.login.failed",
        metadata: { attemptedEmail: normalizedEmail },
        ipAddress: clientIp,
      });
      return { success: false, error: "Invalid email or password." };
    }

    const isValid = await verifyPassword(
      result.data.password,
      admin.passwordHash
    );

    if (!isValid) {
      await logAuditEvent({
        action: "admin.login.failed",
        metadata: { attemptedEmail: result.data.email },
        ipAddress: clientIp,
      });
      return { success: false, error: "Invalid email or password." };
    }

    if (admin.isActive === false) {
      return {
        success: false,
        error: "This staff account has been deactivated. Please contact an administrator.",
      };
    }

    await createSession(admin.id);

    await logAuditEvent({
      action: "admin.login.success",
      actor: { id: admin.id, email: admin.email },
      ipAddress: clientIp,
    });

    return { success: true, role: admin.role || "admin", name: admin.name };
  } catch (error: any) {
    console.error("Login error:", error);
    const hasDb = Boolean(
      (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL
    );
    if (!hasDb) {
      return {
        success: false,
        error: "Database not connected: DATABASE_URL is missing in Vercel Environment Variables (ensure it is checked for 'Production').",
      };
    }
    const msg = error?.message || "";
    if (msg.includes("Can't reach database server") || msg.includes("connect")) {
      return {
        success: false,
        error: "Cannot reach database. Please check connection status.",
      };
    }
    // Never leak raw database/Prisma error messages to the client
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function changeAdminPassword(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Please log in to update your password." };
  }
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All password fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  // Strong password enforcement
  if (newPassword.length < 10) {
    return { success: false, error: "Password must be at least 10 characters long." };
  }
  if (!/[A-Z]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one number (0-9)." };
  }
  if (!/[^A-Za-z0-9]/.test(newPassword)) {
    return { success: false, error: "Password must contain at least one special symbol (e.g. !@#$%^&*)." };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId },
    });

    if (!admin) {
      return { success: false, error: "Admin user not found." };
    }

    const isCurrentValid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHash = await hashPassword(newPassword);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    await logAuditEvent({
      action: "admin.password.changed",
      actor: { id: admin.id, email: admin.email },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Change password error:", error);
    return { success: false, error: error?.message || "Failed to update password." };
  }
}

export async function adminLogout() {
  await logAuditEvent({ action: "admin.logout" });
  await destroySession();
  redirect(`${getAdminPrefix()}/login`);
}

// ─── Admin: Approve Volunteer ──────────────────────────────────────────────────

export async function approveVolunteer(volunteerId: string, assignedRole?: string) {
  const session = await requireAdmin();

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

  await logAuditEvent({
    action: "volunteer.approve",
    targetType: "Volunteer",
    targetId: volunteerId,
    metadata: { generatedVolunteerId: generatedId, assignedRole },
    actor: { id: session.userId, email: session.user.email },
  });

  revalidatePath("/velvt-management/volunteers");
  revalidatePath("/volunteers");
  return { success: true, volunteerId: generatedId };
}

// ─── Admin: Revoke Volunteer ───────────────────────────────────────────────────

export async function revokeVolunteer(volunteerId: string) {
  try {
    const session = await requireAdmin();

    await prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });

    logAuditEvent({
      action: "volunteer.revoke",
      targetType: "Volunteer",
      targetId: volunteerId,
      actor: { id: session.userId, email: session.user.email },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    return { success: true };
  } catch (error: any) {
    console.error("Revoke volunteer error:", error);
    return { success: false, error: error?.message || "Failed to revoke volunteer." };
  }
}

// ─── Admin: Mark Volunteer Verified ────────────────────────────────────────────

export async function verifyVolunteer(volunteerId: string) {
  try {
    const session = await requireAdmin();

    await prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        status: "verified",
      },
    });

    logAuditEvent({
      action: "volunteer.verify",
      targetType: "Volunteer",
      targetId: volunteerId,
      actor: { id: session.userId, email: session.user.email },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    return { success: true };
  } catch (error: any) {
    console.error("Verify volunteer error:", error);
    return { success: false, error: error?.message || "Failed to verify volunteer." };
  }
}

export async function updateVolunteerPhoto(volunteerId: string, photo: string) {
  try {
    await requireAdmin();

    await prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        photo,
      },
    });

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    return { success: true };
  } catch (error: any) {
    console.error("Update volunteer photo error:", error);
    return { success: false, error: error?.message || "Failed to update volunteer photo." };
  }
}

export async function updateVolunteerSocials(volunteerId: string, socialLink: string) {
  try {
    await requireAdmin();

    await prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        socialLink,
      },
    });

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    return { success: true };
  } catch (error: any) {
    console.error("Update volunteer socials error:", error);
    return { success: false, error: error?.message || "Failed to update volunteer socials." };
  }
}

export async function deleteVolunteer(volunteerId: string) {
  try {
    const session = await requireAdmin();

    await prisma.volunteer.delete({
      where: { id: volunteerId },
    });

    logAuditEvent({
      action: "volunteer.delete",
      targetType: "Volunteer",
      targetId: volunteerId,
      actor: { id: session.userId, email: session.user.email },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    return { success: true };
  } catch (error: any) {
    console.error("Delete volunteer error:", error);
    return { success: false, error: error?.message || "Failed to delete volunteer." };
  }
}

export async function createVolunteerDirect(data: {
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  preferredRole: string;
  assignedRole?: string;
  eventId?: string;
  year?: number;
  status?: string;
  photo?: string;
  socialLink?: string;
  adminNotes?: string;
}) {
  try {
    const session = await requireAdmin();

    if (!data.fullName?.trim() || !data.email?.trim() || !data.phone?.trim()) {
      return { success: false, error: "Full name, email, and phone number are required." };
    }

    const year = data.year ? Number(data.year) : new Date().getFullYear();
    let targetEventId = data.eventId;

    if (!targetEventId) {
      const defaultEvent = await prisma.event.findFirst({
        orderBy: { date: "desc" },
      });
      if (defaultEvent) {
        targetEventId = defaultEvent.id;
      } else {
        const newEvent = await prisma.event.create({
          data: {
            name: `VELVT CURSE ${year}`,
            slug: `velvt-curse-${year}-${Date.now()}`,
            description: `Event operations archive for ${year}`,
            date: new Date(`${year}-11-01T18:00:00.000Z`),
          },
        });
        targetEventId = newEvent.id;
      }
    }

    const generatedId = await generateVolunteerId(year);
    const status = data.status || "verified";

    const volunteer = await prisma.volunteer.create({
      data: {
        volunteerId: generatedId,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        city: data.city?.trim() || "Silchar",
        preferredRole: data.preferredRole || "General Crew & Operations",
        assignedRole: data.assignedRole?.trim() || data.preferredRole || "General Crew & Operations",
        eventId: targetEventId,
        status,
        photo: data.photo || null,
        socialLink: data.socialLink || null,
        adminNotes: data.adminNotes || `Added directly via Admin Portal on ${new Date().toLocaleDateString()}`,
        consentGiven: true,
        approvedAt: status === "approved" || status === "verified" ? new Date() : null,
      },
      include: {
        event: { select: { name: true } },
      },
    });

    logAuditEvent({
      action: "volunteer.create_direct",
      targetType: "Volunteer",
      targetId: volunteer.id,
      metadata: { volunteerId: generatedId, year, status },
      actor: { id: session.userId, email: session.user.email },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    revalidatePath(`/verify/${generatedId}`);
    return { success: true, volunteer };
  } catch (error: any) {
    console.error("Direct volunteer creation error:", error);
    return { success: false, error: error?.message || "Failed to create volunteer." };
  }
}

export async function bulkImportVolunteers(
  records: Array<{
    fullName: string;
    email: string;
    phone: string;
    city?: string;
    preferredRole?: string;
    assignedRole?: string;
    year?: number;
    eventId?: string;
    status?: string;
    volunteerId?: string;
    socialLink?: string;
    adminNotes?: string;
  }>
) {
  try {
    const session = await requireAdmin();

    if (!records || records.length === 0) {
      return { success: false, error: "No records found to import." };
    }

    const existingEvents = await prisma.event.findMany({
      select: { id: true, name: true, date: true },
      orderBy: { date: "desc" },
    });
    const defaultUpcomingEvent =
      existingEvents.find((e) => e.date && new Date(e.date).getFullYear() === 2026) ||
      existingEvents[0];

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const row of records) {
      const email = row.email?.trim().toLowerCase();
      const fullName = row.fullName?.trim();
      const phone = row.phone?.trim();

      if (!email || !fullName) {
        errors.push(`Row skipped: missing name or email (${fullName || "Unknown"})`);
        continue;
      }

      const year = row.year ? Number(row.year) : new Date().getFullYear();
      let targetEventId = row.eventId;

      if (!targetEventId) {
        const matchEvent = existingEvents.find(
          (e) => e.date && new Date(e.date).getFullYear() === year
        );
        targetEventId = matchEvent?.id || defaultUpcomingEvent?.id;

        if (!targetEventId) {
          const newEvent = await prisma.event.create({
            data: {
              name: `VELVT CURSE ${year}`,
              slug: `velvt-curse-${year}-${Date.now()}`,
              description: `Event operations archive for ${year}`,
              date: new Date(`${year}-11-01T18:00:00.000Z`),
            },
          });
          targetEventId = newEvent.id;
        }
      }

      const effectiveRole =
        row.assignedRole?.trim() ||
        row.preferredRole?.trim() ||
        "General Crew & Operations";
      const rawStatus = row.status?.trim().toLowerCase();
      const validStatus = ["verified", "approved", "pending", "revoked", "rejected"].includes(
        rawStatus || ""
      )
        ? rawStatus
        : "verified";

      // Check if existing volunteer exists by volunteerId or email
      let existing = null;
      if (row.volunteerId?.trim()) {
        existing = await prisma.volunteer.findUnique({
          where: { volunteerId: row.volunteerId.trim() },
        });
      }
      if (!existing && email) {
        existing = await prisma.volunteer.findFirst({
          where: { email },
        });
      }

      if (existing) {
        await prisma.volunteer.update({
          where: { id: existing.id },
          data: {
            fullName,
            phone: phone || existing.phone,
            city: row.city?.trim() || existing.city,
            assignedRole: effectiveRole,
            preferredRole: row.preferredRole?.trim() || existing.preferredRole,
            status: validStatus || existing.status,
            ...(row.socialLink && { socialLink: row.socialLink }),
            ...(row.adminNotes && { adminNotes: row.adminNotes }),
            ...(validStatus === "verified" || validStatus === "approved"
              ? { approvedAt: existing.approvedAt || new Date() }
              : {}),
          },
        });
        updatedCount++;
      } else {
        const generatedId =
          row.volunteerId?.trim() || (await generateVolunteerId(year));
        await prisma.volunteer.create({
          data: {
            volunteerId: generatedId,
            fullName,
            email,
            phone: phone || "N/A",
            city: row.city?.trim() || "Silchar",
            preferredRole: effectiveRole,
            assignedRole: effectiveRole,
            eventId: targetEventId,
            status: validStatus || "verified",
            consentGiven: true,
            socialLink: row.socialLink || null,
            adminNotes:
              row.adminNotes ||
              `Imported via Bulk CSV on ${new Date().toLocaleDateString()}`,
            approvedAt:
              validStatus === "verified" || validStatus === "approved"
                ? new Date()
                : null,
          },
        });
        createdCount++;
      }
    }

    logAuditEvent({
      action: "volunteer.bulk_import_csv",
      targetType: "Volunteer",
      metadata: {
        total: records.length,
        createdCount,
        updatedCount,
        errorsCount: errors.length,
      },
      actor: { id: session.userId, email: session.user.email },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");

    return {
      success: true,
      createdCount,
      updatedCount,
      totalProcessed: createdCount + updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error("Bulk import volunteers error:", error);
    return {
      success: false,
      error: error?.message || "Failed to bulk import volunteers.",
    };
  }
}

// ─── Admin: Update Inquiry Status ──────────────────────────────────────────────

export async function updateInquiryStatus(
  inquiryId: string,
  status: string,
  adminNotes?: string
) {
  const session = await requireAdmin();

  try {
    await prisma.contactInquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    logAuditEvent({
      action: "inquiry.update_status",
      targetType: "ContactInquiry",
      targetId: inquiryId,
      metadata: { status },
      actor: { id: session.userId, email: session.user.email },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/velvt-management/inquiries");
    return { success: true };
  } catch (error: any) {
    console.error("Update inquiry status error:", error);
    return { success: false, error: error?.message || "Failed to update inquiry status." };
  }
}

export async function deleteInquiry(inquiryId: string) {
  try {
    const session = await requireAdmin();

    await prisma.contactInquiry.delete({
      where: { id: inquiryId },
    });

    logAuditEvent({
      action: "inquiry.delete",
      targetType: "ContactInquiry",
      targetId: inquiryId,
      actor: { id: session.userId, email: session.user.email },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/velvt-management/inquiries");
    return { success: true };
  } catch (error: any) {
    console.error("Delete inquiry error:", error);
    return { success: false, error: error?.message || "Failed to delete inquiry." };
  }
}

// ─── Admin: Events ─────────────────────────────────────────────────────────────

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string || "").trim();
  const rawSlug = (formData.get("slug") as string || "").trim().toLowerCase();
  const slug = rawSlug
    ? rawSlug.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `event-${Date.now()}`;
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
  const venueCity = (formData.get("venueCity") as string) || "Silchar";
  const venueAddress = (formData.get("venueAddress") as string) || "Silchar, Assam, India";
  const venueMapLink = (formData.get("venueMapLink") as string) || null;
  const venueAccessInfo = (formData.get("venueAccessInfo") as string) || null;
  const venueParkingInfo = (formData.get("venueParkingInfo") as string) || null;
  const isFeatured = formData.get("isFeatured") === "true";

  if (!name || !description || !dateStr) {
    return { success: false, error: "Name, description, and date are required." };
  }

  try {
    // Guard against slug collisions with a user-friendly error
    const existingSlug = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      return { success: false, error: `An event with the slug "${slug}" already exists. Please choose a different name or slug.` };
    }

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
              mapLink: venueMapLink,
              accessInfo: venueAccessInfo,
              parkingInfo: venueParkingInfo,
            },
          },
        }),
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvt-management/events");
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
  const hasFeaturedField = formData.has("isFeatured");
  const isFeatured = formData.get("isFeatured") === "true";
  const venueName = formData.get("venueName") as string;
  const venueCity = formData.get("venueCity") as string;
  const venueAddress = formData.get("venueAddress") as string;
  const venueMapLink = (formData.get("venueMapLink") as string) || null;
  const venueAccessInfo = (formData.get("venueAccessInfo") as string) || null;
  const venueParkingInfo = (formData.get("venueParkingInfo") as string) || null;

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
        ...(hasFeaturedField ? { isFeatured } : {}),
        ...(venueName && {
          venue: {
            upsert: {
              create: {
                name: venueName,
                city: venueCity || "Silchar",
                address: venueAddress || "Silchar, Assam, India",
                mapLink: venueMapLink,
                accessInfo: venueAccessInfo,
                parkingInfo: venueParkingInfo,
              },
              update: {
                name: venueName,
                city: venueCity || "Silchar",
                address: venueAddress || "Silchar, Assam, India",
                mapLink: venueMapLink,
                accessInfo: venueAccessInfo,
                parkingInfo: venueParkingInfo,
              },
            },
          },
        }),
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvt-management/events");
    return { success: true, event };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { success: false, error: error?.message || "Failed to update event." };
  }
}

export async function archiveEvent(eventId: string) {
  try {
    await requireAdmin();

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status: "archived" },
    });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvt-management/events");
    return { success: true };
  } catch (error: any) {
    console.error("Archive event error:", error);
    return { success: false, error: error?.message || "Failed to archive event." };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await requireAdmin();

    // Clear featured event setting if this event was featured
    await prisma.siteSetting.updateMany({
      where: { key: "featured_event_id", value: eventId },
      data: { value: "" },
    }).catch(() => {});

    // Delete event (PostgreSQL natively cascades ticketTypes, venues, announcements, faqs, etc.)
    await prisma.event.delete({ where: { id: eventId } });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/velvt-management/events");
    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    // Fallback: if database foreign key constraint blocked it, clean dependents in parallel
    try {
      await Promise.allSettled([
        prisma.galleryItem.updateMany({ where: { eventId }, data: { eventId: null } }),
        prisma.partner.updateMany({ where: { eventId }, data: { eventId: null } }),
        prisma.pressMention.updateMany({ where: { eventId }, data: { eventId: null } }),
        prisma.issuedTicket.deleteMany({ where: { eventId } }),
        prisma.ticketType.deleteMany({ where: { eventId } }),
        prisma.eventScheduleItem.deleteMany({ where: { eventId } }),
        prisma.eventAnnouncement.deleteMany({ where: { eventId } }),
        prisma.eventFAQ.deleteMany({ where: { eventId } }),
        prisma.venue.deleteMany({ where: { eventId } }),
        prisma.volunteer.deleteMany({ where: { eventId } }),
      ]);
      await prisma.event.delete({ where: { id: eventId } });
      revalidatePath("/");
      revalidatePath("/events");
      revalidatePath("/velvt-management/events");
      return { success: true };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr?.message || error?.message || "Failed to delete event." };
    }
  }
}

// ─── Admin: Event Schedule Management ──────────────────────────────────────────

export async function createScheduleItem(data: {
  eventId: string;
  time: string;
  title: string;
  description?: string;
  displayOrder?: number;
}) {
  try {
    await requireAdmin();
    if (!data.eventId || !data.time || !data.title) {
      return { success: false, error: "Time, title, and event are required." };
    }

    const order =
      data.displayOrder ??
      (await prisma.eventScheduleItem.count({ where: { eventId: data.eventId } })) + 1;

    const item = await prisma.eventScheduleItem.create({
      data: {
        eventId: data.eventId,
        time: data.time.trim(),
        title: data.title.trim(),
        description: data.description?.trim() || null,
        displayOrder: order,
      },
    });

    const event = await prisma.event.findUnique({ where: { id: data.eventId }, select: { slug: true } });
    revalidatePath("/");
    revalidatePath("/events");
    if (event?.slug) revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvt-management/events");

    return { success: true, item };
  } catch (error: any) {
    console.error("Create schedule item error:", error);
    return { success: false, error: error?.message || "Failed to create schedule item." };
  }
}

export async function updateScheduleItem(
  id: string,
  data: {
    time: string;
    title: string;
    description?: string;
    displayOrder?: number;
  }
) {
  try {
    await requireAdmin();
    const item = await prisma.eventScheduleItem.update({
      where: { id },
      data: {
        time: data.time.trim(),
        title: data.title.trim(),
        description: data.description !== undefined ? data.description.trim() || null : undefined,
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
      include: { event: { select: { slug: true } } },
    });

    revalidatePath("/");
    revalidatePath("/events");
    if (item.event?.slug) revalidatePath(`/events/${item.event.slug}`);
    revalidatePath("/velvt-management/events");

    return { success: true, item };
  } catch (error: any) {
    console.error("Update schedule item error:", error);
    return { success: false, error: error?.message || "Failed to update schedule item." };
  }
}

export async function deleteScheduleItem(id: string) {
  try {
    await requireAdmin();
    const item = await prisma.eventScheduleItem.delete({
      where: { id },
      include: { event: { select: { slug: true } } },
    });

    revalidatePath("/");
    revalidatePath("/events");
    if (item.event?.slug) revalidatePath(`/events/${item.event.slug}`);
    revalidatePath("/velvt-management/events");

    return { success: true };
  } catch (error: any) {
    console.error("Delete schedule item error:", error);
    return { success: false, error: error?.message || "Failed to delete schedule item." };
  }
}

export async function clearScheduleItems(eventId: string) {
  try {
    await requireAdmin();
    await prisma.eventScheduleItem.deleteMany({ where: { eventId } });

    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
    revalidatePath("/");
    revalidatePath("/events");
    if (event?.slug) revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvt-management/events");

    return { success: true };
  } catch (error: any) {
    console.error("Clear schedule items error:", error);
    return { success: false, error: error?.message || "Failed to clear schedule items." };
  }
}

export async function populateTemplateSchedule(eventId: string) {
  try {
    await requireAdmin();
    // Delete existing
    await prisma.eventScheduleItem.deleteMany({ where: { eventId } });

    const template = [
      { time: "7:00 PM", title: "Gates Open", description: "Welcome to the event. Door entry begins.", displayOrder: 1 },
      { time: "7:30 PM", title: "Immersive Experience Begins", description: "Explore the themed installations and atmospheric zones.", displayOrder: 2 },
      { time: "8:30 PM", title: "Live Performances", description: "Curated performances and entertainment.", displayOrder: 3 },
      { time: "10:00 PM", title: "Main Event", description: "The centrepiece experience of the evening.", displayOrder: 4 },
      { time: "12:00 AM", title: "Closing", description: "The night draws to a close. Until next time.", displayOrder: 5 },
    ];

    await prisma.eventScheduleItem.createMany({
      data: template.map((t) => ({ ...t, eventId })),
    });

    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
    revalidatePath("/");
    revalidatePath("/events");
    if (event?.slug) revalidatePath(`/events/${event.slug}`);
    revalidatePath("/velvt-management/events");

    return { success: true };
  } catch (error: any) {
    console.error("Populate template schedule error:", error);
    return { success: false, error: error?.message || "Failed to load template schedule." };
  }
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
    revalidatePath("/velvt-management/events");
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
    revalidatePath("/velvt-management/events");
    return { success: true, ticket };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update ticket." };
  }
}

export async function toggleTicketType(ticketId: string, isActive: boolean) {
  try {
    await requireAdmin();

    const ticket = await prisma.ticketType.update({
      where: { id: ticketId },
      data: { isActive },
    });

    revalidatePath("/tickets");
    revalidatePath("/velvt-management/events");
    return { success: true, ticket };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to toggle ticket." };
  }
}

export async function deleteTicketType(ticketId: string) {
  try {
    await requireAdmin();

    const existing = await prisma.ticketType.findUnique({
      where: { id: ticketId },
      include: { event: { select: { slug: true } } },
    });

    await prisma.ticketType.delete({ where: { id: ticketId } });

    revalidatePath("/tickets");
    revalidatePath("/velvt-management/events");
    if (existing?.event?.slug) {
      revalidatePath(`/events/${existing.event.slug}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete ticket." };
  }
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
    revalidatePath("/velvt-management/team");
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
    revalidatePath("/velvt-management/team");
    return { success: true, member };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update team member." };
  }
}

export async function toggleTeamMemberPublish(id: string, isPublished: boolean) {
  try {
    await requireAdmin();

    const member = await prisma.teamMember.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/");
    revalidatePath("/team");
    revalidatePath("/velvt-management/team");
    return { success: true, member };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to toggle team member." };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await requireAdmin();

    await prisma.teamMember.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/team");
    revalidatePath("/velvt-management/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete team member." };
  }
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
    revalidatePath("/velvt-management/gallery");
    return { success: true, item };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to add gallery item." };
  }
}

export async function toggleGalleryPublish(id: string, isPublished: boolean) {
  try {
    await requireAdmin();

    const item = await prisma.galleryItem.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/velvt-management/gallery");
    return { success: true, item };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to toggle gallery item." };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    await requireAdmin();

    await prisma.galleryItem.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/velvt-management/gallery");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete gallery item." };
  }
}

export async function bulkDeleteGalleryItems(ids: string[]) {
  try {
    await requireAdmin();
    if (!ids || ids.length === 0) return { success: true, count: 0 };

    const res = await prisma.galleryItem.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/velvt-management/gallery");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("Bulk delete gallery items error:", error);
    return { success: false, error: error?.message || "Failed to delete selected items." };
  }
}

export async function bulkUpdateGalleryItems(
  ids: string[],
  updates: { year?: number; eventId?: string | null; isPublished?: boolean }
) {
  try {
    await requireAdmin();
    if (!ids || ids.length === 0) return { success: true, count: 0 };

    const data: any = {};
    if (updates.year !== undefined) data.year = updates.year;
    if (updates.eventId !== undefined) data.eventId = updates.eventId || null;
    if (updates.isPublished !== undefined) data.isPublished = updates.isPublished;

    const res = await prisma.galleryItem.updateMany({
      where: { id: { in: ids } },
      data,
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/velvt-management/gallery");
    return { success: true, count: res.count };
  } catch (error: any) {
    console.error("Bulk update gallery items error:", error);
    return { success: false, error: error?.message || "Failed to update selected items." };
  }
}

export async function bulkCreateGalleryItems(
  items: Array<{
    url: string;
    caption?: string | null;
    type?: string;
    year?: number;
    eventId?: string | null;
    isPublished?: boolean;
  }>
) {
  try {
    await requireAdmin();
    if (!items || items.length === 0) return { success: true, count: 0 };

    const created = await prisma.galleryItem.createMany({
      data: items.map((it, idx) => ({
        url: it.url,
        caption: it.caption || null,
        type: it.type || "image",
        year: it.year || new Date().getFullYear(),
        eventId: it.eventId || null,
        displayOrder: idx,
        isPublished: it.isPublished !== false,
      })),
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/velvt-management/gallery");
    return { success: true, count: created.count };
  } catch (error: any) {
    console.error("Bulk create gallery items error:", error);
    return { success: false, error: error?.message || "Failed to add media items." };
  }
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
    revalidatePath("/velvt-management/partners");
    return { success: true, partner };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create partner." };
  }
}

export async function togglePartnerActive(id: string, isActive: boolean) {
  try {
    await requireAdmin();

    const partner = await prisma.partner.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/");
    revalidatePath("/velvt-management/partners");
    return { success: true, partner };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to toggle partner." };
  }
}

export async function deletePartner(id: string) {
  try {
    await requireAdmin();

    await prisma.partner.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/velvt-management/partners");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete partner." };
  }
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
    revalidatePath("/velvt-management/partners");
    return { success: true, mention };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create press mention." };
  }
}

export async function togglePressPublish(id: string, isPublished: boolean) {
  try {
    await requireAdmin();

    const mention = await prisma.pressMention.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/press");
    revalidatePath("/velvt-management/partners");
    return { success: true, mention };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to toggle press mention." };
  }
}

export async function deletePressMention(id: string) {
  try {
    await requireAdmin();

    await prisma.pressMention.delete({ where: { id } });

    revalidatePath("/press");
    revalidatePath("/velvt-management/partners");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete press mention." };
  }
}

// ─── Admin: Site Settings / CMS ────────────────────────────────────────────────

export async function updateSiteSettings(settings: Record<string, string>) {
  const session = await requireAdmin();

  try {
    for (const [key, value] of Object.entries(settings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    await logAuditEvent({
      action: "settings.update",
      targetType: "SiteSetting",
      metadata: { updatedKeys: Object.keys(settings) },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/events");
    revalidatePath("/tickets");
    revalidatePath("/gallery");
    revalidatePath("/team");
    revalidatePath("/press");
    revalidatePath("/volunteers");
    revalidatePath("/contact");
    revalidatePath("/velvt-management/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update settings." };
  }
}

// ─── Admin: Event FAQs ────────────────────────────────────────────────────────

export async function createEventFAQ(formData: FormData) {
  const session = await requireAdmin();

  const raw = {
    question: (formData.get("question") as string || "").trim(),
    answer: (formData.get("answer") as string || "").trim(),
    displayOrder: parseInt(formData.get("displayOrder") as string, 10) || 0,
    eventId: formData.get("eventId") as string,
  };

  const result = eventFaqSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid FAQ data",
    };
  }

  try {
    const faq = await prisma.eventFAQ.create({
      data: result.data,
      include: { event: { select: { slug: true } } },
    });

    await logAuditEvent({
      action: "event.faq.create",
      targetType: "EventFAQ",
      targetId: faq.id,
      metadata: { question: faq.question, eventId: faq.eventId },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath(`/events/${faq.event.slug}`);
    revalidatePath("/velvt-management/events");
    return { success: true, faq };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create FAQ." };
  }
}

export async function updateEventFAQ(id: string, formData: FormData) {
  const session = await requireAdmin();

  const raw = {
    question: (formData.get("question") as string || "").trim(),
    answer: (formData.get("answer") as string || "").trim(),
    displayOrder: parseInt(formData.get("displayOrder") as string, 10) || 0,
    eventId: formData.get("eventId") as string,
  };

  const result = eventFaqSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid FAQ data",
    };
  }

  try {
    const faq = await prisma.eventFAQ.update({
      where: { id },
      data: {
        question: result.data.question,
        answer: result.data.answer,
        displayOrder: result.data.displayOrder,
      },
      include: { event: { select: { slug: true } } },
    });

    await logAuditEvent({
      action: "event.faq.update",
      targetType: "EventFAQ",
      targetId: faq.id,
      metadata: { question: faq.question },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath(`/events/${faq.event.slug}`);
    revalidatePath("/velvt-management/events");
    return { success: true, faq };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update FAQ." };
  }
}

export async function deleteEventFAQ(id: string) {
  const session = await requireAdmin();

  try {
    const faq = await prisma.eventFAQ.delete({
      where: { id },
      include: { event: { select: { slug: true } } },
    });

    await logAuditEvent({
      action: "event.faq.delete",
      targetType: "EventFAQ",
      targetId: id,
      metadata: { question: faq.question },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath(`/events/${faq.event.slug}`);
    revalidatePath("/velvt-management/events");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete FAQ." };
  }
}

// ─── Ticket Generator & Gateman Operations ──────────────────────────────────

function resolveSiteUrl(reqHeaders?: Headers): string {
  // If explicitly configured with a public non-localhost domain, use it
  if (
    process.env.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL.startsWith("http") &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (reqHeaders) {
    const host = reqHeaders.get("host");
    if (host && !host.includes("localhost")) {
      const proto = reqHeaders.get("x-forwarded-proto") || "https";
      return `${proto}://${host}`;
    }
  }
  // Always default to canonical production domain so QR codes are universally scannable
  return "https://velvt-in.vercel.app";
}

export async function generateIssuedTicket(formData: FormData) {
  const session = await requireAdmin();
  const reqHeaders = await headers();
  const baseUrl = resolveSiteUrl(reqHeaders);

  const raw = {
    attendeeName: (formData.get("attendeeName") as string || "").trim(),
    attendeeEmail: (formData.get("attendeeEmail") as string || "").trim(),
    attendeePhone: (formData.get("attendeePhone") as string || "").trim(),
    tierName: (formData.get("tierName") as string || "VIP Pass").trim(),
    priceInRupees: parseFloat(formData.get("priceInRupees") as string) || 0,
    eventId: (formData.get("eventId") as string || "").trim(),
    ticketTypeId: (formData.get("ticketTypeId") as string || "").trim() || undefined,
    notes: (formData.get("notes") as string || "").trim() || undefined,
  };

  const parsed = issueTicketSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid ticket details",
    };
  }

  try {
    // If ticketTypeId is provided, verify capacity before issuing
    if (parsed.data.ticketTypeId) {
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: parsed.data.ticketTypeId },
      });
      if (ticketType && ticketType.totalQuantity > 0 && ticketType.soldCount >= ticketType.totalQuantity) {
        return {
          success: false,
          error: `Capacity reached for ${ticketType.name} (${ticketType.soldCount}/${ticketType.totalQuantity} passes issued). Cannot issue further passes.`,
        };
      }
    }

    // Generate unique serial ticket number (guaranteeing uniqueness with loop check)
    let ticketNumber = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      attempts++;
      ticketNumber = generateTicketNumber("VLT-2026");
      const existing = await prisma.issuedTicket.findUnique({
        where: { ticketNumber },
        select: { id: true },
      });
      if (!existing) isUnique = true;
    }

    if (!isUnique) {
      ticketNumber = `VLT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }

    // High entropy verification security token
    const securityToken = generateSecurityToken();
    const verificationUrl = `${baseUrl}/verify/ticket/${securityToken}`;

    // Pre-generate scannable high-res QR code
    const qrCodeDataUrl = await generateTicketQRCode(verificationUrl);

    // Save ticket to database
    const ticket = await prisma.issuedTicket.create({
      data: {
        ticketNumber,
        securityToken,
        attendeeName: parsed.data.attendeeName,
        attendeeEmail: parsed.data.attendeeEmail,
        attendeePhone: parsed.data.attendeePhone || null,
        tierName: parsed.data.tierName,
        priceInPaise: Math.round(parsed.data.priceInRupees * 100),
        status: "valid",
        isCheckedIn: false,
        notes: parsed.data.notes || null,
        qrCodeDataUrl,
        eventId: parsed.data.eventId,
        ticketTypeId: parsed.data.ticketTypeId || null,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            date: true,
            time: true,
            venue: {
              select: {
                name: true,
                city: true,
                address: true,
              },
            },
          },
        },
      },
    });

    // Atomically increment soldCount on the associated ticket type
    if (parsed.data.ticketTypeId) {
      await prisma.ticketType.update({
        where: { id: parsed.data.ticketTypeId },
        data: { soldCount: { increment: 1 } },
      }).catch((e) => console.warn("Failed to increment soldCount:", e));
    }

    await logAuditEvent({
      action: "ticket.issue",
      targetType: "IssuedTicket",
      targetId: ticket.id,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.attendeeName,
        tierName: ticket.tierName,
        eventId: ticket.eventId,
      },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/tickets");
    return { success: true, ticket };
  } catch (error: any) {
    console.error("Failed to generate ticket:", error);
    return { success: false, error: error?.message || "Failed to generate pass." };
  }
}

/**
 * Gateman check-in action (requires Gateman or Admin session)
 */
export async function checkInIssuedTicket(
  identifier: string,
  gatekeeperName?: string,
  notes?: string
) {
  const session = await requireGatemanOrAdmin();

  if (!identifier || identifier.trim().length === 0) {
    return { success: false, status: "invalid", message: "Missing ticket identifier." };
  }

  const cleanIdentifier = identifier.trim();
  const effectiveGatekeeper = gatekeeperName && gatekeeperName !== "Gate Staff"
    ? gatekeeperName
    : session.user.name;

  try {
    // Lookup by either securityToken (QR code scan) or ticketNumber (manual entry)
    const ticket = await prisma.issuedTicket.findFirst({
      where: {
        OR: [
          { securityToken: cleanIdentifier },
          { ticketNumber: { equals: cleanIdentifier, mode: "insensitive" } },
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            time: true,
          },
        },
      },
    });

    if (!ticket) {
      return {
        success: false,
        status: "not_found",
        message: "Pass not found. Invalid or counterfeit ticket QR.",
      };
    }

    // Check if gateman is constrained to a specific event
    if (session.user.role === "gateman" && session.user.assignedEventId) {
      if (ticket.eventId !== session.user.assignedEventId) {
        return {
          success: false,
          status: "wrong_event",
          ticket,
          message: "Pass is issued for a DIFFERENT EVENT. Do not admit at this gate.",
        };
      }
    }

    if (ticket.status === "cancelled" || ticket.status === "revoked") {
      return {
        success: false,
        status: "revoked",
        ticket,
        message: "This pass has been CANCELLED or REVOKED. Deny entry.",
      };
    }

    // Mark as checked in atomically to eliminate race conditions / double-admittance
    const checkInTime = new Date();
    const updateResult = await prisma.issuedTicket.updateMany({
      where: {
        id: ticket.id,
        isCheckedIn: false,
        status: { notIn: ["cancelled", "revoked"] },
      },
      data: {
        isCheckedIn: true,
        checkedInAt: checkInTime,
        checkedInBy: effectiveGatekeeper,
        status: "used",
        ...(notes ? { notes: ticket.notes ? `${ticket.notes} | ${notes}` : notes } : {}),
      },
    });

    if (updateResult.count === 0) {
      // Race condition caught: ticket was scanned and admitted concurrently
      const latest = await prisma.issuedTicket.findUnique({
        where: { id: ticket.id },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              date: true,
              time: true,
            },
          },
        },
      });

      return {
        success: false,
        status: "already_checked_in",
        ticket: latest || ticket,
        message: `Pass ALREADY SCANNED and admitted on ${
          latest?.checkedInAt
            ? new Date(latest.checkedInAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "earlier"
        } by ${latest?.checkedInBy || "Gate Staff"}. Verify identity before admitting.`,
      };
    }

    const updated = await prisma.issuedTicket.findUnique({
      where: { id: ticket.id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            time: true,
          },
        },
      },
    });

    if (!updated) {
      return { success: false, status: "error", message: "Failed to retrieve admitted ticket record." };
    }

    await logAuditEvent({
      action: "ticket.checkin",
      targetType: "IssuedTicket",
      targetId: updated.id,
      metadata: {
        ticketNumber: updated.ticketNumber,
        attendeeName: updated.attendeeName,
        checkedInBy: effectiveGatekeeper,
      },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/tickets");
    revalidatePath("/velvt-management/gate");
    revalidatePath(`/verify/ticket/${ticket.securityToken}`);

    return {
      success: true,
      status: "admitted",
      ticket: updated,
      message: "Valid Pass! Attendee admitted and checked in successfully.",
    };
  } catch (error: any) {
    console.error("Check-in error:", error);
    return { success: false, status: "error", message: error?.message || "Failed to process check-in." };
  }
}

/**
 * Admin toggle check-in status (allows reverting or manually toggling)
 */
export async function toggleTicketCheckIn(ticketId: string, currentStatus: boolean) {
  const session = await requireAdmin();

  try {
    const updated = await prisma.issuedTicket.update({
      where: { id: ticketId },
      data: {
        isCheckedIn: !currentStatus,
        checkedInAt: !currentStatus ? new Date() : null,
        checkedInBy: !currentStatus ? `Admin (${session.user.name})` : null,
        status: !currentStatus ? "used" : "valid",
      },
    });

    await logAuditEvent({
      action: !currentStatus ? "ticket.checkin.manual" : "ticket.checkin.revert",
      targetType: "IssuedTicket",
      targetId: updated.id,
      metadata: { ticketNumber: updated.ticketNumber, isCheckedIn: updated.isCheckedIn },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/tickets");
    return { success: true, ticket: updated };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update check-in status." };
  }
}

/**
 * Admin delete/revoke ticket
 */
export async function deleteIssuedTicket(id: string) {
  const session = await requireAdmin();

  try {
    const ticket = await prisma.issuedTicket.delete({
      where: { id },
    });

    if (ticket.ticketTypeId) {
      await prisma.ticketType.update({
        where: { id: ticket.ticketTypeId },
        data: { soldCount: { decrement: 1 } },
      }).catch((e) => console.warn("Failed to decrement soldCount:", e));
    }

    await logAuditEvent({
      action: "ticket.delete",
      targetType: "IssuedTicket",
      targetId: id,
      metadata: { ticketNumber: ticket.ticketNumber, attendeeName: ticket.attendeeName },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/tickets");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete ticket." };
  }
}

/**
 * Public Gateman Verification query by security token or ticket number
 */
export async function getTicketVerificationData(identifier: string) {
  if (!identifier) return null;
  const clean = identifier.trim();

  // Rate limiting to prevent token brute-forcing and automated scraping
  const hdrs = await headers();
  const clientIp = getClientIdentifier(hdrs);
  const rl = checkRateLimit(`verify-ticket:${clientIp}`, { maxRequests: 40, windowSeconds: 60 });
  if (!rl.success) {
    return null;
  }

  const session = await getSession().catch(() => null);
  const isAuthorizedStaff = Boolean(
    session && ["admin", "founder", "gateman", "core_team"].includes(session.user.role)
  );

  try {
    const ticket = await prisma.issuedTicket.findFirst({
      where: {
        OR: [
          { securityToken: clean },
          { ticketNumber: { equals: clean, mode: "insensitive" } },
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            date: true,
            time: true,
            status: true,
          },
        },
      },
    });

    if (!ticket) return null;

    // Mask attendee email and phone for unauthenticated public viewers
    let displayEmail = ticket.attendeeEmail;
    let displayPhone = ticket.attendeePhone;

    if (!isAuthorizedStaff) {
      if (displayEmail && displayEmail.includes("@")) {
        const [local, domain] = displayEmail.split("@");
        displayEmail =
          local.length <= 2
            ? `${local[0] || "*"}***@${domain}`
            : `${local[0]}***${local[local.length - 1]}@${domain}`;
      }
      if (displayPhone) {
        const digits = displayPhone.replace(/\D/g, "");
        displayPhone = digits.length >= 4 ? `+91 ******${digits.slice(-4)}` : "******";
      }
    }

    // Return sanitized ticket data for verification view
    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      securityToken: ticket.securityToken,
      attendeeName: ticket.attendeeName,
      attendeeEmail: displayEmail,
      attendeePhone: displayPhone,
      tierName: ticket.tierName,
      priceInPaise: ticket.priceInPaise,
      status: ticket.status,
      isCheckedIn: ticket.isCheckedIn,
      checkedInAt: ticket.checkedInAt ? ticket.checkedInAt.toISOString() : null,
      checkedInBy: ticket.checkedInBy,
      notes: isAuthorizedStaff ? ticket.notes : null,
      createdAt: ticket.createdAt.toISOString(),
      event: {
        id: ticket.event.id,
        name: ticket.event.name,
        date: ticket.event.date.toISOString(),
        time: ticket.event.time,
        status: ticket.event.status,
      },
    };
  } catch (error) {
    console.error("Error fetching verification data:", error);
    return null;
  }
}

// ─── Fast Gate Search & Gate Operations ──────────────────────────────────────

/**
 * Fast search for gatekeepers (search by attendee name, email, phone, serial #, or token)
 */
export async function searchTicketsForGate(query: string, eventId?: string) {
  const session = await requireGatemanOrAdmin();
  const clean = (query || "").trim();

  // If gateman has an assigned event, force that eventId
  const effectiveEventId =
    session.user.role === "gateman" && session.user.assignedEventId
      ? session.user.assignedEventId
      : eventId && eventId !== "all"
      ? eventId
      : undefined;

  const whereClause: any = {};
  if (effectiveEventId) {
    whereClause.eventId = effectiveEventId;
  }

  if (clean.length > 0) {
    whereClause.OR = [
      { ticketNumber: { contains: clean, mode: "insensitive" } },
      { securityToken: { contains: clean, mode: "insensitive" } },
      { attendeeName: { contains: clean, mode: "insensitive" } },
      { attendeeEmail: { contains: clean, mode: "insensitive" } },
      { attendeePhone: { contains: clean, mode: "insensitive" } },
    ];
  }

  try {
    const tickets = await prisma.issuedTicket.findMany({
      where: whereClause,
      take: 25,
      orderBy: [{ isCheckedIn: "asc" }, { createdAt: "desc" }],
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            date: true,
            time: true,
          },
        },
      },
    });

    return tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      securityToken: t.securityToken,
      attendeeName: t.attendeeName,
      attendeeEmail: t.attendeeEmail,
      attendeePhone: t.attendeePhone,
      tierName: t.tierName,
      status: t.status,
      isCheckedIn: t.isCheckedIn,
      checkedInAt: t.checkedInAt ? t.checkedInAt.toISOString() : null,
      checkedInBy: t.checkedInBy,
      notes: t.notes,
      event: {
        id: t.event.id,
        name: t.event.name,
      },
    }));
  } catch (error) {
    console.error("searchTicketsForGate error:", error);
    return [];
  }
}

/**
 * Fetch recently admitted passes at the gate
 */
export async function getRecentGateCheckIns(eventId?: string) {
  const session = await requireGatemanOrAdmin();
  const effectiveEventId =
    session.user.role === "gateman" && session.user.assignedEventId
      ? session.user.assignedEventId
      : eventId && eventId !== "all"
      ? eventId
      : undefined;

  try {
    const tickets = await prisma.issuedTicket.findMany({
      where: {
        isCheckedIn: true,
        ...(effectiveEventId ? { eventId: effectiveEventId } : {}),
      },
      take: 15,
      orderBy: { checkedInAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      securityToken: t.securityToken,
      attendeeName: t.attendeeName,
      tierName: t.tierName,
      checkedInAt: t.checkedInAt ? t.checkedInAt.toISOString() : null,
      checkedInBy: t.checkedInBy,
      event: {
        id: t.event.id,
        name: t.event.name,
      },
    }));
  } catch (error) {
    console.error("getRecentGateCheckIns error:", error);
    return [];
  }
}

// ─── Gateman Account Management (Admin Only) ────────────────────────────────

/**
 * List all Gatemen with their assigned events and total admissions
 */
export async function listGatemen() {
  await requireAdmin();

  try {
    const gatemen = await prisma.adminUser.findMany({
      where: { role: "gateman" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedEventId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const eventIds = Array.from(
      new Set(gatemen.map((g) => g.assignedEventId).filter(Boolean))
    ) as string[];

    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true, name: true },
    });
    const eventMap = new Map(events.map((e) => [e.id, e.name]));

    const checkInCounts = await Promise.all(
      gatemen.map(async (g) => {
        const count = await prisma.issuedTicket.count({
          where: { checkedInBy: g.name },
        });
        return { id: g.id, count };
      })
    );
    const countMap = new Map(checkInCounts.map((c) => [c.id, c.count]));

    return gatemen.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      eventName: g.assignedEventId
        ? eventMap.get(g.assignedEventId) || "Unknown Event"
        : "All Events",
      checkInCount: countMap.get(g.id) || 0,
    }));
  } catch (error) {
    console.error("listGatemen error:", error);
    return [];
  }
}

/**
 * Admin creates a new Gateman staff account
 */
export async function createGatemanUser(formData: FormData) {
  const session = await requireAdmin();
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = (formData.get("password") as string || "").trim();
  const assignedEventId = (formData.get("assignedEventId") as string || "").trim() || null;

  if (!name || !email || !password) {
    return { success: false, error: "Name, email, and password are required." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: "gateman",
        assignedEventId,
        isActive: true,
      },
    });

    await logAuditEvent({
      action: "gateman.create",
      targetType: "AdminUser",
      targetId: user.id,
      metadata: { name, email, assignedEventId },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/gatemen");
    return {
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    };
  } catch (error: any) {
    console.error("Create gateman error:", error);
    return { success: false, error: error?.message || "Failed to create gateman." };
  }
}

/**
 * Admin toggles Gateman active / inactive status
 */
export async function toggleGatemanStatus(id: string, currentStatus: boolean) {
  const session = await requireAdmin();
  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target || target.role !== "gateman") {
      return { success: false, error: "Target account is not a gateman staff member or does not exist." };
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    await logAuditEvent({
      action: !currentStatus ? "gateman.activate" : "gateman.deactivate",
      targetType: "AdminUser",
      targetId: user.id,
      metadata: { email: user.email, isActive: user.isActive },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/gatemen");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update status." };
  }
}

/**
 * Admin deletes a Gateman account
 */
export async function deleteGatemanUser(id: string) {
  const session = await requireAdmin();
  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target || target.role !== "gateman") {
      return { success: false, error: "Target account is not a gateman staff member or does not exist." };
    }

    const user = await prisma.adminUser.delete({
      where: { id },
    });

    await logAuditEvent({
      action: "gateman.delete",
      targetType: "AdminUser",
      targetId: id,
      metadata: { email: user.email },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/gatemen");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete gateman." };
  }
}

/**
 * Admin resets a Gateman password
 */
export async function resetGatemanPassword(formData: FormData) {
  const session = await requireAdmin();
  const id = (formData.get("id") as string || "").trim();
  const newPassword = (formData.get("newPassword") as string || "").trim();

  if (!id || !newPassword) {
    return { success: false, error: "Gateman ID and new password are required." };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target || target.role !== "gateman") {
      return { success: false, error: "Target account is not a gateman staff member or does not exist." };
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });

    await logAuditEvent({
      action: "gateman.reset_password",
      targetType: "AdminUser",
      targetId: id,
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/gatemen");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to reset password." };
  }
}

/**
 * Re-render QR codes for any tickets that currently contain localhost:3000
 */
export async function refreshLegacyTicketQRCodes() {
  await requireAdmin();
  try {
    const tickets = await prisma.issuedTicket.findMany();
    let updatedCount = 0;
    for (const t of tickets) {
      const verifyUrl = `https://velvt.in/verify/ticket/${t.securityToken}`;
      const qrCodeDataUrl = await generateTicketQRCode(verifyUrl);
      await prisma.issuedTicket.update({
        where: { id: t.id },
        data: { qrCodeDataUrl },
      });
      updatedCount++;
    }
    revalidatePath("/velvt-management/tickets");
    return { success: true, count: updatedCount };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to refresh passes." };
  }
}

// ─── Theme Switcher System ──────────────────────────────────────────────────

export async function updateSiteTheme(theme: string) {
  const validThemes = [
    "blood_moon",
    "halloween_pumpkin",
    "phantom_ghost",
    "witch_coven",
    "halloween_mix",
    "legacy",
    "halloween",
  ];
  if (!validThemes.includes(theme)) {
    return { success: false, error: "Invalid theme identifier." };
  }

  const normalizedTheme = theme === "halloween" ? "blood_moon" : theme;

  try {
    const session = await requireAdmin();
    if (session.user.role === "admin" || session.user.role === "founder") {
      await prisma.siteSetting.upsert({
        where: { key: "site_theme" },
        create: { key: "site_theme", value: normalizedTheme },
        update: { value: normalizedTheme },
      });

      await logAuditEvent({
        action: "settings.theme_switch",
        targetType: "SiteSetting",
        metadata: { theme: normalizedTheme },
        actor: { id: session.userId, email: session.user.email },
      });

      revalidatePath("/", "layout");
      return { success: true, theme: normalizedTheme, persisted: true };
    }
    return { success: true, theme: normalizedTheme, localOnly: true };
  } catch {
    // Non-admin preview: return success so client localStorage/cookie switch happens instantly
    return { success: true, theme: normalizedTheme, localOnly: true };
  }
}

// ─── Core Team Credentials & Permissions ────────────────────────────────────

export async function assignTeamCredentials(data: {
  teamMemberId: string;
  email: string;
  password: string;
  role?: "core_team" | "admin" | "founder";
}) {
  const session = await requireAdmin();
  if (session.user.role !== "admin" && session.user.role !== "founder") {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const member = await prisma.teamMember.findUnique({
    where: { id: data.teamMemberId },
  });

  if (!member) {
    return { success: false, error: "Team member not found." };
  }

  const cleanEmail = data.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Valid email address required." };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    const passwordHash = await hashPassword(data.password);
    // Prevent privilege escalation: only founders can assign the founder role
    let assignedRole = data.role || "core_team";
    if (assignedRole === "founder" && session.user.role !== "founder") {
      assignedRole = "admin";
    }

    // Check if an AdminUser exists for this email or teamMemberId
    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { teamMemberId: member.id }],
      },
    });

    // Guard: A non-founder admin CANNOT modify or take over a Founder account!
    if (existing && existing.role === "founder" && session.user.role !== "founder") {
      return { success: false, error: "Unauthorized: Only a Founder can modify Founder credentials." };
    }

    if (existing) {
      await prisma.adminUser.update({
        where: { id: existing.id },
        data: {
          email: cleanEmail,
          passwordHash,
          name: member.name,
          role: assignedRole,
          teamMemberId: member.id,
          isActive: true,
        },
      });
    } else {
      await prisma.adminUser.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: member.name,
          role: assignedRole,
          teamMemberId: member.id,
          isActive: true,
        },
      });
    }

    await logAuditEvent({
      action: "team.credentials_assigned",
      targetType: "AdminUser",
      targetId: member.id,
      metadata: { memberName: member.name, email: cleanEmail, role: assignedRole },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to assign credentials." };
  }
}

export async function removeTeamCredentials(teamMemberId: string) {
  const session = await requireAdmin();
  if (session.user.role !== "admin" && session.user.role !== "founder") {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const existingAccounts = await prisma.adminUser.findMany({
      where: { teamMemberId },
    });

    // Guard: A non-founder admin CANNOT delete Founder credentials!
    if (existingAccounts.some((a) => a.role === "founder") && session.user.role !== "founder") {
      return { success: false, error: "Unauthorized: Only a Founder can remove Founder credentials." };
    }

    await prisma.adminUser.deleteMany({
      where: { teamMemberId },
    });

    await logAuditEvent({
      action: "team.credentials_removed",
      targetType: "AdminUser",
      targetId: teamMemberId,
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to remove credentials." };
  }
}

// ─── Mass Ticket Generator Action ─────────────────────────────────────────────

export async function bulkGenerateIssuedTickets(data: {
  eventId: string;
  tierName?: string;
  priceInRupees?: number;
  quantity?: number;
  prefix?: string;
  notes?: string;
  records?: Array<{
    attendeeName: string;
    attendeeEmail?: string;
    attendeePhone?: string;
    tierName?: string;
    priceInRupees?: number;
    notes?: string;
  }>;
}) {
  try {
    const session = await requireAdmin();
    const reqHeaders = await headers();
    const baseUrl = resolveSiteUrl(reqHeaders);

    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      select: {
        id: true,
        name: true,
        slug: true,
        date: true,
        time: true,
        status: true,
        venue: {
          select: {
            name: true,
            city: true,
            address: true,
          },
        },
      },
    });

    if (!event) {
      return { success: false, error: "Event not found." };
    }

    const defaultTier = data.tierName?.trim() || "General Entry";
    const defaultPricePaise = Math.round((Number(data.priceInRupees) || 0) * 100);
    const prefix = data.prefix?.trim() || "Guest";
    const createdTickets = [];

    // Check if user submitted specific sheet/table records
    if (data.records && Array.isArray(data.records) && data.records.length > 0) {
      const validRecords = data.records
        .map((r) => ({
          attendeeName: (r.attendeeName || "").trim(),
          attendeeEmail: (r.attendeeEmail || "").trim(),
          attendeePhone: (r.attendeePhone || "").trim(),
          tierName: (r.tierName || "").trim() || defaultTier,
          priceInPaise:
            r.priceInRupees !== undefined && !isNaN(Number(r.priceInRupees))
              ? Math.round(Number(r.priceInRupees) * 100)
              : defaultPricePaise,
          notes: (r.notes || "").trim() || data.notes?.trim() || `Sheet generated batch on ${new Date().toLocaleDateString()}`,
        }))
        .filter((r) => r.attendeeName.length > 0);

      if (validRecords.length === 0) {
        return { success: false, error: "No valid attendee names found in spreadsheet records." };
      }

      for (let i = 0; i < validRecords.length; i++) {
        const item = validRecords[i];
        let ticketNumber = "";
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
          attempts++;
          ticketNumber = generateTicketNumber("VLT-2026");
          const existing = await prisma.issuedTicket.findUnique({
            where: { ticketNumber },
            select: { id: true },
          });
          if (!existing) isUnique = true;
        }
        if (!isUnique) {
          ticketNumber = `VLT-${Date.now().toString(36).toUpperCase()}-${i + 1}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        }

        const securityToken = generateSecurityToken();
        const verificationUrl = `${baseUrl}/verify/ticket/${securityToken}`;
        const qrCodeDataUrl = await generateTicketQRCode(verificationUrl);

        const email =
          item.attendeeEmail ||
          `${item.attendeeName.toLowerCase().replace(/[^a-z0-9]/g, "")}${i + 1}@velvt.in`;

        const ticket = await prisma.issuedTicket.create({
          data: {
            ticketNumber,
            securityToken,
            attendeeName: item.attendeeName,
            attendeeEmail: email,
            attendeePhone: item.attendeePhone || null,
            tierName: item.tierName,
            priceInPaise: item.priceInPaise,
            status: "valid",
            isCheckedIn: false,
            notes: item.notes,
            qrCodeDataUrl,
            eventId: event.id,
          },
          include: {
            event: {
              select: {
                id: true,
                name: true,
                slug: true,
                date: true,
                time: true,
                status: true,
                venue: { select: { name: true, city: true, address: true } },
              },
            },
          },
        });

        createdTickets.push(ticket);
      }
    } else {
      // Fallback: Quantity-based sequential guest generation
      const qty = Math.min(Math.max(Number(data.quantity) || 1, 1), 200);

      for (let i = 0; i < qty; i++) {
        let ticketNumber = "";
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
          attempts++;
          ticketNumber = generateTicketNumber("VLT-2026");
          const existing = await prisma.issuedTicket.findUnique({
            where: { ticketNumber },
            select: { id: true },
          });
          if (!existing) isUnique = true;
        }
        if (!isUnique) {
          ticketNumber = `VLT-${Date.now().toString(36).toUpperCase()}-${i + 1}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        }

        const securityToken = generateSecurityToken();
        const verificationUrl = `${baseUrl}/verify/ticket/${securityToken}`;
        const qrCodeDataUrl = await generateTicketQRCode(verificationUrl);

        const attendeeName = `${prefix} #${i + 1}`;
        const attendeeEmail = `${prefix.toLowerCase().replace(/[^a-z0-9]/g, "")}${i + 1}@velvt.in`;

        const ticket = await prisma.issuedTicket.create({
          data: {
            ticketNumber,
            securityToken,
            attendeeName,
            attendeeEmail,
            attendeePhone: null,
            tierName: defaultTier,
            priceInPaise: defaultPricePaise,
            status: "valid",
            isCheckedIn: false,
            notes: data.notes?.trim() || `Mass generated batch on ${new Date().toLocaleDateString()}`,
            qrCodeDataUrl,
            eventId: event.id,
          },
          include: {
            event: {
              select: {
                id: true,
                name: true,
                slug: true,
                date: true,
                time: true,
                status: true,
                venue: { select: { name: true, city: true, address: true } },
              },
            },
          },
        });

        createdTickets.push(ticket);
      }
    }

    await logAuditEvent({
      action: "ticket.bulk_issue",
      targetType: "IssuedTicket",
      metadata: { count: createdTickets.length, eventId: event.id, tierName: defaultTier },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/tickets");
    revalidatePath("/tickets");
    return { success: true, count: createdTickets.length, tickets: createdTickets };
  } catch (error: any) {
    console.error("Bulk generate tickets error:", error);
    return { success: false, error: error?.message || "Failed to bulk generate tickets." };
  }
}

// ─── Mass Volunteer Generator Action ──────────────────────────────────────────

export async function bulkGenerateVolunteers(data: {
  eventId?: string;
  year?: number;
  role?: string;
  quantity?: number;
  status?: string;
  namePrefix?: string;
  records?: Array<{
    fullName: string;
    email?: string;
    phone?: string;
    role?: string;
    city?: string;
  }>;
}) {
  try {
    const session = await requireAdmin();

    const year = data.year ? Number(data.year) : new Date().getFullYear();
    let targetEventId = data.eventId;

    if (!targetEventId) {
      const defaultEvent = await prisma.event.findFirst({
        orderBy: { date: "desc" },
      });
      targetEventId = defaultEvent?.id;
      if (!targetEventId) {
        const newEvent = await prisma.event.create({
          data: {
            name: `VELVT CURSE ${year}`,
            slug: `velvt-curse-${year}-${Date.now()}`,
            description: `Event operations archive for ${year}`,
            date: new Date(`${year}-11-01T18:00:00.000Z`),
          },
        });
        targetEventId = newEvent.id;
      }
    }

    const defaultRole = data.role?.trim() || "General Crew & Operations";
    const status = data.status || "verified";
    const namePrefix = data.namePrefix?.trim() || "Volunteer Crew";
    const createdVolunteers = [];

    // Check if user submitted specific sheet/table records
    if (data.records && Array.isArray(data.records) && data.records.length > 0) {
      const validRecords = data.records
        .map((r) => ({
          fullName: (r.fullName || "").trim(),
          email: (r.email || "").trim(),
          phone: (r.phone || "").trim() || "+91 90000 00000",
          role: (r.role || "").trim() || defaultRole,
          city: (r.city || "").trim() || "Silchar",
        }))
        .filter((r) => r.fullName.length > 0);

      if (validRecords.length === 0) {
        return { success: false, error: "No valid volunteer names found in spreadsheet records." };
      }

      for (let i = 0; i < validRecords.length; i++) {
        const item = validRecords[i];
        const generatedId = await generateVolunteerId(year);
        const email =
          item.email || `crew.${generatedId.toLowerCase()}@velvt.in`;

        const volunteer = await prisma.volunteer.create({
          data: {
            volunteerId: generatedId,
            fullName: item.fullName,
            email,
            phone: item.phone,
            city: item.city,
            preferredRole: item.role,
            assignedRole: item.role,
            eventId: targetEventId,
            status,
            consentGiven: true,
            approvedAt: status === "approved" || status === "verified" ? new Date() : null,
            adminNotes: `Sheet registered crew record on ${new Date().toLocaleDateString()}`,
          },
          include: {
            event: { select: { id: true, name: true, date: true } },
          },
        });

        createdVolunteers.push(volunteer);
      }
    } else {
      const qty = Math.min(Math.max(Number(data.quantity) || 1, 1), 100);

      for (let i = 0; i < qty; i++) {
        const generatedId = await generateVolunteerId(year);
        const fullName = `${namePrefix} #${i + 1}`;
        const email = `crew.${generatedId.toLowerCase()}@velvt.in`;

        const volunteer = await prisma.volunteer.create({
          data: {
            volunteerId: generatedId,
            fullName,
            email,
            phone: "+91 90000 00000",
            city: "Silchar",
            preferredRole: defaultRole,
            assignedRole: defaultRole,
            eventId: targetEventId,
            status,
            consentGiven: true,
            approvedAt: status === "approved" || status === "verified" ? new Date() : null,
            adminNotes: `Mass generated crew record on ${new Date().toLocaleDateString()}`,
          },
          include: {
            event: { select: { id: true, name: true, date: true } },
          },
        });

        createdVolunteers.push(volunteer);
      }
    }

    await logAuditEvent({
      action: "volunteer.bulk_create",
      targetType: "Volunteer",
      metadata: { count: createdVolunteers.length, year, role: defaultRole, status },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    return { success: true, count: createdVolunteers.length, volunteers: createdVolunteers };
  } catch (error: any) {
    console.error("Bulk generate volunteers error:", error);
    return { success: false, error: error?.message || "Failed to bulk generate volunteers." };
  }
}

// ─── Direct Volunteer Status Update Action (Dropdown) ─────────────────────────

export async function updateVolunteerStatusDirect(volunteerId: string, newStatus: string) {
  try {
    const session = await requireAdmin();

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: { event: true },
    });

    if (!volunteer) {
      return { success: false, error: "Volunteer not found." };
    }

    const validStatus = ["pending", "approved", "verified", "revoked", "rejected"].includes(newStatus)
      ? newStatus
      : "verified";

    let volunteerIdCode = volunteer.volunteerId;
    if ((validStatus === "approved" || validStatus === "verified") && !volunteerIdCode) {
      const year = volunteer.event?.date ? new Date(volunteer.event.date).getFullYear() : new Date().getFullYear();
      volunteerIdCode = await generateVolunteerId(year);
    }

    const updated = await prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        status: validStatus,
        volunteerId: volunteerIdCode,
        ...(validStatus === "approved" || validStatus === "verified"
          ? { approvedAt: volunteer.approvedAt || new Date() }
          : {}),
        ...(validStatus === "revoked"
          ? { revokedAt: new Date() }
          : {}),
      },
      include: {
        event: { select: { id: true, name: true, date: true } },
      },
    });

    await logAuditEvent({
      action: "volunteer.status_change",
      targetType: "Volunteer",
      targetId: volunteerId,
      metadata: { previousStatus: volunteer.status, newStatus: validStatus, volunteerId: volunteerIdCode },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/volunteers");
    revalidatePath("/volunteers");
    if (volunteerIdCode) {
      revalidatePath(`/verify/${volunteerIdCode}`);
    }
    return { success: true, volunteer: updated };
  } catch (error: any) {
    console.error("Update volunteer status error:", error);
    return { success: false, error: error?.message || "Failed to update status." };
  }
}

// ─── Direct Ticket Status Update Action (Dropdown) ────────────────────────────

export async function updateTicketStatusDirect(ticketId: string, newStatus: string) {
  try {
    const session = await requireAdmin();

    const ticket = await prisma.issuedTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Ticket not found." };
    }

    const validStatus = ["valid", "used", "cancelled", "revoked"].includes(newStatus)
      ? newStatus
      : "valid";

    const isUsed = validStatus === "used";
    const updated = await prisma.issuedTicket.update({
      where: { id: ticketId },
      data: {
        status: validStatus,
        isCheckedIn: isUsed,
        checkedInAt: isUsed ? (ticket.checkedInAt || new Date()) : null,
        checkedInBy: isUsed ? (ticket.checkedInBy || session.user.name || "Admin") : null,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            date: true,
            time: true,
            status: true,
          },
        },
      },
    });

    await logAuditEvent({
      action: "ticket.status_change",
      targetType: "IssuedTicket",
      targetId: ticketId,
      metadata: { previousStatus: ticket.status, newStatus: validStatus },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/tickets");
    revalidatePath(`/verify/ticket/${ticket.securityToken}`);
    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("Update ticket status error:", error);
    return { success: false, error: error?.message || "Failed to update ticket status." };
  }
}

// ─── Quick Volunteer Verification Lookup for Gate ─────────────────────────────

export async function getVolunteerVerificationData(identifier: string) {
  try {
    const clean = identifier.trim();
    // Only return public-safe fields — never expose email, phone, adminNotes, or experience
    return await prisma.volunteer.findFirst({
      where: {
        OR: [
          { volunteerId: clean },
          { id: clean },
        ],
      },
      select: {
        id: true,
        volunteerId: true,
        fullName: true,
        status: true,
        assignedRole: true,
        preferredRole: true,
        photo: true,
        socialLink: true,
        approvedAt: true,
        event: { select: { id: true, name: true, date: true } },
      },
    });
  } catch {
    return null;
  }
}

// ─── Volunteer Application Tracking (Public Status Lookup) ───────────────────

export async function trackVolunteerApplicationStatus(query: string) {
  if (!query || !query.trim()) {
    return { found: false, error: "Please enter an email address or Application/Volunteer ID." };
  }

  // Rate limiting to prevent email harvesting and brute force queries
  const hdrs = await headers();
  const clientIp = getClientIdentifier(hdrs);
  const rl = checkRateLimit(`track-vol:${clientIp}`, { maxRequests: 25, windowSeconds: 60 });
  if (!rl.success) {
    return { found: false, error: "Too many status lookup attempts. Please try again in a few minutes." };
  }

  const clean = query.trim().toLowerCase();
  try {
    const volunteer = await prisma.volunteer.findFirst({
      where: {
        OR: [
          { volunteerId: { equals: clean, mode: "insensitive" } },
          { id: { equals: clean, mode: "insensitive" } },
          { email: { equals: clean, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        volunteerId: true,
        fullName: true,
        status: true,
        preferredRole: true,
        assignedRole: true,
        appliedAt: true,
        approvedAt: true,
        event: { select: { name: true, date: true } },
      },
    });

    if (!volunteer) {
      return { found: false, error: "No volunteer record found matching your query." };
    }

    return { found: true, volunteer };
  } catch (err: any) {
    return { found: false, error: "Failed to look up application status." };
  }
}

// ─── Sponsor Inquiries ────────────────────────────────────────────────────────

export async function submitSponsorInquiry(formData: FormData) {
  const honeypot = formData.get("_gotcha") || formData.get("website");
  if (honeypot && String(honeypot).trim().length > 0) {
    return { success: true };
  }

  const hdrs = await headers();
  const clientIp = getClientIdentifier(hdrs);
  const rl = checkRateLimit(`sponsor:${clientIp}`, RATE_LIMITS.sponsorInquiry);
  if (!rl.success) {
    return { success: false, errors: { _form: ["Too many submissions. Please try again in a few minutes."] } };
  }

  const raw = {
    companyName: formData.get("companyName") as string,
    contactPerson: formData.get("contactPerson") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || "",
    sponsorshipInterest: formData.get("sponsorshipInterest") as string,
    budgetRange: (formData.get("budgetRange") as string) || "",
    collaborationType: (formData.get("collaborationType") as string) || "",
    message: formData.get("message") as string,
  };

  const result = sponsorInquirySchema.safeParse(raw);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const inquiry = await prisma.sponsorInquiry.create({
      data: {
        companyName: result.data.companyName,
        contactPerson: result.data.contactPerson,
        email: result.data.email,
        phone: result.data.phone || null,
        sponsorshipInterest: result.data.sponsorshipInterest,
        budgetRange: result.data.budgetRange || null,
        collaborationType: result.data.collaborationType || null,
        message: result.data.message,
        status: "new",
      },
    });

    await logAuditEvent({
      action: "sponsor.inquiry_created",
      targetType: "SponsorInquiry",
      targetId: inquiry.id,
      metadata: { companyName: result.data.companyName, email: result.data.email },
      ipAddress: clientIp,
    });

    revalidatePath("/velvt-management/sponsors");
    return { success: true };
  } catch (error: any) {
    console.error("Sponsor inquiry error:", error);
    return { success: false, errors: { _form: ["Failed to submit sponsor inquiry. Please try again."] } };
  }
}

export async function updateSponsorInquiryStatus(id: string, status: string, adminNotes?: string) {
  const session = await requireAdmin();
  const validStatuses = ["new", "in_discussion", "confirmed", "declined"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status." };
  }

  try {
    const updated = await prisma.sponsorInquiry.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    await logAuditEvent({
      action: "sponsor.inquiry_status_change",
      targetType: "SponsorInquiry",
      targetId: id,
      metadata: { newStatus: status },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/sponsors");
    return { success: true, inquiry: updated };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update inquiry status." };
  }
}

export async function deleteSponsorInquiry(id: string) {
  const session = await requireAdmin();
  try {
    await prisma.sponsorInquiry.delete({ where: { id } });
    await logAuditEvent({
      action: "sponsor.inquiry_deleted",
      targetType: "SponsorInquiry",
      targetId: id,
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/velvt-management/sponsors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete inquiry." };
  }
}

// ─── Newsletter Subscriptions ──────────────────────────────────────────────────

export async function subscribeNewsletter(formData: FormData) {
  const hdrs = await headers();
  const clientIp = getClientIdentifier(hdrs);
  const rl = checkRateLimit(`newsletter:${clientIp}`, RATE_LIMITS.newsletter);
  if (!rl.success) {
    return { success: false, error: "Too many subscription attempts. Please wait a moment." };
  }

  const raw = {
    email: (formData.get("email") as string || "").trim().toLowerCase(),
    consentGiven: formData.get("consentGiven") === "true" || formData.get("consent") === "true",
  };

  const result = newsletterSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || "Please enter a valid email and agree to updates." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: result.data.email },
      update: { status: "active" },
      create: {
        email: result.data.email,
        source: (formData.get("source") as string) || "website",
        status: "active",
      },
    });

    return { success: true, message: "You are now on the VELVT dispatch list." };
  } catch (error: any) {
    console.error("Newsletter error:", error);
    return { success: false, error: "Failed to subscribe. Please try again." };
  }
}

// ─── Testimonials Management ───────────────────────────────────────────────────

export async function createTestimonial(formData: FormData) {
  const session = await requireAdmin();
  const raw = {
    quote: formData.get("quote") as string,
    authorName: formData.get("authorName") as string,
    authorRole: formData.get("authorRole") as string,
    company: (formData.get("company") as string) || "",
    avatarUrl: (formData.get("avatarUrl") as string) || "",
    category: (formData.get("category") as "volunteer" | "sponsor" | "general") || "volunteer",
    rating: Number(formData.get("rating") || 5),
    displayOrder: Number(formData.get("displayOrder") || 0),
    isApproved: formData.get("isApproved") === "true",
    isFeatured: formData.get("isFeatured") === "true",
  };

  const result = testimonialSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const item = await prisma.testimonial.create({
      data: {
        quote: result.data.quote,
        authorName: result.data.authorName,
        authorRole: result.data.authorRole,
        company: result.data.company || null,
        avatarUrl: result.data.avatarUrl || null,
        category: result.data.category,
        rating: result.data.rating,
        displayOrder: result.data.displayOrder,
        isApproved: result.data.isApproved,
        isFeatured: result.data.isFeatured,
      },
    });

    await logAuditEvent({
      action: "testimonial.create",
      targetType: "Testimonial",
      targetId: item.id,
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/volunteers");
    revalidatePath("/sponsors");
    revalidatePath("/velvt-management/testimonials");
    return { success: true, testimonial: item };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create testimonial." };
  }
}

export async function updateTestimonial(id: string, formData: FormData) {
  const session = await requireAdmin();
  const raw = {
    quote: formData.get("quote") as string,
    authorName: formData.get("authorName") as string,
    authorRole: formData.get("authorRole") as string,
    company: (formData.get("company") as string) || "",
    avatarUrl: (formData.get("avatarUrl") as string) || "",
    category: (formData.get("category") as "volunteer" | "sponsor" | "general") || "volunteer",
    rating: Number(formData.get("rating") || 5),
    displayOrder: Number(formData.get("displayOrder") || 0),
    isApproved: formData.get("isApproved") === "true",
    isFeatured: formData.get("isFeatured") === "true",
  };

  const result = testimonialSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const item = await prisma.testimonial.update({
      where: { id },
      data: {
        quote: result.data.quote,
        authorName: result.data.authorName,
        authorRole: result.data.authorRole,
        company: result.data.company || null,
        avatarUrl: result.data.avatarUrl || null,
        category: result.data.category,
        rating: result.data.rating,
        displayOrder: result.data.displayOrder,
        isApproved: result.data.isApproved,
        isFeatured: result.data.isFeatured,
      },
    });

    await logAuditEvent({
      action: "testimonial.update",
      targetType: "Testimonial",
      targetId: id,
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/volunteers");
    revalidatePath("/sponsors");
    revalidatePath("/velvt-management/testimonials");
    return { success: true, testimonial: item };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update testimonial." };
  }
}

export async function deleteTestimonial(id: string) {
  const session = await requireAdmin();
  try {
    await prisma.testimonial.delete({ where: { id } });
    await logAuditEvent({
      action: "testimonial.delete",
      targetType: "Testimonial",
      targetId: id,
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/volunteers");
    revalidatePath("/sponsors");
    revalidatePath("/velvt-management/testimonials");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete testimonial." };
  }
}

export async function toggleTestimonialApproval(id: string) {
  const session = await requireAdmin();
  try {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Testimonial not found." };

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { isApproved: !existing.isApproved },
    });

    revalidatePath("/volunteers");
    revalidatePath("/sponsors");
    revalidatePath("/velvt-management/testimonials");
    return { success: true, isApproved: updated.isApproved };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to toggle testimonial approval." };
  }
}

// ─── Personal Portfolio CMS ───────────────────────────────────────────────────

export async function updatePortfolioProfile(formData: FormData) {
  const session = await requireStaffOrAdmin();
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "Member ID is required." };

  if (session.user.role === "core_team" && session.user.teamMemberId !== id) {
    return { success: false, error: "Core team members can only edit their own profile." };
  }

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) return { success: false, error: "Member not found." };

  try {
    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        name: (formData.get("name") as string) || member.name,
        role: (formData.get("role") as string) || member.role,
        category: (formData.get("category") as string) || member.category,
        bio: (formData.get("bio") as string) || member.bio,
        detailedBio: formData.get("detailedBio") !== null ? (formData.get("detailedBio") as string) : member.detailedBio,
        portrait: (formData.get("portrait") as string) || member.portrait,
        quote: formData.get("quote") !== null ? (formData.get("quote") as string) : member.quote,
        highlights: formData.get("highlights") !== null ? (formData.get("highlights") as string) : member.highlights,
        responsibilities: formData.get("responsibilities") !== null ? (formData.get("responsibilities") as string) : member.responsibilities,
        achievements: formData.get("achievements") !== null ? (formData.get("achievements") as string) : member.achievements,
        skills: formData.get("skills") !== null ? (formData.get("skills") as string) : member.skills,
        timeline: formData.get("timeline") !== null ? (formData.get("timeline") as string) : member.timeline,
        socialLinks: formData.get("socialLinks") !== null ? (formData.get("socialLinks") as string) : member.socialLinks,
        portfolioUrl: formData.get("portfolioUrl") !== null ? (formData.get("portfolioUrl") as string) : member.portfolioUrl,
        sectionVisibility: formData.get("sectionVisibility") !== null ? (formData.get("sectionVisibility") as string) : member.sectionVisibility,
        joinedYear: (formData.get("joinedYear") as string) || member.joinedYear,
        displayOrder: Number(formData.get("displayOrder") ?? member.displayOrder),
      },
    });

    await logAuditEvent({
      action: "team.portfolio_updated",
      targetType: "TeamMember",
      targetId: id,
      metadata: { name: updated.name, role: updated.role },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/team");
    revalidatePath(`/team/${id}`);
    revalidatePath("/founder");
    revalidatePath("/portfolio");
    revalidatePath("/velvt-management/portfolio");
    return { success: true, member: updated };
  } catch (error: any) {
    console.error("Portfolio update error:", error);
    return { success: false, error: error?.message || "Failed to update portfolio profile." };
  }
}

export async function togglePortfolioSection(
  memberId: string,
  sectionKey: string,
  isVisible: boolean
) {
  const session = await requireStaffOrAdmin();
  if (!memberId || !sectionKey) {
    return { success: false, error: "Member ID and section key are required." };
  }

  if (session.user.role === "core_team" && session.user.teamMemberId !== memberId) {
    return { success: false, error: "Core team members can only edit their own profile." };
  }

  const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!member) return { success: false, error: "Member not found." };

  try {
    let visibility: Record<string, boolean> = {};
    if (member.sectionVisibility) {
      try {
        visibility = JSON.parse(member.sectionVisibility);
      } catch {
        visibility = {};
      }
    }

    visibility[sectionKey] = isVisible;
    if (sectionKey === "showTimeline") {
      visibility.timeline = isVisible;
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        sectionVisibility: JSON.stringify(visibility),
      },
    });

    await logAuditEvent({
      action: "team.portfolio_section_toggled",
      targetType: "TeamMember",
      targetId: memberId,
      metadata: { sectionKey, isVisible, memberName: updated.name },
      actor: { id: session.userId, email: session.user.email },
    });

    revalidatePath("/team");
    revalidatePath(`/team/${memberId}`);
    revalidatePath("/founder");
    revalidatePath("/portfolio");
    revalidatePath("/velvt-management/portfolio");

    return { success: true, visibility, member: updated };
  } catch (error: any) {
    console.error("Toggle portfolio section error:", error);
    return { success: false, error: error?.message || "Failed to toggle section." };
  }
}

// ─── Global Search Across Public Content ──────────────────────────────────────

export async function performGlobalSearch(query: string) {
  if (!query || query.trim().length < 2) {
    return { events: [], team: [], press: [], faqs: [] };
  }

  const q = query.trim().toLowerCase();

  try {
    const [events, team, press, faqs] = await Promise.all([
      prisma.event.findMany({
        where: {
          status: { not: "draft" },
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { theme: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, slug: true, date: true, status: true, coverImage: true },
        take: 5,
      }),
      prisma.teamMember.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { role: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, role: true, portrait: true, category: true },
        take: 5,
      }),
      prisma.pressMention.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { publication: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, publication: true, url: true },
        take: 5,
      }),
      prisma.eventFAQ.findMany({
        where: {
          OR: [
            { question: { contains: q, mode: "insensitive" } },
            { answer: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, question: true, answer: true, event: { select: { slug: true, name: true } } },
        take: 5,
      }),
    ]);

    return { events, team, press, faqs };
  } catch (error) {
    console.error("Global search error:", error);
    return { events: [], team: [], press: [], faqs: [] };
  }
}






