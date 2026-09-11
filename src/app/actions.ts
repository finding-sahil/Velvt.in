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
import { verifyPassword, hashPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";
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
    const admin = await prisma.adminUser.findUnique({
      where: { email: result.data.email },
    });

    if (!admin) {
      await logAuditEvent({
        action: "admin.login.failed",
        metadata: { attemptedEmail: result.data.email },
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

    await createSession(admin.id);

    await logAuditEvent({
      action: "admin.login.success",
      actor: { id: admin.id, email: admin.email },
      ipAddress: clientIp,
    });

    return { success: true };
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
        error: "Cannot reach Supabase database. Please check connection pooler status.",
      };
    }
    return { success: false, error: error?.message || "Login failed. Please try again." };
  }
}

export async function changeAdminPassword(formData: FormData) {
  const session = await requireAdmin();
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
  redirect("/velvt-management/login");
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
  const venueCity = (formData.get("venueCity") as string) || "Silchar";
  const venueAddress = (formData.get("venueAddress") as string) || "Silchar, Assam, India";
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
                city: venueCity || "Silchar",
                address: venueAddress || "Silchar, Assam, India",
              },
              update: {
                name: venueName,
                city: venueCity || "Silchar",
                address: venueAddress || "Silchar, Assam, India",
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

    await prisma.ticketType.delete({ where: { id: ticketId } });

    revalidatePath("/tickets");
    revalidatePath("/velvt-management/events");
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
    revalidatePath("/velvt-management/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update settings." };
  }
}

