// VELVET — Volunteer ID Generation
// Format: VEL-{YEAR}-{SEQUENCE} e.g. VEL-2026-00047

import { prisma } from "./db";

export async function generateVolunteerId(year?: number): Promise<string> {
  const currentYear = year || new Date().getFullYear();
  const prefix = `VEL-${currentYear}-`;

  // Count existing volunteers for this year to determine next sequence
  const count = await prisma.volunteer.count({
    where: {
      volunteerId: {
        startsWith: prefix,
      },
    },
  });

  // Try generating a unique ID with collision check
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const sequence = (count + 1 + attempts).toString().padStart(5, "0");
    const volunteerId = `${prefix}${sequence}`;

    // Check for collision
    const existing = await prisma.volunteer.findUnique({
      where: { volunteerId },
    });

    if (!existing) {
      return volunteerId;
    }

    attempts++;
  }

  // Fallback: use timestamp-based suffix
  const fallbackSeq = Date.now().toString().slice(-5);
  return `${prefix}${fallbackSeq}`;
}

// Validate volunteer ID format
export function isValidVolunteerIdFormat(id: string): boolean {
  return /^VEL-\d{4}-\d{5}$/.test(id);
}

// Extract year from volunteer ID
export function getYearFromVolunteerId(id: string): number | null {
  const match = id.match(/^VEL-(\d{4})-\d{5}$/);
  return match ? parseInt(match[1], 10) : null;
}
