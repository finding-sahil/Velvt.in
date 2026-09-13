// VELVT — Validation Schemas
import { z } from "zod";

// ─── Volunteer Registration ────────────────────────────────────────────────────

export const volunteerRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long"),
  city: z.string().min(2, "City is required"),
  preferredRole: z.string().min(1, "Please select a role"),
  experience: z.string().optional(),
  socialLink: z.string().optional().or(z.literal("")),
  consentGiven: z.literal(true, {
    message: "You must agree to the terms to continue",
  }),
  eventId: z.string().min(1, "Please select an event"),
});

export type VolunteerRegistrationInput = z.infer<typeof volunteerRegistrationSchema>;

// ─── Contact Form ──────────────────────────────────────────────────────────────

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  category: z.enum([
    "general",
    "collaboration",
    "sponsorship",
    "media",
    "volunteer",
    "venue",
  ]),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ─── Admin Login ───────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// ─── Event ─────────────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required"),
  theme: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  status: z.enum(["draft", "upcoming", "ongoing", "completed", "archived"]),
  ageRestriction: z.string().optional(),
  dressCode: z.string().optional(),
  entryInfo: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

// ─── Ticket Type ───────────────────────────────────────────────────────────────

export const ticketTypeSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  description: z.string().optional(),
  priceInPaise: z.number().min(0, "Price cannot be negative"),
  totalQuantity: z.number().min(0, "Quantity cannot be negative"),
  saleStart: z.string().optional(),
  saleEnd: z.string().optional(),
  bookingUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean(),
  eventId: z.string().min(1, "Event is required"),
});

export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;

// ─── Team Member ───────────────────────────────────────────────────────────────

export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(2, "Role is required"),
  category: z.string().default("Core Team"),
  bio: z.string().optional(),
  portrait: z.string().optional(),
  displayOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

// ─── Gallery Item ──────────────────────────────────────────────────────────────

export const galleryItemSchema = z.object({
  url: z.string().min(1, "Media URL is required"),
  caption: z.string().optional(),
  type: z.enum(["image", "video"]).default("image"),
  year: z.number().optional(),
  displayOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
  eventId: z.string().optional(),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

// ─── Partner ───────────────────────────────────────────────────────────────────

export const partnerSchema = z.object({
  name: z.string().min(2, "Partner name is required"),
  logo: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  type: z.enum(["partner", "sponsor", "media"]).default("partner"),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  eventId: z.string().optional(),
});

export type PartnerInput = z.infer<typeof partnerSchema>;

// ─── Press Mention ─────────────────────────────────────────────────────────────

export const pressMentionSchema = z.object({
  title: z.string().min(2, "Title is required"),
  publication: z.string().min(2, "Publication name is required"),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  excerpt: z.string().optional(),
  publishDate: z.string().optional(),
  displayOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
  eventId: z.string().optional(),
});

export type PressMentionInput = z.infer<typeof pressMentionSchema>;

// ─── Site Settings ─────────────────────────────────────────────────────────────

export const siteSettingsSchema = z.record(z.string(), z.string());
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// ─── Event FAQ ─────────────────────────────────────────────────────────────────

export const eventFaqSchema = z.object({
  question: z.string().min(2, "Question is required"),
  answer: z.string().min(2, "Answer is required"),
  displayOrder: z.number().default(0),
  eventId: z.string().min(1, "Event is required"),
});

export type EventFaqInput = z.infer<typeof eventFaqSchema>;

// ─── Issued Tickets & Gateman Check-in ─────────────────────────────────────────

export const issueTicketSchema = z.object({
  attendeeName: z.string().min(2, "Attendee name is required (at least 2 characters)"),
  attendeeEmail: z.string().email("Valid email address is required"),
  attendeePhone: z.string().optional().or(z.literal("")),
  tierName: z.string().min(1, "Ticket tier / pass name is required").default("VIP Pass"),
  priceInRupees: z.number().min(0, "Price cannot be negative").default(0),
  eventId: z.string().min(1, "Please select an event"),
  ticketTypeId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type IssueTicketInput = z.infer<typeof issueTicketSchema>;

export const checkInTicketSchema = z.object({
  identifier: z.string().min(1, "Ticket number or verification token is required"),
  gatekeeperName: z.string().optional().default("Gate Staff"),
  notes: z.string().optional(),
});

export type CheckInTicketInput = z.infer<typeof checkInTicketSchema>;

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonialSchema = z.object({
  quote: z.string().min(5, "Testimonial quote must be at least 5 characters"),
  authorName: z.string().min(2, "Author name is required"),
  authorRole: z.string().min(2, "Author role/title is required"),
  company: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  category: z.enum(["volunteer", "sponsor", "general"]).default("volunteer"),
  rating: z.number().min(1).max(5).default(5),
  displayOrder: z.number().default(0),
  isApproved: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

// ─── Sponsor Inquiry ──────────────────────────────────────────────────────────

export const sponsorInquirySchema = z.object({
  companyName: z.string().min(2, "Company or brand name is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Valid business email is required"),
  phone: z.string().optional().or(z.literal("")),
  sponsorshipInterest: z.string().min(1, "Please select an area of interest"),
  budgetRange: z.string().optional().or(z.literal("")),
  collaborationType: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type SponsorInquiryInput = z.infer<typeof sponsorInquirySchema>;

// ─── Newsletter Subscription ───────────────────────────────────────────────────

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  consentGiven: z.literal(true, {
    message: "You must consent to receive VELVT communications",
  }),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ─── Personal Portfolio ───────────────────────────────────────────────────────

export const portfolioProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  role: z.string().min(2, "Role/Designation is required"),
  category: z.string().default("Core Team"),
  bio: z.string().optional().or(z.literal("")),
  detailedBio: z.string().optional().or(z.literal("")),
  portrait: z.string().optional().or(z.literal("")),
  quote: z.string().optional().or(z.literal("")),
  highlights: z.string().optional().or(z.literal("")),
  responsibilities: z.string().optional().or(z.literal("")),
  achievements: z.string().optional().or(z.literal("")),
  skills: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  socialLinks: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().optional().or(z.literal("")),
  sectionVisibility: z.string().optional().or(z.literal("")),
  joinedYear: z.string().optional().or(z.literal("")),
  displayOrder: z.number().default(0),
});

export type PortfolioProfileInput = z.infer<typeof portfolioProfileSchema>;


