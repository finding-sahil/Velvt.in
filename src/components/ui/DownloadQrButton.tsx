"use client";

import React, { useState } from "react";
import QRCode from "qrcode";

interface DownloadQrButtonProps {
  /** Text or URL encoded into the QR code */
  data: string;
  /** Download filename, e.g. VELVT-Volunteer-VEL-2026-00001.png */
  filename?: string;
  /** Primary name or title on the pass, e.g. "SAHIL MAZUMDER" */
  title?: string;
  /** Subtitle or credential ID, e.g. "ID: VEL-2026-00001 • OPS LEAD" */
  subtitle?: string;
  /** Badge text, e.g. "OFFICIAL CREDENTIAL" or "CORE TEAM" */
  badgeText?: string;
  /** Button label */
  label?: string;
  /** UI style variant */
  variant?: "primary" | "secondary" | "pill" | "icon" | "card-action";
  /** Additional CSS classes */
  className?: string;
}

export default function DownloadQrButton({
  data,
  filename = "VELVT-QR-Pass.png",
  title,
  subtitle,
  badgeText = "OFFICIAL CREDENTIAL",
  label = "Download QR Code",
  variant = "primary",
  className = "",
}: DownloadQrButtonProps) {
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status === "generating") return;
    setStatus("generating");

    try {
      // Dynamically resolve target URL so QR code always encodes the live working site URL
      let targetUrl = data;
      if (typeof window !== "undefined") {
        const origin = window.location.origin;
        if (targetUrl.startsWith("/")) {
          targetUrl = `${origin}${targetUrl}`;
        } else if (targetUrl.includes("velvt.in") && origin && !origin.includes("velvt.in")) {
          targetUrl = targetUrl.replace(/https?:\/\/velvt\.in/g, origin);
        }
      }
      if (!targetUrl.startsWith("http")) {
        const base = process.env.NEXT_PUBLIC_SITE_URL || "https://velvt-in.vercel.app";
        targetUrl = targetUrl.startsWith("/") ? `${base}${targetUrl}` : `${base}/${targetUrl}`;
      }

      // 1. Generate high-res QR code data URL (High error correction level)
      const qrDataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 360,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // 2. Draw branded credential pass on canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        // Fallback: direct QR download
        triggerDownload(qrDataUrl, filename);
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2200);
        return;
      }

      // Card dimensions (600 x 780 for crisp mobile/desktop viewing & badge printing)
      const w = 600;
      const h = 780;
      canvas.width = w;
      canvas.height = h;

      // Outer background
      ctx.fillStyle = "#070708";
      ctx.fillRect(0, 0, w, h);

      // Subtle crimson gradient glow at top
      const topGlow = ctx.createRadialGradient(w / 2, 40, 10, w / 2, 40, 300);
      topGlow.addColorStop(0, "rgba(200, 16, 46, 0.35)");
      topGlow.addColorStop(1, "rgba(7, 7, 8, 0)");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, w, 220);

      // Card border
      ctx.strokeStyle = "rgba(200, 16, 46, 0.4)";
      ctx.lineWidth = 3;
      roundRect(ctx, 16, 16, w - 32, h - 32, 28);
      ctx.stroke();

      // Inner soft border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      roundRect(ctx, 24, 24, w - 48, h - 48, 22);
      ctx.stroke();

      // Header: VELVT Brand
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Brand Title
      ctx.font = "900 32px 'Barlow Condensed', sans-serif, Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("VELVT", w / 2 - 18, 75);

      ctx.fillStyle = "#c8102e";
      ctx.fillText(".IN", w / 2 + 32, 75);

      // Category Pill / Badge
      ctx.fillStyle = "rgba(200, 16, 46, 0.2)";
      roundRect(ctx, w / 2 - 130, 105, 260, 28, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 16, 46, 0.6)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, w / 2 - 130, 105, 260, 28, 14);
      ctx.stroke();

      ctx.font = "700 11px monospace";
      ctx.fillStyle = "#ff4d67";
      ctx.fillText(badgeText.toUpperCase(), w / 2, 120);

      // White container box for high-contrast scannability
      const qrBoxSize = 400;
      const qrBoxX = (w - qrBoxSize) / 2;
      const qrBoxY = 155;

      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
      ctx.fill();

      // Load generated QR image and draw inside white card
      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });

      ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, qrBoxSize - 40, qrBoxSize - 40);

      // Bottom Section: Person Details & Verification URL
      const infoStartY = qrBoxY + qrBoxSize + 40;

      if (title) {
        ctx.font = "800 24px 'Barlow Condensed', sans-serif, Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(title.toUpperCase(), w / 2, infoStartY);
      }

      if (subtitle) {
        ctx.font = "600 13px monospace";
        ctx.fillStyle = "#ff4d67";
        ctx.fillText(subtitle.toUpperCase(), w / 2, infoStartY + 30);
      }

      // Verification instruction
      ctx.font = "500 11px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText("SCAN TO VERIFY LIVE PASS AUTHENTICITY", w / 2, infoStartY + 62);

      // Footer branding
      ctx.font = "500 10px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillText("official: velvt-in.vercel.app  •  instagram: @velvt.in", w / 2, h - 45);

      // 3. Trigger PNG Download
      const finalDataUrl = canvas.toDataURL("image/png");
      triggerDownload(finalDataUrl, filename);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2400);
    } catch (err) {
      console.error("QR Pass generation error:", err);
      // Fallback
      try {
        let fallbackUrl = data;
        if (typeof window !== "undefined") {
          const origin = window.location.origin;
          if (fallbackUrl.startsWith("/")) fallbackUrl = `${origin}${fallbackUrl}`;
          else if (fallbackUrl.includes("velvt.in") && !origin.includes("velvt.in")) {
            fallbackUrl = fallbackUrl.replace(/https?:\/\/velvt\.in/g, origin);
          }
        }
        const simpleQr = await QRCode.toDataURL(fallbackUrl, { width: 512, margin: 2 });
        triggerDownload(simpleQr, filename);
      } catch {}
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  function triggerDownload(dataUrl: string, name: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Visual Variants
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        title={status === "generating" ? "Generating..." : label}
        disabled={status === "generating"}
        className={`w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-xs text-white hover:border-primary hover:text-primary hover:bg-red-dim transition-all cursor-pointer ${className}`}
      >
        {status === "generating" ? (
          <span className="inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : status === "done" ? (
          <span className="text-emerald-400 text-xs font-bold">✓</span>
        ) : (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        )}
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={status === "generating"}
        className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-[11px] font-mono uppercase tracking-wider transition-all hover:border-primary/50 cursor-pointer ${className}`}
      >
        {status === "generating" ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Generating...</span>
          </>
        ) : status === "done" ? (
          <>
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="text-emerald-400">Downloaded</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 fill-current text-primary" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "card-action") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={status === "generating"}
        className={`w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-red-dim border border-white/10 hover:border-primary/40 text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${className}`}
      >
        {status === "generating" ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted">Generating Pass...</span>
          </>
        ) : status === "done" ? (
          <>
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="text-emerald-400">Pass Saved!</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 fill-current text-primary" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  // Default "primary" variant
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={status === "generating"}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-red-dim border border-white/20 hover:border-primary text-xs font-mono uppercase tracking-wider text-white transition-all shadow-[0_0_15px_rgba(200,16,46,0.15)] hover:shadow-[0_0_25px_rgba(200,16,46,0.4)] cursor-pointer ${className}`}
    >
      {status === "generating" ? (
        <>
          <span className="inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Generating QR Pass...</span>
        </>
      ) : status === "done" ? (
        <>
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-emerald-400">Pass Downloaded</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 fill-current text-primary" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

/** Helper to draw smooth rounded rectangles on canvas */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
