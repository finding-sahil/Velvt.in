"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings, changeAdminPassword, updateSiteTheme } from "@/app/actions";
import { defaultPillars, ExperienceHighlightItem } from "@/app/sections/HalloweenExperienceSection";
import { ToastNotification, ToastState } from "@/components/ui/ToastNotification";
import { CONTROLLED_PAGES, PageStatus } from "@/lib/page-status";

interface SettingsManagerProps {
  settings: Record<string, string>;
  events: any[];
}

const EMOJI_PRESETS = ["🕯️", "🎭", "🔮", "🍸", "🦇", "🕷️", "💀", "🖤", "🍷", "✦", "◈", "🔊", "🩸", "⚡"];

export function SettingsManager({ settings, events }: SettingsManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [currentTheme, setCurrentTheme] = useState(settings.site_theme || "halloween");
  const [themeLoading, setThemeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "themes" | "page_switches" | "highlights" | "hero" | "story" | "socials" | "event_cta" | "security"
  >("themes");

  // Security / Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Parse existing highlights or fallback to default
  const initialHighlights: ExperienceHighlightItem[] = (() => {
    if (settings.experience_highlights) {
      try {
        const parsed = JSON.parse(settings.experience_highlights);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return defaultPillars;
  })();

  const [highlights, setHighlights] = useState<ExperienceHighlightItem[]>(initialHighlights);

  const [form, setForm] = useState({
    brand_name: settings.brand_name || "VELVT",
    tagline: settings.tagline || "It starts as a thought, ends as a memory.",
    hero_title: settings.hero_title || "VELVT",
    hero_tagline: settings.hero_tagline || "It starts as a thought, ends as a memory.",
    hero_sub: settings.hero_sub || "Thematic nightlife, immersive staging, and sensory productions in Silchar, Assam, India.",
    hero_cta_primary: settings.hero_cta_primary || "Explore Curse 2.O",
    hero_cta_secondary: settings.hero_cta_secondary || "Book Passes",

    // Experience Highlights Section
    experience_highlights_title: settings.experience_highlights_title || "Experience Highlights.",
    experience_highlights_cta_label: settings.experience_highlights_cta_label || "Production Dossier",

    // Brand Intro Section
    brand_intro_title: settings.brand_intro_title || "Sensory Architecture.",
    brand_intro_headline: settings.brand_intro_headline || "We don't just organize events — we construct immersive nocturnal worlds.",
    brand_intro_body: settings.brand_intro_body || "From subterranean set design to synchronized lighting and acoustics, VELVT crafts experiences that linger long after the night ends.",
    brand_intro_badge: settings.brand_intro_badge || "Thematic Event Production • Silchar, Assam, India",

    // Services Section
    services_title: settings.services_title || "What We Do.",
    services_subtitle: settings.services_subtitle || "The planning, design, and production craft behind every VELVT experience.",

    // Socials & Contacts
    contact_email: settings.contact_email || "contact@velvt.in",
    press_email: settings.press_email || "press@velvt.in",
    social_instagram: settings.social_instagram || "https://www.instagram.com/velvt.in",
    social_whatsapp: settings.social_whatsapp || "https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8",
    phone: settings.phone || "+91 98300 00000",

    // Featured Event & Final CTA
    featured_event_id: settings.featured_event_id || "",
    final_cta_title: settings.final_cta_title || "Let's Create What's Next.",
    final_cta_button: settings.final_cta_button || "Collaborate With Us",
  });

  // Highlight Card operations
  function updateHighlight(index: number, field: keyof ExperienceHighlightItem, value: string) {
    const updated = [...highlights];
    updated[index] = { ...updated[index], [field]: value };
    setHighlights(updated);
  }

  // Page Switches State
  const [pageStatuses, setPageStatuses] = useState<
    Record<string, { status: PageStatus; title: string; subtitle: string }>
  >(() => {
    const initial: Record<string, { status: PageStatus; title: string; subtitle: string }> = {};
    for (const page of CONTROLLED_PAGES) {
      initial[page.key] = {
        status: (settings[`page_status_${page.key}`] as PageStatus) || page.defaultStatus,
        title: settings[`page_title_${page.key}`] || "",
        subtitle: settings[`page_sub_${page.key}`] || "",
      };
    }
    return initial;
  });

  function updatePageStatus(
    pageKey: string,
    field: "status" | "title" | "subtitle",
    value: string
  ) {
    setPageStatuses((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value,
      },
    }));
  }

  function addHighlight() {
    setHighlights([
      ...highlights,
      {
        icon: "✦",
        tag: "Atmosphere",
        title: "New Highlight Pillar",
        description: "Describe the sensory or production detail here.",
        href: "",
      },
    ]);
  }

  function removeHighlight(index: number) {
    if (highlights.length <= 1) {
      setToast({ message: "You must keep at least 1 highlight card", type: "error" });
      return;
    }
    setHighlights(highlights.filter((_, i) => i !== index));
  }

  function moveHighlight(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= highlights.length) return;
    const updated = [...highlights];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setHighlights(updated);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const payload: Record<string, string> = {
      ...form,
      experience_highlights: JSON.stringify(highlights),
    };

    // Include page statuses & custom overrides
    for (const [pageKey, config] of Object.entries(pageStatuses)) {
      payload[`page_status_${pageKey}`] = config.status;
      payload[`page_title_${pageKey}`] = config.title;
      payload[`page_sub_${pageKey}`] = config.subtitle;
    }

    const res = await updateSiteSettings(payload);
    setLoading(false);

    if (res.success) {
      setSaved(true);
      setToast({ message: "Site settings saved & live site revalidated", type: "success" });
      setTimeout(() => setSaved(false), 4000);
      router.refresh();
    } else {
      setToast({ message: "Failed to update settings: " + (res.error || "Unknown error"), type: "error" });
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordStatus(null);

    const fd = new FormData();
    fd.append("currentPassword", passwordForm.currentPassword);
    fd.append("newPassword", passwordForm.newPassword);
    fd.append("confirmPassword", passwordForm.confirmPassword);

    const res = await changeAdminPassword(fd);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordStatus({
        type: "success",
        text: "Password changed successfully! Keep your new credentials safe.",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPasswordStatus({
        type: "error",
        text: res.error || "Failed to update password. Please check requirements.",
      });
    }
  }

  const THEME_OPTIONS = [
    {
      id: "blood_moon",
      name: "Blood Moon",
      tagline: "Vampire Curse Edition — Blood dripping, giant red moon & gothic candles",
      description: "Atmospheric horror aesthetic: visceral animated blood dripping from VELVT.IN, giant glowing Blood Red Moon behind the hero, gothic candelabras, spiderwebs, and rolling fog.",
      accentColor: "#dc2626",
      dotColor: "rgba(220, 38, 38, 0.4)",
      bgColor: "#050406",
      badge: "Vampire Blood Curse (Default)",
    },
    {
      id: "halloween_pumpkin",
      name: "Wicked Pumpkin",
      tagline: "Jack-O'-Lantern Edition — Glowing orange pumpkins, embers & candleflames",
      description: "Classic vibrant Halloween orange aesthetic: carved grinning Jack-O'-Lanterns with glowing sinister eyes, warm flickering candlelight, floating ember particles, and spooky mist.",
      accentColor: "#ff6b00",
      dotColor: "rgba(255, 107, 0, 0.4)",
      bgColor: "#070402",
      badge: "Halloween Orange (Spooky)",
    },
    {
      id: "phantom_ghost",
      name: "Phantom Ghost",
      tagline: "Spectral Crypt Edition — Eerie ectoplasm green, floating spirits & cold fog",
      description: "Haunted crypt aesthetic: spectral neon cyan and ectoplasm green glows, floating ghost apparitions drifting across the screen, chilling spiderwebs, and cemetery mist.",
      accentColor: "#00ff9d",
      dotColor: "rgba(0, 255, 157, 0.35)",
      bgColor: "#020705",
      badge: "Creepy Ghost Theme",
    },
    {
      id: "witch_coven",
      name: "Witch Coven",
      tagline: "Poison Sorcery Edition — Occult violet runes & purple candlelight",
      description: "Midnight occult aesthetic: deep mystical violet aura, poisonous potion amethyst glow, witch candlelight, arcane web filigree, and toxic haze.",
      accentColor: "#a855f7",
      dotColor: "rgba(168, 85, 247, 0.4)",
      bgColor: "#07030c",
      badge: "Witch Sorcery",
    },
    {
      id: "halloween_mix",
      name: "All 4 Mix (Grand Fusion)",
      tagline: "Ultimate Halloween Spectacle — Blood drips + Jack-O'-Lanterns + Ghosts + Witch Sorcery",
      description: "The ultimate synthesis combining all 4 themes simultaneously: animated blood dripping from VELVT.IN, glowing orange Jack-O'-Lanterns, spectral floating ghosts, and mystical witch candlelight.",
      accentColor: "#f59e0b",
      dotColor: "rgba(255, 107, 0, 0.4)",
      bgColor: "#060307",
      badge: "All 4 Themes Combined",
    },
    {
      id: "legacy",
      name: "Legacy Velvet",
      tagline: "Preserved Original — Classic velvet crimson, monochrome luxury & zero spooky artifacts",
      description: "The 100% untouched original Velvet aesthetic: deep obsidian black, classic velvet crimson accents, elegant borders, white dot matrix, with ZERO pumpkins, blood, or horror elements.",
      accentColor: "#c8102e",
      dotColor: "rgba(255, 255, 255, 0.2)",
      bgColor: "#000000",
      badge: "Untouched Classic Velvet",
    },
  ];

  async function handleThemeSwitch(themeId: string) {
    // 1. INSTANT 0ms client-side DOM + storage update (zero delay)
    setCurrentTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem("velvt_theme", themeId);
    document.cookie = `velvt_theme=${themeId}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("velvt-theme-change", { detail: themeId }));

    const opt = THEME_OPTIONS.find((t) => t.id === themeId);
    setToast({
      type: "success",
      message: `Theme instantly switched to "${opt?.name || themeId}" live across VELVT!`,
    });

    // 2. Background async sync to database for persistence (no blocking, no page reload)
    try {
      await updateSiteTheme(themeId);
    } catch {
      // Non-blocking sync
    }
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top Header Bar with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Central Content Management System
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
            Site CMS &amp; Page Details
          </h1>
          <p className="text-xs text-g5 mt-1">
            Customize live text, Experience Highlights cards, hero copy, and channel links without code edits.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-red text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-red/80 transition-all cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.5)] flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          {loading ? (
            <>
              <span className="animate-spin">◌</span>
              <span>Saving CMS...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Publish Changes</span>
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-400 font-mono text-xs flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.2)] animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">✓</span>
            <span>All CMS settings, Experience Highlights, and page copy updated and revalidated live!</span>
          </div>
          <span className="text-[10px] text-emerald-500 uppercase tracking-widest">Active</span>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: "themes", label: "🎨 Theme Switcher", badge: currentTheme.toUpperCase() },
          { id: "page_switches", label: "🎛️ Page Switches", badge: "Instant Control" },
          { id: "highlights", label: "✨ Experience Highlights", badge: `${highlights.length} cards` },
          { id: "hero", label: "⚡ Hero & Identity" },
          { id: "story", label: "🏛️ Story & Services" },
          { id: "socials", label: "💬 Socials & Contact" },
          { id: "event_cta", label: "🎃 Event Hub & CTA" },
          { id: "security", label: "🔒 Security & Password" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-red text-white font-bold shadow-[0_0_15px_rgba(200,16,46,0.35)]"
                : "bg-white/[0.04] text-g5 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/40 text-white font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs font-mono">
        {/* TAB: THEME SWITCHER */}
        {activeTab === "themes" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red animate-pulse" />
                    <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider">
                      Dynamic Site Theme Engine
                    </h3>
                  </div>
                  <p className="text-[11px] text-g5 mt-1">
                    Switch the visual atmosphere of VELVT instantly. The selected theme dynamically updates colors, ambient glow halos, dot grid patterns, and page textures site-wide.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-red-glow bg-red-dim text-white font-bold">
                    Active: {currentTheme.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Theme Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEME_OPTIONS.map((theme) => {
                  const isCurrent = currentTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      style={{ borderColor: isCurrent ? theme.accentColor : undefined }}
                      className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between gap-4 ${
                        isCurrent
                          ? "bg-white/[0.06] shadow-[0_0_30px_rgba(0,0,0,0.8)] ring-1"
                          : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* Theme Card Header */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: `${theme.accentColor}20`,
                              color: theme.accentColor,
                              border: `1px solid ${theme.accentColor}40`,
                            }}
                          >
                            {theme.badge}
                          </span>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              LIVE ACTIVE
                            </span>
                          )}
                        </div>

                        {/* Theme Title */}
                        <div>
                          <h4 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                            {theme.name}
                          </h4>
                          <p className="text-[11px] text-g5 italic font-sans pt-0.5">
                            {theme.tagline}
                          </p>
                        </div>

                        <p className="text-[11px] text-g6 leading-relaxed font-sans pt-1">
                          {theme.description}
                        </p>
                      </div>

                      {/* Visual Color Palette Swatch Bar */}
                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-g5 uppercase tracking-wider">Palette:</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.accentColor }}
                              title="Primary Accent"
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.bgColor }}
                              title="Background Tone"
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.dotColor }}
                              title="Grid Dot Matrix"
                            />
                          </div>
                        </div>

                        {/* Switch Button */}
                        <button
                          type="button"
                          disabled={themeLoading || isCurrent}
                          onClick={() => handleThemeSwitch(theme.id)}
                          style={{
                            backgroundColor: isCurrent ? `${theme.accentColor}30` : theme.accentColor,
                            borderColor: theme.accentColor,
                          }}
                          className={`w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isCurrent
                              ? "text-white cursor-default border"
                              : "text-white hover:opacity-90 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                          }`}
                        >
                          {themeLoading ? (
                            <span>Switching...</span>
                          ) : isCurrent ? (
                            <span>✓ Active Theme</span>
                          ) : (
                            <span>Activate {theme.name} &rarr;</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 0: PAGE SWITCHES & INSTANT CONTROL */}
        {activeTab === "page_switches" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
                    <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider">
                      Page Switchboard &amp; Instant Visibility
                    </h3>
                  </div>
                  <p className="text-[11px] text-g5 mt-1">
                    Control public access for every section of VELVT. Switch between Live, Coming Soon, or Inactive with 1 click.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-red-glow bg-red-dim text-white font-bold">
                    8 Pages Controlled
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {CONTROLLED_PAGES.map((page) => {
                  const current = pageStatuses[page.key] || {
                    status: page.defaultStatus,
                    title: "",
                    subtitle: "",
                  };

                  return (
                    <div
                      key={page.key}
                      className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="font-display font-bold text-base text-white uppercase tracking-wide">
                              {page.name}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-g5">
                              {page.path}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border font-bold ${
                                current.status === "active"
                                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                                  : current.status === "coming_soon"
                                  ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                                  : "bg-red-950/60 text-red-400 border-red-800/60"
                              }`}
                            >
                              {current.status === "active"
                                ? "● Live / Active"
                                : current.status === "coming_soon"
                                ? "⏳ Coming Soon"
                                : "⊘ Inactive / Paused"}
                            </span>
                          </div>
                          <p className="text-[11px] text-g5 font-mono mt-1">
                            Default: <span className="capitalize">{page.defaultStatus.replace("_", " ")}</span> •{" "}
                            <a
                              href={page.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red hover:underline inline-flex items-center gap-1"
                            >
                              <span>Preview in new tab</span>
                              <span>&nearr;</span>
                            </a>
                          </p>
                        </div>

                        {/* 3-Way Instant Mode Selector */}
                        <div className="flex items-center rounded-xl bg-black/60 border border-white/10 p-1 shrink-0 self-start md:self-auto">
                          <button
                            type="button"
                            onClick={() => updatePageStatus(page.key, "status", "active")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                              current.status === "active"
                                ? "bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                : "text-g5 hover:text-white"
                            }`}
                          >
                            <span>●</span>
                            <span>Live</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updatePageStatus(page.key, "status", "coming_soon")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                              current.status === "coming_soon"
                                ? "bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                : "text-g5 hover:text-white"
                            }`}
                          >
                            <span>⏳</span>
                            <span>Coming Soon</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updatePageStatus(page.key, "status", "inactive")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                              current.status === "inactive"
                                ? "bg-red text-white font-bold shadow-[0_0_12px_rgba(200,16,46,0.5)]"
                                : "text-g5 hover:text-white"
                            }`}
                          >
                            <span>⊘</span>
                            <span>Inactive</span>
                          </button>
                        </div>
                      </div>

                      {/* Optional Custom Overrides */}
                      {current.status !== "active" && (
                        <div className="pt-3 border-t border-white/[0.06] grid sm:grid-cols-2 gap-3 animate-fade-in bg-black/40 p-3.5 rounded-xl border border-white/5">
                          <div>
                            <label className="block text-[10px] text-g5 uppercase tracking-wider mb-1">
                              Custom Headline (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder={page.defaultTitle}
                              value={current.title}
                              onChange={(e) => updatePageStatus(page.key, "title", e.target.value)}
                              className="w-full bg-black/70 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-g5/40 focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-g5 uppercase tracking-wider mb-1">
                              Custom Subtitle / Message (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder={page.defaultSubtitle}
                              value={current.subtitle}
                              onChange={(e) => updatePageStatus(page.key, "subtitle", e.target.value)}
                              className="w-full bg-black/70 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-g5/40 focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: EXPERIENCE HIGHLIGHTS */}
        {activeTab === "highlights" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider">
                    Experience Highlights Configuration
                  </h3>
                  <p className="text-[11px] text-g5 mt-0.5">
                    This section displays the 4 interactive glass highlight cards on the homepage under the featured event.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="px-3.5 py-1.5 rounded-full bg-red-dim border border-red-glow text-white text-xs font-mono uppercase tracking-wider hover:bg-red/20 transition-all cursor-pointer self-start sm:self-auto"
                >
                  + Add Highlight Card
                </button>
              </div>

              {/* Section Header Controls */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase">Section Heading Title</label>
                  <input
                    type="text"
                    value={form.experience_highlights_title}
                    onChange={(e) => setForm({ ...form, experience_highlights_title: e.target.value })}
                    placeholder="e.g. Experience Highlights."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase">Top-Right Link Text</label>
                  <input
                    type="text"
                    value={form.experience_highlights_cta_label}
                    onChange={(e) => setForm({ ...form, experience_highlights_cta_label: e.target.value })}
                    placeholder="e.g. Production Dossier"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Highlight Cards Interactive List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-white font-bold">
                    Interactive Cards ({highlights.length})
                  </span>
                  <span className="text-[10px] text-g5">
                    Drag or use arrows to reorder cards
                  </span>
                </div>

                <div className="grid gap-4">
                  {highlights.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1.5 rounded-lg bg-white/[0.05] border border-white/10 select-none">
                            {item.icon || "✦"}
                          </span>
                          <div>
                            <span className="text-white font-bold text-sm block">
                              Card #{index + 1}: {item.title || "Untitled"}
                            </span>
                            <span className="text-[10px] text-red uppercase tracking-wider">
                              Category: {item.tag || "Atmosphere"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveHighlight(index, "up")}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1.5 rounded bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 text-white cursor-pointer"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveHighlight(index, "down")}
                            disabled={index === highlights.length - 1}
                            title="Move Down"
                            className="p-1.5 rounded bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 text-white cursor-pointer"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHighlight(index)}
                            title="Delete Card"
                            className="p-1.5 rounded bg-red-dim hover:bg-red/20 text-red cursor-pointer border border-red-glow text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Card Fields */}
                      <div className="grid sm:grid-cols-12 gap-3">
                        {/* Icon & Preset Picker */}
                        <div className="sm:col-span-3 space-y-1.5">
                          <label className="block text-g5 text-[10px] uppercase">Icon (Emoji / Symbol)</label>
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) => updateHighlight(index, "icon", e.target.value)}
                            placeholder="🕯️"
                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white text-center text-base"
                          />
                          <div className="flex flex-wrap gap-1 pt-1">
                            {EMOJI_PRESETS.slice(0, 7).map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => updateHighlight(index, "icon", emoji)}
                                className="w-6 h-6 rounded bg-white/[0.04] hover:bg-white/10 text-xs flex items-center justify-center cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Category Tag & Title */}
                        <div className="sm:col-span-9 space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-g5 text-[10px] uppercase">Pillar Category / Tag *</label>
                              <input
                                type="text"
                                value={item.tag}
                                onChange={(e) => updateHighlight(index, "tag", e.target.value)}
                                placeholder="e.g. Atmosphere, Dress Code"
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-g5 text-[10px] uppercase">Card Title *</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateHighlight(index, "title", e.target.value)}
                                placeholder="e.g. The Cursed Chamber"
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-g5 text-[10px] uppercase">Description *</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateHighlight(index, "description", e.target.value)}
                              placeholder="Brief description of the sensory highlight..."
                              className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-g5 text-[10px] uppercase">Custom Link URL (optional, defaults to event)</label>
                            <input
                              type="text"
                              value={item.href || ""}
                              onChange={(e) => updateHighlight(index, "href", e.target.value)}
                              placeholder="e.g. /events/velvt-curse-2-o"
                              className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO & BRAND IDENTITY */}
        {activeTab === "hero" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider pb-2 border-b border-white/10">
                Hero Section Configuration
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Hero Title (Brand Display)</label>
                  <input
                    type="text"
                    required
                    value={form.hero_title}
                    onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Organization Brand Name</label>
                  <input
                    type="text"
                    required
                    value={form.brand_name}
                    onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Brand Tagline (Under Headline)</label>
                <input
                  type="text"
                  required
                  value={form.hero_tagline}
                  onChange={(e) => setForm({ ...form, hero_tagline: e.target.value, tagline: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Hero Subtitle Paragraph</label>
                <textarea
                  rows={2}
                  required
                  value={form.hero_sub}
                  onChange={(e) => setForm({ ...form, hero_sub: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Primary Button Label</label>
                  <input
                    type="text"
                    value={form.hero_cta_primary}
                    onChange={(e) => setForm({ ...form, hero_cta_primary: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Secondary Button Label</label>
                  <input
                    type="text"
                    value={form.hero_cta_secondary}
                    onChange={(e) => setForm({ ...form, hero_cta_secondary: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STORY & SERVICES */}
        {activeTab === "story" && (
          <div className="space-y-6 animate-fade-in">
            {/* Brand Intro / Sensory Architecture */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider pb-2 border-b border-white/10">
                Sensory Architecture (Brand Intro Section)
              </h3>

              <div>
                <label className="block text-g5 mb-1 uppercase">Section Title</label>
                <input
                  type="text"
                  value={form.brand_intro_title}
                  onChange={(e) => setForm({ ...form, brand_intro_title: e.target.value })}
                  placeholder="Sensory Architecture."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Main Quote / Headline</label>
                <input
                  type="text"
                  value={form.brand_intro_headline}
                  onChange={(e) => setForm({ ...form, brand_intro_headline: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Body Paragraph</label>
                <textarea
                  rows={3}
                  value={form.brand_intro_body}
                  onChange={(e) => setForm({ ...form, brand_intro_body: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Badge Tag</label>
                <input
                  type="text"
                  value={form.brand_intro_badge}
                  onChange={(e) => setForm({ ...form, brand_intro_badge: e.target.value })}
                  placeholder="Thematic Event Production • Silchar, Assam, India"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            {/* Services Section */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider pb-2 border-b border-white/10">
                &quot;What We Do&quot; Section
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Heading Title</label>
                  <input
                    type="text"
                    value={form.services_title}
                    onChange={(e) => setForm({ ...form, services_title: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Subtitle</label>
                  <input
                    type="text"
                    value={form.services_subtitle}
                    onChange={(e) => setForm({ ...form, services_subtitle: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIALS & CONTACT */}
        {activeTab === "socials" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider pb-2 border-b border-white/10">
                Official Channels &amp; Community Links
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Instagram URL</label>
                  <input
                    type="url"
                    value={form.social_instagram}
                    onChange={(e) => setForm({ ...form, social_instagram: e.target.value })}
                    placeholder="https://www.instagram.com/velvt.in"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">WhatsApp Updates Invite URL</label>
                  <input
                    type="url"
                    value={form.social_whatsapp}
                    onChange={(e) => setForm({ ...form, social_whatsapp: e.target.value })}
                    placeholder="https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 mb-1 uppercase">General Contact Email</label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    placeholder="contact@velvt.in"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Press &amp; Media Email</label>
                  <input
                    type="email"
                    value={form.press_email}
                    onChange={(e) => setForm({ ...form, press_email: e.target.value })}
                    placeholder="press@velvt.in"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-g5 mb-1 uppercase">Phone / Helpline (Optional)</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98300 00000"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FEATURED EVENT & FINAL CTA */}
        {activeTab === "event_cta" && (
          <div className="space-y-6 animate-fade-in">
            {/* Featured Event Hub Selection */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider pb-2 border-b border-white/10">
                Featured Event Hub Selection
              </h3>

              <div>
                <label className="block text-g5 mb-1 uppercase">
                  Flagship Showcase Event (Homepage Spotlight)
                </label>
                <select
                  value={form.featured_event_id}
                  onChange={(e) => setForm({ ...form, featured_event_id: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                >
                  <option value="">Default (First event marked as isFeatured)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Final CTA Section */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider pb-2 border-b border-white/10">
                Final Call To Action (Bottom of Homepage)
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Final CTA Heading</label>
                  <input
                    type="text"
                    value={form.final_cta_title}
                    onChange={(e) => setForm({ ...form, final_cta_title: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1 uppercase">Button Text</label>
                  <input
                    type="text"
                    value={form.final_cta_button}
                    onChange={(e) => setForm({ ...form, final_cta_button: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY & PASSWORD CHANGE */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-5">
              <div className="pb-3 border-b border-white/10">
                <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider">
                  Admin Security &amp; Password
                </h3>
                <p className="text-[11px] text-g5 mt-0.5">
                  Update your credentials. Enforces industry-standard strong password hashing with PBKDF2 (100,000 rounds).
                </p>
              </div>

              {passwordStatus && (
                <div
                  className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-400"
                      : "bg-red-950/60 border-red-800/60 text-red-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{passwordStatus.type === "success" ? "✓" : "⚠"}</span>
                    <span>{passwordStatus.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasswordStatus(null)}
                    className="text-white/40 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="max-w-xl space-y-4">
                <div>
                  <label className="block text-g5 mb-1 uppercase">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter your current password"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-g5 hover:text-white uppercase cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-g5 mb-1 uppercase">New Strong Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Create a strong new password"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                  {/* Strength Checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-[10px] font-mono">
                    <span
                      className={`flex items-center gap-1 ${
                        passwordForm.newPassword.length >= 10 ? "text-emerald-400" : "text-g5"
                      }`}
                    >
                      {passwordForm.newPassword.length >= 10 ? "✓" : "○"} 10+ Characters
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        /[A-Z]/.test(passwordForm.newPassword) ? "text-emerald-400" : "text-g5"
                      }`}
                    >
                      {/[A-Z]/.test(passwordForm.newPassword) ? "✓" : "○"} Uppercase (A-Z)
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        /[a-z]/.test(passwordForm.newPassword) ? "text-emerald-400" : "text-g5"
                      }`}
                    >
                      {/[a-z]/.test(passwordForm.newPassword) ? "✓" : "○"} Lowercase (a-z)
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        /[0-9]/.test(passwordForm.newPassword) ? "text-emerald-400" : "text-g5"
                      }`}
                    >
                      {/[0-9]/.test(passwordForm.newPassword) ? "✓" : "○"} Number (0-9)
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        /[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "text-emerald-400" : "text-g5"
                      }`}
                    >
                      {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "✓" : "○"} Symbol (!@#$)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-g5 mb-1 uppercase">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Repeat the new password"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                  {passwordForm.confirmPassword && (
                    <p
                      className={`text-[10px] mt-1 ${
                        passwordForm.newPassword === passwordForm.confirmPassword
                          ? "text-emerald-400"
                          : "text-red"
                      }`}
                    >
                      {passwordForm.newPassword === passwordForm.confirmPassword
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={
                      passwordLoading ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      passwordForm.newPassword !== passwordForm.confirmPassword ||
                      passwordForm.newPassword.length < 10
                    }
                    className="px-6 py-2.5 rounded-full bg-red text-white font-bold text-xs uppercase tracking-wider hover:bg-red/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.5)] flex items-center gap-2"
                  >
                    {passwordLoading ? "Updating..." : "Update Admin Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Bar */}
        <div className="pt-4 flex items-center justify-between border-t border-white/10">
          <span className="text-g5 text-[11px]">
            Changes take effect immediately across all public routes upon save.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-full bg-red text-white font-bold text-xs uppercase tracking-wider hover:bg-red/80 transition-all cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.5)] flex items-center gap-2"
          >
            {loading ? "Saving..." : "Save & Revalidate Live Site"}
          </button>
        </div>
      </form>

      {/* Toast Notification Overlay */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
