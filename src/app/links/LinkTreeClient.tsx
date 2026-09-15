"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LinkTreeConfig, LinkTreeLink } from "@/app/actions";
import { trackLinkTreeClick } from "@/app/actions";
import {
  RealLinkIcon,
  InstagramIcon,
  WhatsAppIcon,
  SpotifyIcon,
  YouTubeIcon,
  MailIcon,
  PhoneIcon,
} from "./LinkTreeIcons";

interface LinkTreeClientProps {
  config: LinkTreeConfig;
}

type VelvetTheme = "crimson" | "gold" | "violet";

export function LinkTreeClient({ config }: LinkTreeClientProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [theme, setTheme] = useState<VelvetTheme>("crimson");

  const links = config.links.filter((l) => l.isActive);

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(links.map((l) => l.category || "general").filter(Boolean)))];

  const filteredLinks = links.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.subtitle && l.subtitle.toLowerCase().includes(search.toLowerCase())) ||
      (l.badge && l.badge.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = activeCategory === "all" || (l.category || "general") === activeCategory;

    return matchesSearch && matchesCategory;
  });

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "https://velvt.in/links";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: config.title,
          text: config.bio,
          url,
        })
        .catch(() => {
          copyToClipboard(url);
        });
    } else {
      copyToClipboard(url);
    }
  }

  function copyToClipboard(text: string) {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleLinkClick(link: LinkTreeLink) {
    trackLinkTreeClick(link.id);
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://velvt.in/links";
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=060305&color=ffffff&margin=14`;

  // Theme style configurations
  const themeAura = {
    crimson: {
      primaryColor: "text-red-500",
      accentBg: "bg-red",
      glowBg: "from-red-600/30 via-red-950/20 to-transparent",
      bottomGlow: "bg-red-900/20",
      cardBorderHover: "group-hover:border-red/60 group-hover:shadow-[0_0_30px_rgba(200,16,46,0.35)]",
      activeTab: "bg-red text-white border-red shadow-[0_0_15px_rgba(200,16,46,0.5)]",
      badgeBorder: "border-red/50 shadow-[0_0_12px_rgba(200,16,46,0.6)]",
      avatarGlow: "shadow-[0_0_35px_rgba(200,16,46,0.5)] border-red/60",
    },
    gold: {
      primaryColor: "text-amber-400",
      accentBg: "bg-amber-500",
      glowBg: "from-amber-600/25 via-amber-950/15 to-transparent",
      bottomGlow: "bg-amber-900/15",
      cardBorderHover: "group-hover:border-amber-500/60 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      activeTab: "bg-amber-500 text-black font-bold border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
      badgeBorder: "border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
      avatarGlow: "shadow-[0_0_35px_rgba(245,158,11,0.4)] border-amber-500/60",
    },
    violet: {
      primaryColor: "text-purple-400",
      accentBg: "bg-purple-600",
      glowBg: "from-purple-600/30 via-purple-950/20 to-transparent",
      bottomGlow: "bg-purple-900/20",
      cardBorderHover: "group-hover:border-purple-500/60 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]",
      activeTab: "bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
      badgeBorder: "border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.6)]",
      avatarGlow: "shadow-[0_0_35px_rgba(168,85,247,0.5)] border-purple-500/60",
    },
  }[theme];

  return (
    <div className="min-h-screen bg-[#060305] text-white relative flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 selection:bg-red selection:text-white font-sans overflow-x-hidden">
      {/* ─── Luxury Velvet Ambient Atmosphere ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Top Pulsing Velvet Spotlight */}
        <div
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[650px] bg-gradient-to-b ${themeAura.glowBg} rounded-full blur-[140px] transition-all duration-700 animate-pulse`}
          style={{ animationDuration: "6s" }}
        />

        {/* Bottom Ambient Glow */}
        <div
          className={`absolute -bottom-40 right-1/4 w-[750px] h-[550px] ${themeAura.bottomGlow} rounded-full blur-[150px] transition-all duration-700`}
        />

        {/* Left Fill Light */}
        <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-red-950/15 rounded-full blur-[130px]" />

        {/* Subtle Luxury Noise / Stardust Mesh Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,#000_65%,transparent_100%)] opacity-30" />

        {/* Floating Ember Particles */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <span className="absolute bottom-10 left-[15%] w-1.5 h-1.5 rounded-full bg-red-400 blur-[0.5px] animate-ping" style={{ animationDuration: "3.2s" }} />
          <span className="absolute bottom-32 left-[45%] w-1 h-1 rounded-full bg-amber-300 blur-[0.5px] animate-ping" style={{ animationDuration: "4.5s" }} />
          <span className="absolute bottom-20 right-[20%] w-1.5 h-1.5 rounded-full bg-red-500 blur-[0.5px] animate-ping" style={{ animationDuration: "2.8s" }} />
          <span className="absolute top-1/4 right-[30%] w-1 h-1 rounded-full bg-red-300 blur-[0.5px] animate-ping" style={{ animationDuration: "5.1s" }} />
        </div>

        {/* Dark Obsidian Edge Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,3,5,0.85)_100%)]" />
      </div>

      {/* ─── Top Header: Brand Link, Theme Switcher & Share/QR ─── */}
      <header className="w-full max-w-lg flex items-center justify-between py-2 z-10">
        <Link
          href="/"
          className="text-xs font-mono tracking-widest text-white/70 hover:text-white transition-all flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 hover:border-red/50 hover:bg-white/[0.08]"
        >
          <span>←</span>
          <span>VELVT.in</span>
        </Link>

        {/* Center: Theme Vibe Switcher */}
        <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-full backdrop-blur-md">
          <button
            onClick={() => setTheme("crimson")}
            className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
              theme === "crimson" ? "bg-red scale-110 shadow-[0_0_8px_#c8102e]" : "bg-red/40 hover:bg-red/70"
            }`}
            title="Crimson Velvet Theme"
            aria-label="Crimson Velvet Theme"
          />
          <button
            onClick={() => setTheme("gold")}
            className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
              theme === "gold" ? "bg-amber-400 scale-110 shadow-[0_0_8px_#f59e0b]" : "bg-amber-400/40 hover:bg-amber-400/70"
            }`}
            title="Obsidian Gold Theme"
            aria-label="Obsidian Gold Theme"
          />
          <button
            onClick={() => setTheme("violet")}
            className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
              theme === "violet" ? "bg-purple-500 scale-110 shadow-[0_0_8px_#a855f7]" : "bg-purple-500/40 hover:bg-purple-500/70"
            }`}
            title="Cyber Violet Theme"
            aria-label="Cyber Violet Theme"
          />
        </div>

        {/* Right: QR Code and Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQr(true)}
            className="p-2 rounded-full bg-white/[0.05] border border-white/10 text-white/70 hover:text-white hover:border-red/50 transition-all text-xs cursor-pointer"
            title="Show QR Code"
            aria-label="Show QR Code"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect width="5" height="5" x="3" y="3" rx="1" />
              <rect width="5" height="5" x="16" y="3" rx="1" />
              <rect width="5" height="5" x="3" y="16" rx="1" />
              <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
              <path d="M21 21v.01" />
              <path d="M12 7v3a2 2 0 0 1-2 2H7" />
              <path d="M3 12h.01" />
              <path d="M12 3h.01" />
              <path d="M12 16v.01" />
              <path d="M16 12h1" />
              <path d="M21 12v.01" />
              <path d="M12 21v-1" />
            </svg>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-white/80 hover:text-white hover:border-red/50 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Share Link Tree"
            aria-label="Share Link Tree"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </header>

      {/* ─── Main Content Canvas ─── */}
      <main className="w-full max-w-lg flex-1 flex flex-col items-center py-6 sm:py-8 space-y-6 z-10">
        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar / Monogram */}
          <div className="relative group">
            <div className={`w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-red-600 via-red to-red-900 ${themeAura.avatarGlow} border flex items-center justify-center transition-all duration-500`}>
              {config.avatarUrl ? (
                <img
                  src={config.avatarUrl}
                  alt={config.title}
                  className="w-full h-full rounded-full object-cover bg-black"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#0d070b] flex items-center justify-center border border-white/10">
                  <span className="font-display font-black text-2xl tracking-tighter text-white">
                    V<span className="text-red">.</span>
                  </span>
                </div>
              )}
            </div>
            {config.verified && (
              <div
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-red border-2 border-black flex items-center justify-center text-white text-xs font-black shadow-[0_0_12px_#c8102e]"
                title="Verified Official Platform"
              >
                ✓
              </div>
            )}
          </div>

          {/* Title & Verified Headline */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
                {config.title}
              </h1>
              {config.verified && (
                <span className="inline-block text-red text-sm" title="Official Verified">
                  ●
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed px-2 font-mono">
              {config.bio}
            </p>
          </div>

          {/* Location & Live Indicator */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {config.location && (
              <span className="text-[10px] font-mono tracking-widest text-white/90 uppercase bg-white/[0.05] px-3 py-1 rounded-full border border-white/15 inline-flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                {config.location}
              </span>
            )}

            {/* Live Audio Equalizer Indicator */}
            <span className="text-[10px] font-mono tracking-wider text-emerald-300 uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40 inline-flex items-center gap-1.5 shadow-sm">
              <span className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 bg-emerald-400 h-2 animate-pulse" />
                <span className="w-0.5 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-0.5 bg-emerald-400 h-1.5 animate-pulse" style={{ animationDelay: "300ms" }} />
              </span>
              <span>Online Hub</span>
            </span>
          </div>

          {/* ─── Real Brand Socials (Ultra-Sharp SVG Vectors) ─── */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {config.socials.instagram && (
              <a
                href={config.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-pink-500/80 hover:bg-pink-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all cursor-pointer"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5 text-pink-500" />
              </a>
            )}
            {config.socials.whatsapp && (
              <a
                href={config.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-emerald-500/80 hover:bg-emerald-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(37,211,102,0.5)] transition-all cursor-pointer"
                title="WhatsApp VIP Desk"
                aria-label="WhatsApp VIP Desk"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
              </a>
            )}
            {config.socials.spotify && (
              <a
                href={config.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-emerald-400/80 hover:bg-emerald-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(29,185,84,0.5)] transition-all cursor-pointer"
                title="Official Spotify Playlist"
                aria-label="Official Spotify Playlist"
              >
                <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
              </a>
            )}
            {config.socials.youtube && (
              <a
                href={config.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-red/80 hover:bg-red-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all cursor-pointer"
                title="YouTube Recaps"
                aria-label="YouTube Recaps"
              >
                <YouTubeIcon className="w-5 h-5 text-red-500" />
              </a>
            )}
            {config.socials.email && (
              <a
                href={`mailto:${config.socials.email}`}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-blue-500/80 hover:bg-blue-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all cursor-pointer"
                title="Email Production"
                aria-label="Email Production"
              >
                <MailIcon className="w-5 h-5 text-blue-400" />
              </a>
            )}
            {config.socials.phone && (
              <a
                href={`tel:${config.socials.phone.replace(/\s+/g, "")}`}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-emerald-400/80 hover:bg-emerald-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all cursor-pointer"
                title="Phone Desk"
                aria-label="Phone Desk"
              >
                <PhoneIcon className="w-5 h-5 text-emerald-400" />
              </a>
            )}
          </div>
        </div>

        {/* ─── Search & Category Filters (If More Than 4 Links) ─── */}
        {links.length > 4 && (
          <div className="w-full space-y-2.5">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search passes, events, links..."
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-red focus:shadow-[0_0_15px_rgba(200,16,46,0.35)] transition-all backdrop-blur-md"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full border uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      activeCategory === cat
                        ? themeAura.activeTab
                        : "bg-white/[0.04] text-white/60 border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Real Functional Link Hub (Glassmorphism Cards) ─── */}
        <div className="w-full space-y-3.5">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <p className="text-xs font-mono text-white/60 uppercase tracking-wider">No links matched your search</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="text-xs text-red hover:underline font-mono cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredLinks.map((link) => {
              const isExternal = link.url.startsWith("http");
              const isFlagship = link.isFeatured;

              const content = (
                <div
                  className={`w-full p-4 sm:p-4.5 rounded-2xl transition-all duration-300 relative group flex items-center justify-between gap-4 backdrop-blur-xl border ${
                    isFlagship
                      ? "bg-gradient-to-r from-red-950/70 via-[#14070a]/90 to-red-950/40 border-red/60 shadow-[0_0_35px_rgba(200,16,46,0.35)] hover:shadow-[0_0_45px_rgba(200,16,46,0.55)] hover:border-red hover:scale-[1.015]"
                      : `bg-[#0e070c]/80 border-white/12 hover:bg-[#150912]/90 ${themeAura.cardBorderHover} hover:scale-[1.015]`
                  }`}
                >
                  {/* Top Specular Line on Card */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-red/60 transition-colors pointer-events-none" />

                  {/* Glowing Featured Badge */}
                  {isFlagship && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-red border border-white/25 shadow-[0_0_12px_#c8102e] flex items-center gap-1 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-white">
                        {link.badge || "FEATURED"}
                      </span>
                    </div>
                  )}

                  {/* Left: Real SVG Icon & Labels */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Icon Container with Vivid Glow */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 shadow-md ${
                        isFlagship
                          ? "bg-gradient-to-br from-red/30 via-red-950/40 to-black border-red/60 shadow-[0_0_20px_rgba(200,16,46,0.5)] group-hover:scale-105"
                          : "bg-white/[0.06] border-white/15 text-white group-hover:border-red/50 group-hover:bg-red/15 group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(200,16,46,0.35)]"
                      }`}
                    >
                      <RealLinkIcon
                        icon={link.icon}
                        title={link.title}
                        url={link.url}
                        className="w-6 h-6"
                      />
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-tight group-hover:text-red transition-colors line-clamp-1">
                          {link.title}
                        </h2>
                        {!isFlagship && link.badge && (
                          <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/15 text-white shrink-0">
                            {link.badge}
                          </span>
                        )}
                      </div>

                      {link.subtitle && (
                        <p className="text-xs font-mono text-white/70 line-clamp-1 group-hover:text-white/90 transition-colors">
                          {link.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Modern Arrow Glyph */}
                  <div className="shrink-0 text-white/40 group-hover:text-white transition-colors pr-1">
                    <span className="text-sm font-mono group-hover:translate-x-1 transition-transform inline-block font-bold">
                      {isExternal ? "↗" : "→"}
                    </span>
                  </div>
                </div>
              );

              return isExternal ? (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link)}
                  className="block w-full focus:outline-none cursor-pointer"
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={link.id}
                  href={link.url}
                  onClick={() => handleLinkClick(link)}
                  className="block w-full focus:outline-none cursor-pointer"
                >
                  {content}
                </Link>
              );
            })
          )}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full max-w-lg py-6 text-center space-y-2 z-10 border-t border-white/[0.08] mt-6">
        <Link
          href="/"
          className="font-display font-black text-sm tracking-[0.15em] text-white hover:text-red transition-colors uppercase inline-flex items-center gap-1"
        >
          <span>VELVT</span>
          <span className="text-red">.in</span>
        </Link>
        <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
          It starts as a thought, ends as a memory.
        </p>
      </footer>

      {/* ─── QR Code Modal ─── */}
      {showQr && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0e070c] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-[0_0_60px_rgba(200,16,46,0.45)] relative">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-lg w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red font-bold">
                Direct Scan
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                Scan to Open Link Tree
              </h3>
              <p className="text-xs font-mono text-white/60">
                Point your phone camera to open velvt.in/links
              </p>
            </div>

            <div className="p-4 bg-black rounded-2xl border border-white/10 inline-block shadow-inner">
              <img
                src={qrApiUrl}
                alt="Link Tree QR Code"
                className="w-56 h-56 mx-auto rounded-lg object-contain"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(currentUrl)}
                className="flex-1 py-2.5 rounded-xl bg-red hover:bg-red/90 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(200,16,46,0.4)] cursor-pointer"
              >
                {copied ? "Copied to Clipboard!" : "Copy Public Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
