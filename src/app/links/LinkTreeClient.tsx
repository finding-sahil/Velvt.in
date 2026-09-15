"use client";

import { useState } from "react";
import Link from "next/link";
import type { LinkTreeConfig, LinkTreeLink } from "@/app/actions";
import { trackLinkTreeClick } from "@/app/actions";

interface LinkTreeClientProps {
  config: LinkTreeConfig;
}

export function LinkTreeClient({ config }: LinkTreeClientProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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
      navigator.share({
        title: config.title,
        text: config.bio,
        url,
      }).catch(() => {
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
  )}&bgcolor=0a0a0a&color=ffffff&margin=12`;

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 selection:bg-red selection:text-white font-sans overflow-x-hidden">
      {/* Ambient background atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-red/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-red/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* Top action bar (Share & QR) */}
      <header className="w-full max-w-lg flex items-center justify-between py-2 z-10">
        <Link
          href="/"
          className="text-xs font-mono tracking-widest text-muted hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-red/40"
        >
          <span>←</span>
          <span>VELVT.in</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQr(true)}
            className="p-2 rounded-full bg-white/[0.04] border border-white/10 text-muted hover:text-white hover:border-red/40 transition-all text-xs"
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
            className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-muted hover:text-white hover:border-red/40 transition-all flex items-center gap-1.5"
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

      {/* Main Container */}
      <main className="w-full max-w-lg flex-1 flex flex-col items-center py-6 sm:py-8 space-y-6 z-10">
        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar / Monogram */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary via-red to-red-dim shadow-[0_0_30px_rgba(200,16,46,0.35)] flex items-center justify-center">
              {config.avatarUrl ? (
                <img
                  src={config.avatarUrl}
                  alt={config.title}
                  className="w-full h-full rounded-full object-cover bg-black"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-white/10">
                  <span className="font-display font-black text-2xl tracking-tighter text-white">
                    V<span className="text-primary">.</span>
                  </span>
                </div>
              )}
            </div>
            {config.verified && (
              <div
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary border-2 border-black flex items-center justify-center text-white text-xs font-black shadow-[0_0_10px_#c8102e]"
                title="Verified Official Platform"
              >
                ✓
              </div>
            )}
          </div>

          {/* Title & Verified Badge */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
                {config.title}
              </h1>
              {config.verified && (
                <span className="inline-block text-primary text-sm" title="Official Verified">
                  ●
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted max-w-sm leading-relaxed px-2 font-mono">
              {config.bio}
            </p>
          </div>

          {/* Location Badge */}
          {config.location && (
            <div>
              <span className="text-[10px] font-mono tracking-widest text-white/80 uppercase bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {config.location}
              </span>
            </div>
          )}

          {/* Social Icons Bar */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            {config.socials.instagram && (
              <a
                href={config.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm text-muted hover:text-white hover:border-red/60 hover:bg-red/10 transition-all"
                title="Instagram"
                aria-label="Instagram"
              >
                📷
              </a>
            )}
            {config.socials.whatsapp && (
              <a
                href={config.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm text-muted hover:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-950/30 transition-all"
                title="WhatsApp Group"
                aria-label="WhatsApp Group"
              >
                💬
              </a>
            )}
            {config.socials.email && (
              <a
                href={`mailto:${config.socials.email}`}
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm text-muted hover:text-white hover:border-red/60 hover:bg-red/10 transition-all"
                title="Email"
                aria-label="Email"
              >
                ✉️
              </a>
            )}
            {config.socials.phone && (
              <a
                href={`tel:${config.socials.phone.replace(/\s+/g, "")}`}
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm text-muted hover:text-white hover:border-red/60 hover:bg-red/10 transition-all"
                title="Phone"
                aria-label="Phone"
              >
                📞
              </a>
            )}
            {config.socials.youtube && (
              <a
                href={config.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm text-muted hover:text-red hover:border-red/60 hover:bg-red/10 transition-all"
                title="YouTube"
                aria-label="YouTube"
              >
                ▶️
              </a>
            )}
            {config.socials.spotify && (
              <a
                href={config.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm text-muted hover:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-950/30 transition-all"
                title="Spotify Playlist"
                aria-label="Spotify Playlist"
              >
                🎧
              </a>
            )}
          </div>
        </div>

        {/* Quick Search & Category Filter (if more than 5 links) */}
        {links.length > 5 && (
          <div className="w-full space-y-2">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search links..."
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-muted focus:outline-none focus:border-red/60 focus:shadow-[0_0_12px_rgba(200,16,46,0.3)] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-white"
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
                    className={`px-3 py-1 rounded-full border uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(200,16,46,0.4)]"
                        : "bg-white/[0.03] text-muted border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Links List */}
        <div className="w-full space-y-3.5">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-xs font-mono text-muted uppercase tracking-wider">No links matched</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="text-xs text-primary underline"
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
                  className={`w-full p-4 sm:p-4.5 rounded-2xl transition-all duration-300 relative group flex items-center justify-between gap-3.5 ${
                    isFlagship
                      ? "bg-gradient-to-r from-red-dim/70 via-black to-red-dim/40 border-2 border-red-glow shadow-[0_0_35px_rgba(200,16,46,0.28)] hover:shadow-[0_0_45px_rgba(200,16,46,0.45)] hover:border-primary hover:scale-[1.015]"
                      : "bg-white/[0.04] border border-white/10 hover:border-red/50 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(200,16,46,0.18)] hover:scale-[1.01]"
                  }`}
                >
                  {/* Glowing beacon for featured item */}
                  {isFlagship && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-primary border border-white/20 shadow-[0_0_10px_#c8102e] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-white">
                        {link.badge || "FEATURED"}
                      </span>
                    </div>
                  )}

                  {/* Left: Icon and Details */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl border transition-all duration-300 ${
                        isFlagship
                          ? "bg-red-dim border-red-glow shadow-[0_0_15px_rgba(200,16,46,0.4)] text-white group-hover:scale-105"
                          : "bg-white/[0.05] border-white/10 text-white/90 group-hover:border-red/40 group-hover:bg-red/10"
                      }`}
                    >
                      {link.icon || "🔗"}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                          {link.title}
                        </h2>
                        {!isFlagship && link.badge && (
                          <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-white/80 shrink-0">
                            {link.badge}
                          </span>
                        )}
                      </div>

                      {link.subtitle && (
                        <p className="text-[11px] font-mono text-muted line-clamp-1 group-hover:text-muted/90">
                          {link.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Arrow */}
                  <div className="shrink-0 text-muted group-hover:text-white transition-colors pr-1">
                    {isExternal ? (
                      <span className="text-xs font-mono group-hover:translate-x-0.5 transition-transform inline-block">
                        ↗
                      </span>
                    ) : (
                      <span className="text-xs font-mono group-hover:translate-x-0.5 transition-transform inline-block">
                        →
                      </span>
                    )}
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
                  className="block w-full focus:outline-none"
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={link.id}
                  href={link.url}
                  onClick={() => handleLinkClick(link)}
                  className="block w-full focus:outline-none"
                >
                  {content}
                </Link>
              );
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg py-6 text-center space-y-2 z-10 border-t border-white/[0.08] mt-6">
        <Link
          href="/"
          className="font-display font-black text-sm tracking-[0.15em] text-white hover:text-primary transition-colors uppercase inline-flex items-center gap-1"
        >
          <span>VELVT</span>
          <span className="text-primary">.in</span>
        </Link>
        <p className="text-[10px] font-mono text-muted uppercase tracking-wider">
          It starts as a thought, ends as a memory.
        </p>
      </footer>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-[0_0_60px_rgba(200,16,46,0.35)] relative">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 text-muted hover:text-white text-lg w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                Direct Scan
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                Scan to Open Link Tree
              </h3>
              <p className="text-xs font-mono text-muted">
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
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(200,16,46,0.4)]"
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
