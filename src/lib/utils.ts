// VELVT — Utility Functions

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Format price from paise to INR display
export function formatPrice(priceInPaise: number): string {
  const rupees = priceInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format date short
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Get year from date
export function getYear(date: Date | string): number {
  return new Date(date).getFullYear();
}

// Status display labels
export const eventStatusLabels: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  archived: "Archived",
};

export const volunteerStatusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  verified: "Verified",
  revoked: "Revoked",
  rejected: "Rejected",
};

export const inquiryCategoryLabels: Record<string, string> = {
  general: "General Inquiry",
  collaboration: "Event Collaboration",
  sponsorship: "Sponsorship",
  media: "Media / Press",
  volunteer: "Volunteer Support",
  venue: "Venue / Business Inquiry",
};

// Status colors for badges
export function getStatusColor(status: string): string {
  switch (status) {
    case "upcoming":
    case "approved":
    case "verified":
      return "bg-red-dim text-white border-red-glow";
    case "ongoing":
      return "bg-emerald-950/40 text-emerald-300 border-emerald-800/40";
    case "completed":
    case "resolved":
    case "read":
      return "bg-white/[0.05] text-g6 border-white/10";
    case "draft":
    case "pending":
    case "new":
      return "bg-amber-950/40 text-amber-300 border-amber-800/40";
    case "revoked":
    case "rejected":
    case "archived":
      return "bg-red/20 text-red border-red/40";
    default:
      return "bg-white/[0.05] text-g6 border-white/10";
  }
}

// Countdown calculation
export function getCountdown(targetDate: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false,
  };
}

// Generate slug from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Site URL helper
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
