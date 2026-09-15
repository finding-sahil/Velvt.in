"use client";

import { useState } from "react";
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
  InstagramVerifiedBadge,
} from "./LinkTreeIcons";

interface LinkTreeClientProps {
  config: LinkTreeConfig;
}

/**
 * Strips duplicate leading emojis or punctuation from link titles
 * so the title text stays clean next to the real SVG icon.
 */
function cleanLinkTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^[\p{Emoji}\u200d\uFE0F\s—\-:]+/u, "").trim() || title;
}

export function LinkTreeClient({ config }: LinkTreeClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const links = config.links.filter((l) => l.isActive);

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(links.map((l) => l.category || "general").filter(Boolean)))];

  const filteredLinks = links.filter((l) => {
    const cleanTitle = cleanLinkTitle(l.title).toLowerCase();
    const cleanSearch = search.toLowerCase();

    const matchesSearch =
      cleanTitle.includes(cleanSearch) ||
      (l.subtitle && l.subtitle.toLowerCase().includes(cleanSearch)) ||
      (l.badge && l.badge.toLowerCase().includes(cleanSearch));

    const matchesCategory = activeCategory === "all" || (l.category || "general") === activeCategory;

    return matchesSearch && matchesCategory;
  });

  function handleLinkClick(link: LinkTreeLink) {
    trackLinkTreeClick(link.id);
  }

  // Dedicated WhatsApp direct chat link (+91 93951 78940)
  const getWhatsAppChatUrl = () => {
    if (config.socials.whatsapp && (config.socials.whatsapp.includes("wa.me") || config.socials.whatsapp.includes("send?phone="))) {
      return config.socials.whatsapp;
    }
    const rawNumber = config.socials.phone || "+91 93951 78940";
    const digits = rawNumber.replace(/\D/g, "");
    const formatted = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${formatted}`;
  };
  const whatsappChatUrl = getWhatsAppChatUrl();

  return (
    <div className="min-h-screen bg-[#060205] text-white relative flex flex-col items-center justify-between px-4 py-8 sm:py-12 selection:bg-red selection:text-white font-sans overflow-x-hidden overscroll-y-contain">
      {/* ─── Luxury Velvet Ambient Atmosphere & Custom Wallpapers (Locked against mobile scroll shake) ─── */}
      <div
        className="fixed top-0 left-0 w-full pointer-events-none overflow-hidden z-0 transform-gpu"
        style={{
          height: "100lvh",
          minHeight: "100vh",
          transform: "translate3d(0, 0, 0)",
          WebkitTransform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform",
        }}
      >
        {/* Wallpaper Presentation: Separate Desktop vs Mobile with smart single-upload fallback */}
        {config.desktopBackgroundUrl && config.mobileBackgroundUrl ? (
          <>
            <img
              src={config.desktopBackgroundUrl}
              alt="Link Tree Desktop Background"
              referrerPolicy="no-referrer"
              className="hidden md:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transform-gpu"
              style={{
                transform: "translate3d(0, 0, 0)",
                WebkitTransform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            />
            <img
              src={config.mobileBackgroundUrl}
              alt="Link Tree Mobile Background"
              referrerPolicy="no-referrer"
              className="block md:hidden absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transform-gpu"
              style={{
                transform: "translate3d(0, 0, 0)",
                WebkitTransform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            />
          </>
        ) : config.desktopBackgroundUrl ? (
          <img
            src={config.desktopBackgroundUrl}
            alt="Link Tree Background"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transform-gpu"
            style={{
              transform: "translate3d(0, 0, 0)",
              WebkitTransform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
        ) : config.mobileBackgroundUrl ? (
          <img
            src={config.mobileBackgroundUrl}
            alt="Link Tree Background"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transform-gpu"
            style={{
              transform: "translate3d(0, 0, 0)",
              WebkitTransform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
        ) : null}

        {/* Dark Contrast Dim Overlay (ensures text/links stay 100% readable) */}
        {(config.desktopBackgroundUrl || config.mobileBackgroundUrl) && (
          <div
            className="absolute inset-0 bg-[#060205] pointer-events-none"
            style={{ opacity: (config.backgroundDim ?? 70) / 100 }}
          />
        )}

        {/* Top Glowing Velvet Spotlight */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[600px] bg-gradient-to-b from-red-600/25 via-red-950/15 to-transparent rounded-full blur-[140px]"
        />

        {/* Bottom Ambient Glow */}
        <div className="absolute -bottom-40 right-1/4 w-[700px] h-[500px] bg-red-900/15 rounded-full blur-[150px]" />

        {/* Subtle Luxury Stardust Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_15%,#000_65%,transparent_100%)] opacity-25" />

        {/* Dark Obsidian Edge Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(6,2,5,0.9)_100%)]" />
      </div>

      {/* ─── Locked Bio Profile Container (No top bar) ─── */}
      <main className="w-full max-w-lg flex-1 flex flex-col items-center space-y-7 relative z-10">
        {/* Profile Header Block */}
        <div className="flex flex-col items-center text-center space-y-3.5 pt-2 sm:pt-4">
          {/* Avatar / Editable Logo */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-red-600 via-red to-red-900 shadow-[0_0_35px_rgba(200,16,46,0.5)] border border-red/60 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              {config.avatarUrl ? (
                <img
                  src={config.avatarUrl}
                  alt={config.title || "VELVT.in"}
                  className="w-full h-full rounded-full object-cover bg-black"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#0c050a] flex items-center justify-center border border-white/10">
                  <span className="font-display font-black text-2xl tracking-tighter text-white">
                    V<span className="text-red">.</span>
                  </span>
                </div>
              )}
            </div>
            {config.verified && (
              <div
                className="absolute -bottom-1 -right-1 flex items-center justify-center filter drop-shadow-[0_2px_8px_rgba(0,149,246,0.6)]"
                title="Official Verified Platform"
              >
                <InstagramVerifiedBadge className="w-7 h-7" size={28} />
              </div>
            )}
          </div>

          {/* Title: VELVT.in with Instagram Verified Tick */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider uppercase">
                VELVT<span className="text-red">.in</span>
              </h1>
              {config.verified && (
                <InstagramVerifiedBadge
                  className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_8px_rgba(0,149,246,0.6)] shrink-0"
                  size={22}
                />
              )}
            </div>
            <p className="text-xs sm:text-sm font-mono text-white/70 max-w-sm leading-relaxed px-2 tracking-widest uppercase">
              {config.bio || "Experience Architecture"}
            </p>
          </div>

          {/* Location Tag */}
          {config.location && (
            <div>
              <span className="text-[10px] font-mono tracking-widest text-white/80 uppercase bg-white/[0.04] px-3.5 py-1 rounded-full border border-white/10 inline-flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                {config.location}
              </span>
            </div>
          )}

          {/* Real Brand Social Icons (Authentic SVGs) */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {config.socials.instagram && (
              <a
                href={config.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-pink-500/80 hover:bg-pink-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all cursor-pointer"
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5 text-pink-500" />
              </a>
            )}
            {/* Direct WhatsApp Chat with official number +91 93951 78940 */}
            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-emerald-500/80 hover:bg-emerald-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(37,211,102,0.5)] transition-all cursor-pointer"
              title="Chat on WhatsApp (+91 93951 78940)"
              aria-label="Chat on WhatsApp (+91 93951 78940)"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            </a>
            {config.socials.spotify && (
              <a
                href={config.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-emerald-400/80 hover:bg-emerald-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(29,185,84,0.5)] transition-all cursor-pointer"
                title="Spotify Playlist"
                aria-label="Spotify Playlist"
              >
                <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
              </a>
            )}
            {config.socials.youtube && (
              <a
                href={config.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-red/80 hover:bg-red-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all cursor-pointer"
                title="YouTube Recaps"
                aria-label="YouTube Recaps"
              >
                <YouTubeIcon className="w-5 h-5 text-red-500" />
              </a>
            )}
            {config.socials.email && (
              <a
                href={`mailto:${config.socials.email}`}
                className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-blue-500/80 hover:bg-blue-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all cursor-pointer"
                title="Email Desk"
                aria-label="Email Desk"
              >
                <MailIcon className="w-5 h-5 text-blue-400" />
              </a>
            )}
            {config.socials.phone && (
              <a
                href={`tel:${config.socials.phone.replace(/\s+/g, "")}`}
                className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-emerald-400/80 hover:bg-emerald-950/40 hover:scale-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all cursor-pointer"
                title="Direct Phone"
                aria-label="Direct Phone"
              >
                <PhoneIcon className="w-5 h-5 text-emerald-400" />
              </a>
            )}
          </div>
        </div>

        {/* Search & Category Filter (Only if More than 4 Links) */}
        {links.length > 4 && (
          <div className="w-full space-y-2.5">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search links, passes, deck..."
                className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-red focus:shadow-[0_0_15px_rgba(200,16,46,0.3)] transition-all backdrop-blur-md"
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
                        ? "bg-red text-white border-red shadow-[0_0_12px_rgba(200,16,46,0.5)] font-bold"
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

        {/* ─── Links Stack (Glassmorphism & High-Contrast Typography) ─── */}
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
              const displayTitle = cleanLinkTitle(link.title);

              const content = (
                <div
                  className={`w-full p-4 sm:p-4.5 rounded-2xl transition-all duration-300 relative group flex items-center justify-between gap-4 backdrop-blur-xl border ${
                    isFlagship
                      ? "bg-gradient-to-r from-red-950/70 via-[#14070a]/90 to-red-950/40 border-red/60 shadow-[0_0_35px_rgba(200,16,46,0.35)] hover:shadow-[0_0_45px_rgba(200,16,46,0.55)] hover:border-red hover:scale-[1.015]"
                      : "bg-[#0e070c]/80 border-white/12 hover:bg-[#150912]/90 hover:border-red/60 hover:shadow-[0_0_25px_rgba(200,16,46,0.3)] hover:scale-[1.015]"
                  }`}
                >
                  {/* Specular Highlight Line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-red/60 transition-colors pointer-events-none" />

                  {/* Featured Pill */}
                  {isFlagship && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-red border border-white/25 shadow-[0_0_12px_#c8102e] flex items-center gap-1 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-white">
                        {link.badge || "FLAGSHIP"}
                      </span>
                    </div>
                  )}

                  {/* Icon & Clean Text Details */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 shadow-md ${
                        isFlagship
                          ? "bg-gradient-to-br from-red/30 via-red-950/40 to-black border-red/60 shadow-[0_0_20px_rgba(200,16,46,0.5)] group-hover:scale-105"
                          : "bg-white/[0.06] border-white/15 text-white group-hover:border-red/50 group-hover:bg-red/15 group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(200,16,46,0.35)]"
                      }`}
                    >
                      <RealLinkIcon
                        icon={link.icon}
                        title={displayTitle}
                        url={link.url}
                        className="w-6 h-6"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-tight group-hover:text-red transition-colors line-clamp-1">
                          {displayTitle}
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

                  {/* Arrow Glyph */}
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

      {/* ─── Clean Locked Footer (Exact user request) ─── */}
      <footer className="w-full max-w-lg pt-8 pb-10 text-center space-y-2.5 relative z-10 border-t border-white/[0.08] mt-8">
        <p className="text-xs font-mono text-white/50">
          &copy; 2026 VELVT. All rights reserved.
        </p>
        <p className="text-xs font-mono">
          <a
            href="https://www.instagram.com/finding.sahil/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors group"
          >
            <span>Created with</span>
            <span className="text-red inline-block transition-transform group-hover:scale-125">❤️</span>
            <span>by</span>
            <span className="text-white font-bold underline underline-offset-4 group-hover:text-red transition-colors">
              Sahil
            </span>
          </a>
        </p>
      </footer>
    </div>
  );
}
