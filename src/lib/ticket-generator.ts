import crypto from "crypto";

const CHAR_SET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a clean, unambiguous serial number for tickets
 * Example: VLT-2026-X8K9P2
 */
export function generateTicketNumber(prefix = "VLT-2026"): string {
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, CHAR_SET.length);
    result += CHAR_SET[randomIndex];
  }
  return `${prefix}-${result}`;
}

/**
 * Generates a high-entropy UUID for secure QR verification links
 */
export function generateSecurityToken(): string {
  return crypto.randomUUID();
}

/**
 * Generates a scannable QR Code Data URL (PNG)
 */
export async function generateTicketQRCode(verifyUrl: string): Promise<string> {
  try {
    const QRCode = await import("qrcode");
    return await QRCode.toDataURL(verifyUrl, {
      width: 480,
      margin: 1.5,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H", // High error correction so it scans easily even in low light / screen glare
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}

/**
 * Formats paise to INR display string
 */
export function formatTicketPrice(priceInPaise: number): string {
  if (!priceInPaise || priceInPaise === 0) return "COMPLIMENTARY / VIP";
  const rupees = priceInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
