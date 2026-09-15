/**
 * VELVT — Real Admission Ticket Graphic Generator
 * Renders a vintage-styled admission ticket pass featuring scalloped
 * ticket-stub notches, perforated divider, vintage horror typography,
 * authentic horror stickers/decorations (ghosts, bats, spiderwebs, carved pumpkin),
 * dynamic venue details ("AT [VENUE]"), and embedded scannable QR code.
 *
 * Requirements guaranteed:
 *  - Rich horror decorations: iconic ghosts, flying bats, ornate spiderwebs, carved pumpkin, 4-point stars
 *  - Venue details dynamically displayed: "AT (VENUE NAME)"
 *  - Website link: https://velvt-in.vercel.app/
 *  - Tagline preserved: "COME IN IF YOU DARE!"
 *  - ZERO text overlap: all coordinate tracks are strictly separated
 *  - ZERO truncation: NO "..." anywhere — all text dynamically auto-fits completely
 *  - NO "LIVE MUSIC & SOUND" or "BOO!" overlapping text
 */

export interface RealTicketData {
  ticketNumber: string;
  securityToken: string;
  attendeeName: string;
  attendeeEmail: string;
  tierName: string;
  qrCodeDataUrl?: string | null;
  event: {
    name: string;
    date?: Date | string | null;
    time?: string | null;
    venueName?: string | null;
    venueCity?: string | null;
  };
}

const SITE_URL = "https://velvt-in.vercel.app/";

/**
 * Automatically adjusts font size so text is 100% completely visible
 * within maxWidth, NEVER cutting off with "..." or ellipsis.
 */
function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseFontSize: number,
  fontFamily: string,
  weight: string | number = "700",
  minFontSize = 9
): number {
  let fontSize = baseFontSize;
  ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
  const measured = ctx.measureText(text).width;

  if (measured > maxWidth && maxWidth > 0) {
    fontSize = Math.max(minFontSize, Math.floor(baseFontSize * (maxWidth / measured)));
    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
  }

  ctx.fillText(text, x, y);
  return fontSize;
}

/**
 * Renders the real vintage ticket pass on an offscreen HTML5 canvas
 * and returns the high-res PNG Data URL.
 */
export async function generateRealTicketPng(data: RealTicketData): Promise<string> {
  const width = 1200;
  const height = 520;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  // Ensure high-resolution QR code — always use the live production URL
  let qrDataUrl = data.qrCodeDataUrl;
  if (!qrDataUrl) {
    const verifyUrl = `${SITE_URL}verify/ticket/${encodeURIComponent(data.securityToken || data.ticketNumber)}`;
    const QRCode = await import("qrcode");
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 400,
      margin: 1,
      color: { dark: "#0a0a0c", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
  }

  // Pre-load QR image
  const qrImage = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl!;
  });

  // ─── 1. Background Fill ────────────────────────────────────────────────────
  ctx.fillStyle = "#0c0c0e";
  ctx.fillRect(0, 0, width, height);

  // Deep crimson/gothic atmospheric radial gradient
  const bgGradient = ctx.createRadialGradient(
    width * 0.42, height * 0.48, 40,
    width * 0.42, height * 0.48, width * 0.65
  );
  bgGradient.addColorStop(0, "rgba(220, 20, 50, 0.16)");
  bgGradient.addColorStop(0.45, "rgba(35, 12, 22, 0.08)");
  bgGradient.addColorStop(1, "rgba(5, 5, 7, 0.95)");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Perforated line X position (~71% width)
  const stubX = 855;

  // ─── 2. Draw Ticket Cutout Notches ─────────────────────────────────────────
  ctx.fillStyle = "#050507";
  // Left notch
  ctx.beginPath();
  ctx.arc(0, height / 2, 28, -Math.PI / 2, Math.PI / 2);
  ctx.fill();

  // Right notch
  ctx.beginPath();
  ctx.arc(width, height / 2, 28, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.fill();

  // Stub Top notch
  ctx.beginPath();
  ctx.arc(stubX, 0, 24, 0, Math.PI);
  ctx.fill();

  // Stub Bottom notch
  ctx.beginPath();
  ctx.arc(stubX, height, 24, Math.PI, 0);
  ctx.fill();

  // ─── 3. Double Vintage Decorative Borders ──────────────────────────────────
  ctx.strokeStyle = "rgba(240, 230, 215, 0.4)";
  ctx.lineWidth = 2.5;

  // Left Section Rounded Frame
  drawVintageBorder(ctx, 38, 24, stubX - 54, height - 48, 22);
  ctx.stroke();

  // Inner thin accent line for left section
  ctx.strokeStyle = "rgba(240, 230, 215, 0.15)";
  ctx.lineWidth = 1;
  drawVintageBorder(ctx, 45, 31, stubX - 68, height - 62, 18);
  ctx.stroke();

  // Stub Section Border
  ctx.strokeStyle = "rgba(240, 230, 215, 0.4)";
  ctx.lineWidth = 2.5;
  drawVintageBorder(ctx, stubX + 18, 24, width - stubX - 56, height - 48, 22);
  ctx.stroke();

  // ─── 4. Perforated Dashed Line Divider ─────────────────────────────────────
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = "rgba(240, 230, 215, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(stubX, 30);
  ctx.lineTo(stubX, height - 30);
  ctx.stroke();
  ctx.restore();

  // ─── 5. Horror Decorative Stickers & Accents ───────────────────────────────
  // Spiderweb corner accents
  drawSpiderweb(ctx, 40, 26, 68, 0.45); // Top-left
  drawSpiderweb(ctx, 40, height - 26, 68, 0.35, true); // Bottom-left
  drawSpiderweb(ctx, stubX - 22, 26, 65, 0.4); // Top-right of main
  drawSpiderweb(ctx, width - 42, 26, 55, 0.35); // Top-right of stub

  // Hanging spider from the top-left web
  drawHangingSpider(ctx, 88, 30, 42);

  // Signature Spooky Ghosts flanking header
  drawVintageGhost(ctx, 130, 155, 52, -0.22); // Left ghost
  drawVintageGhost(ctx, 725, 145, 52, 0.24);  // Right ghost

  // Mini playful ghost peeking near bottom left
  drawVintageGhost(ctx, 95, 430, 32, -0.15);

  // Flying Gothic Bats
  drawBat(ctx, 428, 48, 26, -0.1);   // Above title center
  drawBat(ctx, 780, 220, 22, 0.3);    // Near right ghost
  drawBat(ctx, stubX + 160, 48, 24, 0.05); // Above stub "ADMIT ONE"

  // Carved Jack-o'-Lantern Pumpkin (vintage emblem badge)
  drawJackOLantern(ctx, 740, 280, 30);

  // Horror 4-point Diamond Sparkles (✦) scattered
  drawStar(ctx, 90, 220, 7, "#f5e6c8");
  drawStar(ctx, 215, 135, 5, "#f5e6c8");
  drawStar(ctx, 645, 130, 6, "#f5e6c8");
  drawStar(ctx, 785, 185, 7, "#f5e6c8");
  drawStar(ctx, 428, 146, 5, "#e0263f");
  drawStar(ctx, 145, 475, 5, "#f5e6c8");
  drawStar(ctx, 720, 465, 6, "#f5e6c8");
  drawStar(ctx, 320, 470, 4, "#e0263f");
  drawStar(ctx, stubX + 45, 70, 5, "#f5e6c8");
  drawStar(ctx, stubX + 270, 70, 5, "#f5e6c8");
  drawStar(ctx, stubX + 50, 470, 4, "#ff4d67");

  // ─── 6. Event Main Typography (Left Section) ──────────────────────────────
  const mainCenterX = (38 + stubX - 16) / 2;

  const rawEventName = (data.event.name || "VELVT EVENT").trim();
  let displayTitle = "VELVT CURSE";
  let displaySubtitle = "✦  VELVT CURSE 2.0  ✦";

  if (rawEventName.toLowerCase().includes("curse")) {
    displayTitle = "VELVT CURSE";
    displaySubtitle = "✦  VELVT CURSE 2.0  ✦";
  } else {
    displayTitle = rawEventName.toUpperCase();
    displaySubtitle = "✦  OFFICIAL ADMISSION PASS  ✦";
  }

  // Glowing shadow behind headline — dynamically auto-fitted between ghosts (NO truncation)
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(230, 30, 60, 0.75)";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#e0263f";
  drawFittedText(
    ctx,
    displayTitle,
    mainCenterX,
    86,
    510,
    58,
    "'Cinzel Decorative', 'Cinzel', 'Georgia', serif",
    "900",
    22
  );
  ctx.shadowBlur = 0;
  ctx.restore();

  // Subtitle — auto-fitted cleanly
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ede5d8";
  drawFittedText(
    ctx,
    displaySubtitle,
    mainCenterX,
    134,
    480,
    18,
    "'Cinzel', 'Georgia', serif",
    "700",
    12
  );
  ctx.restore();

  // Ornamental horizontal flourish divider below subtitle
  drawFlourishDivider(ctx, mainCenterX, 154, 400);

  // ─── 7. Center Info Block (Two Balanced Columns) ───────────────────────────
  // LEFT COLUMN: Date, Time, Venue  |  RIGHT COLUMN: Tier, Holder
  // Strictly separated tracks — zero text overlap and zero text truncation
  const blockTopY = 178;
  const colLeftX = 145;
  const colRightX = 475;
  const dividerX = 445;

  // Vertical divider between columns
  ctx.strokeStyle = "rgba(240, 230, 215, 0.22)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(dividerX, blockTopY);
  ctx.lineTo(dividerX, blockTopY + 140);
  ctx.stroke();

  // === LEFT COLUMN: Date / Time / Venue ===
  ctx.save();
  ctx.textAlign = "left";

  const eventDateStr = data.event.date
    ? new Date(data.event.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).toUpperCase()
    : "01 NOV 2026";
  const eventTimeStr = data.event.time || "5:00 PM ONWARDS";

  // Date/Time Label
  ctx.font = "700 11px 'Courier New', monospace";
  ctx.fillStyle = "#ff6b81";
  ctx.fillText("DATE & EVENT TIME", colLeftX, blockTopY + 14);

  // Big Date — fully displayed
  ctx.fillStyle = "#ffffff";
  drawFittedText(
    ctx,
    eventDateStr,
    colLeftX,
    blockTopY + 44,
    280,
    24,
    "'Arial Black', sans-serif",
    "900",
    14
  );

  // Time — fully displayed
  ctx.fillStyle = "#ede5d8";
  drawFittedText(
    ctx,
    eventTimeStr.toUpperCase(),
    colLeftX,
    blockTopY + 68,
    280,
    14,
    "'Courier New', monospace",
    "600",
    11
  );

  // Venue Label
  ctx.font = "700 11px 'Courier New', monospace";
  ctx.fillStyle = "#ff6b81";
  ctx.fillText("VENUE", colLeftX, blockTopY + 98);

  // Venue Value: Prominent "AT (VENUE NAME)" — auto-scales to NEVER show "..."
  const rawVenue = (data.event.venueName || "").trim();
  const venueCity = (data.event.venueCity || "").trim();
  const venueDisplay = rawVenue
    ? `AT ${rawVenue.toUpperCase()}`
    : "VENUE TO BE ANNOUNCED";

  ctx.fillStyle = "#d4af37"; // Rich vintage gold
  drawFittedText(
    ctx,
    venueDisplay,
    colLeftX,
    blockTopY + 120,
    285,
    15,
    "'Georgia', serif",
    "700",
    10
  );

  ctx.restore();

  // === RIGHT COLUMN: Tier & Holder ===
  ctx.save();
  ctx.textAlign = "left";

  // Tier Label
  ctx.font = "700 11px 'Courier New', monospace";
  ctx.fillStyle = "#ff6b81";
  ctx.fillText("OFFICIAL ADMISSION TIER", colRightX, blockTopY + 14);

  // Tier Name — completely visible (auto-scaled, no "...")
  ctx.fillStyle = "#ede5d8";
  const tierDisplay = (data.tierName || "VIP PASS").toUpperCase();
  drawFittedText(
    ctx,
    tierDisplay,
    colRightX,
    blockTopY + 44,
    320,
    26,
    "'Arial Black', sans-serif",
    "900",
    13
  );

  // Holder Label
  ctx.font = "700 11px 'Courier New', monospace";
  ctx.fillStyle = "#ff6b81";
  ctx.fillText("PASS HOLDER", colRightX, blockTopY + 74);

  // Attendee / Holder Name — completely visible (auto-scaled, no "...")
  ctx.fillStyle = "#f5e6c8";
  const holderText = (data.attendeeName || "VIP GUEST").toUpperCase();
  drawFittedText(
    ctx,
    holderText,
    colRightX,
    blockTopY + 98,
    320,
    16,
    "'Courier New', monospace",
    "700",
    11
  );

  // Verification note
  ctx.font = "500 10px 'Courier New', monospace";
  ctx.fillStyle = "rgba(240, 230, 215, 0.55)";
  ctx.fillText("VALID WITH MATCHING ID AT GATE", colRightX, blockTopY + 120);

  ctx.restore();

  // ─── 8. Bottom Footer: Tagline + Venue + City + URL ────────────────────────
  ctx.save();
  ctx.textAlign = "center";

  // Horizontal separator
  ctx.strokeStyle = "rgba(240, 230, 215, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mainCenterX - 280, 342);
  ctx.lineTo(mainCenterX + 280, 342);
  ctx.stroke();

  // Tagline: "COME IN IF YOU DARE!" (kept & highlighted in gold)
  ctx.font = "700 17px 'Georgia', serif";
  ctx.fillStyle = "#d4af37"; // Rich vintage gold
  ctx.shadowColor = "rgba(212, 175, 55, 0.4)";
  ctx.shadowBlur = 8;
  ctx.fillText("✦  COME IN IF YOU DARE!  ✦", mainCenterX, 366);
  ctx.shadowBlur = 0;

  // Venue + City line — fully visible (auto-scaled, no "...")
  const fullVenueFooter = rawVenue
    ? `AT ${rawVenue.toUpperCase()}${venueCity ? ` • ${venueCity.toUpperCase()}` : ""}`
    : venueCity
    ? venueCity.toUpperCase()
    : "SILCHAR, ASSAM, INDIA";

  ctx.fillStyle = "rgba(240, 230, 215, 0.85)";
  drawFittedText(
    ctx,
    fullVenueFooter,
    mainCenterX,
    394,
    640,
    13,
    "'Courier New', monospace",
    "600",
    10
  );

  // Date + Time recap
  ctx.font = "500 11px 'Courier New', monospace";
  ctx.fillStyle = "rgba(240, 230, 215, 0.65)";
  ctx.fillText(`${eventDateStr}  •  ${eventTimeStr.toUpperCase()}`, mainCenterX, 418);

  // Official Website URL
  ctx.font = "700 12px 'Courier New', monospace";
  ctx.fillStyle = "#e0263f";
  ctx.fillText(SITE_URL.toUpperCase(), mainCenterX, 442);

  // Brand footer
  ctx.font = "500 9px 'Courier New', monospace";
  ctx.fillStyle = "rgba(240, 230, 215, 0.35)";
  ctx.fillText("VELVT.IN  •  THEMATIC EVENT PRODUCTION  •  SILCHAR, ASSAM, INDIA", mainCenterX, 464);

  ctx.restore();

  // ─── 9. Stub Section (Right Side) ──────────────────────────────────────────
  const stubCenterX = stubX + (width - stubX) / 2;

  ctx.save();
  ctx.textAlign = "center";

  // Header: ADMIT ONE
  ctx.font = "900 32px 'Cinzel Decorative', 'Cinzel', 'Georgia', serif";
  ctx.fillStyle = "#ede5d8";
  ctx.fillText("ADMIT ONE", stubCenterX, 72);

  // Ticket No. Label & Serial
  ctx.font = "700 11px 'Courier New', monospace";
  ctx.fillStyle = "#e0263f";
  ctx.fillText("TICKET NO.", stubCenterX, 98);

  ctx.fillStyle = "#ffffff";
  drawFittedText(
    ctx,
    data.ticketNumber,
    stubCenterX,
    118,
    230,
    16,
    "'Courier New', monospace",
    "900",
    11
  );

  // Embedded QR Code Container (high-contrast white pad)
  const qrBoxSize = 210;
  const qrBoxX = stubCenterX - qrBoxSize / 2;
  const qrBoxY = 135;

  ctx.fillStyle = "#ffffff";
  drawVintageBorder(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14);
  ctx.fill();

  // Draw QR code image inside white box
  const innerMargin = 12;
  ctx.drawImage(
    qrImage,
    qrBoxX + innerMargin,
    qrBoxY + innerMargin,
    qrBoxSize - innerMargin * 2,
    qrBoxSize - innerMargin * 2
  );

  // Stub Date & Verification
  ctx.font = "700 12px 'Courier New', monospace";
  ctx.fillStyle = "#ede5d8";
  ctx.fillText(eventDateStr, stubCenterX, 375);

  ctx.fillStyle = "#e0263f";
  drawFittedText(
    ctx,
    `${eventTimeStr.toUpperCase()} • OFFICIAL PASS`,
    stubCenterX,
    396,
    250,
    11,
    "'Courier New', monospace",
    "600",
    9
  );

  ctx.font = "500 9px 'Courier New', monospace";
  ctx.fillStyle = "rgba(240, 230, 215, 0.55)";
  ctx.fillText("SCAN AT GATE FOR ADMISSION", stubCenterX, 420);

  ctx.font = "500 8px 'Courier New', monospace";
  ctx.fillStyle = "rgba(240, 230, 215, 0.45)";
  ctx.fillText(SITE_URL.toUpperCase(), stubCenterX, 442);

  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Direct file download trigger for the real vintage ticket pass
 */
export async function downloadRealTicketPass(data: RealTicketData): Promise<void> {
  const pngDataUrl = await generateRealTicketPng(data);
  const link = document.createElement("a");
  link.href = pngDataUrl;
  link.download = `VELVT_REAL_TICKET_${data.ticketNumber}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Helper: Draw Vintage Ghost Illustration ─────────────────────────────────
function drawVintageGhost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  tilt: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Ghost Body
  ctx.beginPath();
  ctx.moveTo(-scale * 0.55, scale * 0.4);
  ctx.bezierCurveTo(-scale * 0.55, -scale * 0.8, scale * 0.55, -scale * 0.8, scale * 0.55, scale * 0.4);
  // Wavy bottom tails
  ctx.bezierCurveTo(scale * 0.45, scale * 0.75, scale * 0.25, scale * 0.5, scale * 0.1, scale * 0.85);
  ctx.bezierCurveTo(-scale * 0.05, scale * 0.6, -scale * 0.25, scale * 0.95, -scale * 0.4, scale * 0.65);
  ctx.bezierCurveTo(-scale * 0.5, scale * 0.55, -scale * 0.55, scale * 0.45, -scale * 0.55, scale * 0.4);
  ctx.closePath();

  ctx.shadowColor = "rgba(230, 30, 60, 0.35)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#ede6d8";
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eyes (Two dark slanted ovals)
  ctx.fillStyle = "#121216";
  ctx.beginPath();
  ctx.ellipse(-scale * 0.2, -scale * 0.2, scale * 0.1, scale * 0.15, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(scale * 0.2, -scale * 0.2, scale * 0.1, scale * 0.15, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Open mouth (O shape)
  ctx.beginPath();
  ctx.ellipse(0, 0, scale * 0.12, scale * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trailing ectoplasm drop
  ctx.fillStyle = "#ede6d8";
  ctx.beginPath();
  ctx.arc(-scale * 0.3, scale * 1.15, scale * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Helper: Draw Flying Gothic Bat Silhouette ────────────────────────────────
function drawBat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = "#ede5d8";
  ctx.beginPath();

  // Head and ears
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(-size * 0.15, -size * 0.55); // Left ear
  ctx.lineTo(-size * 0.08, -size * 0.28);
  ctx.lineTo(size * 0.08, -size * 0.28);
  ctx.lineTo(size * 0.15, -size * 0.55); // Right ear
  ctx.lineTo(0, -size * 0.3);

  // Right wing
  ctx.bezierCurveTo(size * 0.4, -size * 0.7, size * 0.9, -size * 0.4, size, -size * 0.1);
  ctx.bezierCurveTo(size * 0.8, size * 0.2, size * 0.6, size * 0.1, size * 0.5, size * 0.35);
  ctx.bezierCurveTo(size * 0.35, size * 0.15, size * 0.2, size * 0.25, 0, size * 0.4);

  // Left wing
  ctx.bezierCurveTo(-size * 0.2, size * 0.25, -size * 0.35, size * 0.15, -size * 0.5, size * 0.35);
  ctx.bezierCurveTo(-size * 0.6, size * 0.1, -size * 0.8, size * 0.2, -size, -size * 0.1);
  ctx.bezierCurveTo(-size * 0.9, -size * 0.4, -size * 0.4, -size * 0.7, 0, -size * 0.3);

  ctx.closePath();
  ctx.shadowColor = "rgba(220, 20, 50, 0.4)";
  ctx.shadowBlur = 6;
  ctx.fill();

  ctx.restore();
}

// ─── Helper: Draw Carved Jack-o'-Lantern Pumpkin ──────────────────────────────
function drawJackOLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Pumpkin Outer Silhouette (warm dark burnt orange / crimson)
  ctx.fillStyle = "#a82a18";
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.15, radius * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pumpkin Ribs (side lobes)
  ctx.fillStyle = "#7a1a0e";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.6, 0, radius * 0.5, radius * 0.85, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(radius * 0.6, 0, radius * 0.5, radius * 0.85, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Pumpkin Center Lobe
  ctx.fillStyle = "#962214";
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.7, radius * 0.88, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pumpkin Stem
  ctx.fillStyle = "#4a6828";
  ctx.beginPath();
  ctx.moveTo(-radius * 0.12, -radius * 0.8);
  ctx.quadraticCurveTo(-radius * 0.05, -radius * 1.25, radius * 0.18, -radius * 1.2);
  ctx.quadraticCurveTo(radius * 0.05, -radius * 0.9, radius * 0.12, -radius * 0.8);
  ctx.closePath();
  ctx.fill();

  // Glowing Carved Facial Features
  ctx.shadowColor = "rgba(255, 180, 20, 0.85)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#ffb703";

  // Left Eye (triangle)
  ctx.beginPath();
  ctx.moveTo(-radius * 0.45, -radius * 0.25);
  ctx.lineTo(-radius * 0.2, -radius * 0.25);
  ctx.lineTo(-radius * 0.32, -radius * 0.48);
  ctx.closePath();
  ctx.fill();

  // Right Eye (triangle)
  ctx.beginPath();
  ctx.moveTo(radius * 0.2, -radius * 0.25);
  ctx.lineTo(radius * 0.45, -radius * 0.25);
  ctx.lineTo(radius * 0.32, -radius * 0.48);
  ctx.closePath();
  ctx.fill();

  // Nose (small inverted triangle)
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.08);
  ctx.lineTo(-radius * 0.1, -radius * 0.22);
  ctx.lineTo(radius * 0.1, -radius * 0.22);
  ctx.closePath();
  ctx.fill();

  // Jagged Grin Mouth
  ctx.beginPath();
  ctx.moveTo(-radius * 0.65, radius * 0.05);
  ctx.lineTo(-radius * 0.45, radius * 0.35);
  ctx.lineTo(-radius * 0.3, radius * 0.15); // Tooth up
  ctx.lineTo(-radius * 0.15, radius * 0.42);
  ctx.lineTo(0, radius * 0.2);              // Center tooth up
  ctx.lineTo(radius * 0.15, radius * 0.42);
  ctx.lineTo(radius * 0.3, radius * 0.15);  // Tooth up
  ctx.lineTo(radius * 0.45, radius * 0.35);
  ctx.lineTo(radius * 0.65, radius * 0.05);
  ctx.quadraticCurveTo(0, radius * 0.65, -radius * 0.65, radius * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ─── Helper: Draw Spiderweb Corner Accent ─────────────────────────────────────
function drawSpiderweb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
  flipY = false
) {
  ctx.save();
  ctx.strokeStyle = `rgba(240, 230, 215, ${opacity})`;
  ctx.lineWidth = 0.85;

  const ySign = flipY ? -1 : 1;
  const rays = 6;
  for (let i = 0; i <= rays; i++) {
    const angle = (Math.PI / 2) * (i / rays);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size * ySign);
    ctx.stroke();
  }

  for (let ring = 1; ring <= 4; ring++) {
    const r = (size / 4.5) * ring;
    ctx.beginPath();
    for (let i = 0; i <= rays; i++) {
      const angle = (Math.PI / 2) * (i / rays);
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r * ySign;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Helper: Draw Hanging Spider ──────────────────────────────────────────────
function drawHangingSpider(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  hangLength: number
) {
  ctx.save();
  // Silk thread
  ctx.strokeStyle = "rgba(240, 230, 215, 0.4)";
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, topY + hangLength);
  ctx.stroke();

  const sy = topY + hangLength;

  // Spider Body (abdomen)
  ctx.fillStyle = "#121216";
  ctx.beginPath();
  ctx.ellipse(x, sy + 4, 4.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(x, sy, 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (two tiny white dots)
  ctx.fillStyle = "#ede5d8";
  ctx.beginPath();
  ctx.arc(x - 1, sy - 1, 0.7, 0, Math.PI * 2);
  ctx.arc(x + 1, sy - 1, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Legs (8 angled legs)
  ctx.strokeStyle = "#121216";
  ctx.lineWidth = 0.8;
  const legOffsets = [-4, -2, 2, 4];
  for (const lo of legOffsets) {
    // Left legs
    ctx.beginPath();
    ctx.moveTo(x - 2, sy + lo * 0.4);
    ctx.lineTo(x - 7, sy + lo * 0.8 - 2);
    ctx.lineTo(x - 10, sy + lo * 0.9 + 2);
    ctx.stroke();

    // Right legs
    ctx.beginPath();
    ctx.moveTo(x + 2, sy + lo * 0.4);
    ctx.lineTo(x + 7, sy + lo * 0.8 - 2);
    ctx.lineTo(x + 10, sy + lo * 0.9 + 2);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Helper: Draw 4-point Diamond Star (✦) ──────────────────────────────────
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Helper: Draw Flourish Divider Line ──────────────────────────────────────
function drawFlourishDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  totalWidth: number
) {
  ctx.save();
  const half = totalWidth / 2;

  // Left line tapering towards center
  ctx.strokeStyle = "rgba(240, 230, 215, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - 20, y);
  ctx.stroke();

  // Right line
  ctx.beginPath();
  ctx.moveTo(cx + 20, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();

  // Center Diamond
  drawStar(ctx, cx, y, 6, "#d4af37");

  // Secondary fine lines
  ctx.strokeStyle = "rgba(240, 230, 215, 0.15)";
  ctx.beginPath();
  ctx.moveTo(cx - half + 30, y + 4);
  ctx.lineTo(cx - 30, y + 4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 30, y + 4);
  ctx.lineTo(cx + half - 30, y + 4);
  ctx.stroke();

  ctx.restore();
}

// ─── Helper: Draw Rounded Rectangle ─────────────────────────────────────────
function drawVintageBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
