"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings, changeAdminPassword, updateSiteTheme, adminResetUserPassword } from "@/app/actions";
import { defaultPillars, ExperienceHighlightItem } from "@/app/sections/HalloweenExperienceSection";
import { ToastNotification, ToastState } from "@/components/ui/ToastNotification";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { CONTROLLED_PAGES, PageStatus } from "@/lib/page-status";
import { SECTION_CONTROLS, SectionControlCategory } from "@/lib/section-switchboard";

interface SettingsManagerProps {
  settings: Record<string, string>;
  events: any[];
  adminUsers?: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt?: any;
  }>;
  isRootAdmin?: boolean;
}

const EMOJI_PRESETS = ["🕯️", "🎭", "🔮", "🍸", "🦇", "🕷️", "💀", "🖤", "🍷", "✦", "◈", "🔊", "🩸", "⚡"];

export function SettingsManager({
  settings,
  events,
  adminUsers = [],
  isRootAdmin = false,
}: SettingsManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [currentTheme, setCurrentTheme] = useState(settings.site_theme || "halloween");
  const [themeLoading, setThemeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "themes" | "page_switches" | "section_switches" | "highlights" | "hero" | "story" | "socials" | "event_cta" | "security"
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

  // Master User Password State (Root Override)
  const [usersList, setUsersList] = useState(adminUsers);
  const [resetTargetUser, setResetTargetUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [userResetLoading, setUserResetLoading] = useState(false);
  const [userResetMessage, setUserResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Granular Section Switchboard State
  const [sectionToggles, setSectionToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const control of SECTION_CONTROLS) {
      const rawVal = settings[control.key];
      initial[control.key] = rawVal === undefined ? (control.defaultValue ?? true) : rawVal !== "false" && rawVal !== "0";
    }
    return initial;
  });
  const [sectionCategoryFilter, setSectionCategoryFilter] = useState<"all" | SectionControlCategory>("all");
  const [sectionSearchQuery, setSectionSearchQuery] = useState("");

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

    // Impact Numbers Section
    impact_title: settings.impact_title || "By The Numbers.",
    impact_subtitle: settings.impact_subtitle || "The scale, production crew, and nocturnal reach across our events.",
    impact_events_hosted: settings.impact_events_hosted || "12+",
    impact_volunteers_involved: settings.impact_volunteers_involved || "250+",
    impact_artists_featured: settings.impact_artists_featured || "45+",
    impact_community_reach: settings.impact_community_reach || "10,000+",

    // Why VELVT Section
    why_velvt_title: settings.why_velvt_title || "Why VELVT.",
    why_velvt_subtitle: settings.why_velvt_subtitle || "We engineer sensory atmospheres that transcend ordinary nightlife.",
    why_velvt_pillar_1_title: settings.why_velvt_pillar_1_title || "Sensory Immersion",
    why_velvt_pillar_1_desc: settings.why_velvt_pillar_1_desc || "Every angle, shadow, and decibel is orchestrated to immerse you completely in the story.",
    why_velvt_pillar_2_title: settings.why_velvt_pillar_2_title || "Curated Exclusivity",
    why_velvt_pillar_2_desc: settings.why_velvt_pillar_2_desc || "Limited capacities, secret venues, and high-standard guest vetting ensure uncompromised crowd energy.",
    why_velvt_pillar_3_title: settings.why_velvt_pillar_3_title || "Pioneering Culture",
    why_velvt_pillar_3_desc: settings.why_velvt_pillar_3_desc || "Bringing global festival aesthetics, dark electronic music, and gothic architecture to Northeast India.",

    // Newsletter Section
    newsletter_badge: settings.newsletter_badge || "Exclusive Transmission",
    newsletter_title: settings.newsletter_title || "Stay in the Velvet Loop",
    newsletter_subtitle: settings.newsletter_subtitle || "Be the first to know when secret venues drop, tickets open, and private after-parties are announced.",

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

    // Include all minute section toggle switches
    for (const [key, enabled] of Object.entries(sectionToggles)) {
      payload[key] = enabled ? "true" : "false";
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
        text: "Password updated successfully!",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setToast({
        type: "success",
        message: "Password updated successfully!",
      });
    } else {
      setPasswordStatus({
        type: "error",
        text: res.error || "Failed to update password.",
      });
    }
  }

  async function handleAdminResetUserPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTargetUser || !newPasswordInput.trim()) return;

    setUserResetLoading(true);
    setUserResetMessage(null);

    try {
      const res = await adminResetUserPassword(resetTargetUser.id, newPasswordInput.trim());
      if (res.success) {
        setUserResetMessage({
          type: "success",
          text: `Password successfully updated for ${resetTargetUser.name} (${resetTargetUser.email})!`,
        });
        setToast({
          type: "success",
          message: `Password updated for ${resetTargetUser.name}!`,
        });
        setNewPasswordInput("");
        setResetTargetUser(null);
      } else {
        setUserResetMessage({
          type: "error",
          text: res.error || "Failed to reset user password.",
        });
      }
    } catch (err: any) {
      setUserResetMessage({
        type: "error",
        text: err?.message || "Failed to reset password.",
      });
    } finally {
      setUserResetLoading(false);
    }
  }

  const THEME_OPTIONS = [
    {
      id: "legacy",
      name: "Legacy VELVT",
      tagline: "Signature Crimson Nocturnal — Velvet crimson glow & deep dark minimal luxury",
      description: "The core, definitive VELVT aesthetic: deep obsidian black canvas, signature velvet crimson accents, razor-sharp typography, and subtle atmospheric depth.",
      accentColor: "#dc2626",
      dotColor: "rgba(220, 38, 38, 0.4)",
      bgColor: "#09090b",
      badge: "Signature Theme (Default)",
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
      message: `Theme set to "${opt?.name || themeId}" across VELVT!`,
    });

    // 2. Background async sync to database for persistence (no blocking, no page reload)
    try {
      await updateSiteTheme(themeId);
    } catch {
      // Non-blocking sync
    }
  }

  const enabledSectionCount = Object.values(sectionToggles).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top Header Bar with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Central Content Management System
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
            Site CMS & Page Details
          </h1>
          <p className="text-xs text-g5 mt-1">
            Customize live text, Experience Highlights cards, hero copy, and channel links without code edits.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-red hover:bg-red-glow text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_var(--red-glow)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Segmented Navigation Tabs: Single-line streamlined horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
        {[
          { id: "themes", label: "🎨 Theme", badge: "Legacy" },
          { id: "page_switches", label: "🎛️ Page Switches", badge: "8 Pages" },
          { id: "section_switches", label: "⚡ Section Switchboard", badge: `${enabledSectionCount}/${SECTION_CONTROLS.length}` },
          { id: "highlights", label: "✨ Highlights", badge: `${highlights.length}` },
          { id: "hero", label: "⚡ Hero Copy" },
          { id: "story", label: "🏛️ Story" },
          { id: "socials", label: "💬 Socials" },
          { id: "event_cta", label: "🎃 Event CTA" },
          { id: "security", label: "🔒 Security" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
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
                            <span>Activate {theme.name} →</span>
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
                      Page Switchboard & Instant Visibility
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
                              <span>↗</span>
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

        {/* TAB: MINUTE SECTION SWITCHBOARD & DIVERSE CONTROLS */}
        {activeTab === "section_switches" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header & Controls Card */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red animate-pulse" />
                    <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider">
                      Minute Section Switchboard &amp; Visibility Controls
                    </h3>
                  </div>
                  <p className="text-[11px] text-g5 mt-1">
                    Toggle visibility of every single section across the entire website in real-time. Turn off specific sections on the homepage, global atmospheric features, or event detail pages with a single click.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border border-red-glow bg-red-dim text-white font-bold">
                    {enabledSectionCount} of {SECTION_CONTROLS.length} Active
                  </span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: `All (${SECTION_CONTROLS.length})` },
                    { id: "homepage", label: `Homepage (${SECTION_CONTROLS.filter((c) => c.category === "homepage").length})` },
                    { id: "global", label: `Atmosphere & Global (${SECTION_CONTROLS.filter((c) => c.category === "global").length})` },
                    { id: "event_page", label: `Event Detail (${SECTION_CONTROLS.filter((c) => c.category === "event_page").length})` },
                    { id: "about_page", label: `About (${SECTION_CONTROLS.filter((c) => c.category === "about_page").length})` },
                    { id: "volunteers_page", label: `Volunteers (${SECTION_CONTROLS.filter((c) => c.category === "volunteers_page").length})` },
                    { id: "tickets_page", label: `Tickets (${SECTION_CONTROLS.filter((c) => c.category === "tickets_page").length})` },
                    { id: "gallery_page", label: `Gallery (${SECTION_CONTROLS.filter((c) => c.category === "gallery_page").length})` },
                    { id: "press_page", label: `Press (${SECTION_CONTROLS.filter((c) => c.category === "press_page").length})` },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSectionCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        sectionCategoryFilter === cat.id
                          ? "bg-red text-white font-bold shadow-[0_0_12px_rgba(200,16,46,0.4)]"
                          : "bg-white/[0.04] text-g5 hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated: Record<string, boolean> = {};
                      for (const c of SECTION_CONTROLS) updated[c.key] = true;
                      setSectionToggles(updated);
                      setToast({ type: "success", message: "All 26 sections set to Active!" });
                    }}
                    className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-mono uppercase tracking-wider text-emerald-400 transition-all cursor-pointer"
                  >
                    ✓ Enable All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: Record<string, boolean> = {};
                      for (const c of SECTION_CONTROLS) updated[c.key] = false;
                      setSectionToggles(updated);
                      setToast({ type: "info", message: "All sections toggled Off!" });
                    }}
                    className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-mono uppercase tracking-wider text-red transition-all cursor-pointer"
                  >
                    ✕ Disable All
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div>
                <input
                  type="text"
                  placeholder="Search any section (e.g., schedule, gallery, soundscape, why velvt, grain)..."
                  value={sectionSearchQuery}
                  onChange={(e) => setSectionSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-g5/50 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Controls List */}
              <div className="space-y-3">
                {SECTION_CONTROLS.filter((control) => {
                  if (sectionCategoryFilter !== "all" && control.category !== sectionCategoryFilter) {
                    return false;
                  }
                  if (sectionSearchQuery.trim()) {
                    const q = sectionSearchQuery.toLowerCase();
                    return (
                      control.name.toLowerCase().includes(q) ||
                      control.description.toLowerCase().includes(q) ||
                      control.key.toLowerCase().includes(q)
                    );
                  }
                  return true;
                }).map((control) => {
                  const isEnabled = sectionToggles[control.key] ?? control.defaultValue;
                  return (
                    <div
                      key={control.key}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isEnabled
                          ? "bg-white/[0.03] border-white/10 hover:border-white/20"
                          : "bg-red/[0.02] border-red/20 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wide">
                            {control.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 border border-white/10 text-g5">
                            {control.key}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                              control.category === "homepage"
                                ? "bg-red-dim text-white border border-red-glow/40"
                                : control.category === "global"
                                ? "bg-purple-950/40 text-purple-300 border border-purple-500/30"
                                : control.category === "event_page"
                                ? "bg-sky-950/40 text-sky-300 border border-sky-500/30"
                                : "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {control.category.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed max-w-xl">
                          {control.description}
                        </p>
                      </div>

                      {/* Interactive Toggle Switch */}
                      <ToggleSwitch
                        checked={isEnabled}
                        onChange={(checked) =>
                          setSectionToggles((prev) => ({
                            ...prev,
                            [control.key]: checked,
                          }))
                        }
                        size="md"
                        activeLabel="ON"
                        inactiveLabel="OFF"
                        ariaLabel={`Toggle ${control.name}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Minute Details: Production Metrics CMS ─── */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-red" />
                <h3 className="font-display text-lg text-white font-bold uppercase tracking-wider">
                  Production Numbers &amp; Metrics CMS
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Section Heading</label>
                  <input
                    type="text"
                    value={form.impact_title}
                    onChange={(e) => setForm({ ...form, impact_title: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Section Subtitle</label>
                  <input
                    type="text"
                    value={form.impact_subtitle}
                    onChange={(e) => setForm({ ...form, impact_subtitle: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Events Hosted</label>
                  <input
                    type="text"
                    value={form.impact_events_hosted}
                    onChange={(e) => setForm({ ...form, impact_events_hosted: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Crew &amp; Volunteers</label>
                  <input
                    type="text"
                    value={form.impact_volunteers_involved}
                    onChange={(e) => setForm({ ...form, impact_volunteers_involved: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Artists Featured</label>
                  <input
                    type="text"
                    value={form.impact_artists_featured}
                    onChange={(e) => setForm({ ...form, impact_artists_featured: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Nocturnal Reach</label>
                  <input
                    type="text"
                    value={form.impact_community_reach}
                    onChange={(e) => setForm({ ...form, impact_community_reach: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* ─── Minute Details: Why VELVT Pillars CMS ─── */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-red" />
                <h3 className="font-display text-lg text-white font-bold uppercase tracking-wider">
                  Why VELVT Pillars CMS
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Section Heading</label>
                  <input
                    type="text"
                    value={form.why_velvt_title}
                    onChange={(e) => setForm({ ...form, why_velvt_title: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Section Subtitle</label>
                  <input
                    type="text"
                    value={form.why_velvt_subtitle}
                    onChange={(e) => setForm({ ...form, why_velvt_subtitle: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                  <label className="block text-xs font-mono text-red uppercase font-bold">Pillar 01</label>
                  <input
                    type="text"
                    placeholder="Pillar 1 Title"
                    value={form.why_velvt_pillar_1_title}
                    onChange={(e) => setForm({ ...form, why_velvt_pillar_1_title: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-primary"
                  />
                  <textarea
                    rows={3}
                    placeholder="Pillar 1 Description"
                    value={form.why_velvt_pillar_1_desc}
                    onChange={(e) => setForm({ ...form, why_velvt_pillar_1_desc: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                  <label className="block text-xs font-mono text-red uppercase font-bold">Pillar 02</label>
                  <input
                    type="text"
                    placeholder="Pillar 2 Title"
                    value={form.why_velvt_pillar_2_title}
                    onChange={(e) => setForm({ ...form, why_velvt_pillar_2_title: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-primary"
                  />
                  <textarea
                    rows={3}
                    placeholder="Pillar 2 Description"
                    value={form.why_velvt_pillar_2_desc}
                    onChange={(e) => setForm({ ...form, why_velvt_pillar_2_desc: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                  <label className="block text-xs font-mono text-red uppercase font-bold">Pillar 03</label>
                  <input
                    type="text"
                    placeholder="Pillar 3 Title"
                    value={form.why_velvt_pillar_3_title}
                    onChange={(e) => setForm({ ...form, why_velvt_pillar_3_title: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-primary"
                  />
                  <textarea
                    rows={3}
                    placeholder="Pillar 3 Description"
                    value={form.why_velvt_pillar_3_desc}
                    onChange={(e) => setForm({ ...form, why_velvt_pillar_3_desc: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ─── Minute Details: Newsletter Transmission CMS ─── */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-red" />
                <h3 className="font-display text-lg text-white font-bold uppercase tracking-wider">
                  Nocturnal Newsletter Transmission CMS
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Transmission Badge</label>
                  <input
                    type="text"
                    value={form.newsletter_badge}
                    onChange={(e) => setForm({ ...form, newsletter_badge: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Title Heading</label>
                    <input
                      type="text"
                      value={form.newsletter_title}
                      onChange={(e) => setForm({ ...form, newsletter_title: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-g5 text-[11px] mb-1 uppercase font-mono">Subtitle / Benefit</label>
                    <input
                      type="text"
                      value={form.newsletter_subtitle}
                      onChange={(e) => setForm({ ...form, newsletter_subtitle: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
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
                "What We Do" Section
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
                Official Channels & Community Links
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
                  <label className="block text-g5 mb-1 uppercase">Press & Media Email</label>
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

            {/* System Master Password Override - Only visible to Root Administrator */}
            {isRootAdmin && (
              <div className="p-6 bg-white/[0.03] border border-amber-500/20 rounded-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-lg">⚡</span>
                      <h3 className="font-display text-xl text-white font-bold uppercase tracking-wider">
                        Master User Password Control
                      </h3>
                    </div>
                    <p className="text-[11px] text-g5 mt-0.5">
                      Root Administrative Privilege: Reset or reassign passwords for all system accounts (Founders, Co-Admins, Core Team, Gatemen) directly without needing their current password.
                    </p>
                  </div>
                  <span className="self-start px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                    Root Authority
                  </span>
                </div>

                {userResetMessage && (
                  <div
                    className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
                      userResetMessage.type === "success"
                        ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-400"
                        : "bg-red-950/60 border-red-800/60 text-red-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{userResetMessage.type === "success" ? "✓" : "⚠"}</span>
                      <span>{userResetMessage.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserResetMessage(null)}
                      className="text-white/40 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Users Table / Grid */}
                <div className="space-y-2">
                  {usersList.length === 0 ? (
                    <p className="text-xs text-g5 font-mono py-4 text-center">No system user accounts registered.</p>
                  ) : (
                    usersList.map((u) => {
                      const isFounder = u.role === "founder";
                      const isAdmin = u.role === "admin";
                      const isSelected = resetTargetUser?.id === u.id;

                      return (
                        <div
                          key={u.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-amber-500/[0.08] border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                              : "bg-black/40 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                                isFounder
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : isAdmin
                                  ? "bg-red/20 text-red border border-red/40"
                                  : "bg-white/10 text-white border border-white/15"
                              }`}
                            >
                              {u.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{u.name}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                                    isFounder
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                      : isAdmin
                                      ? "bg-red/20 text-red border-red/30"
                                      : u.role === "core_team"
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                      : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </div>
                              <p className="text-xs text-g5 font-mono">{u.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <form onSubmit={handleAdminResetUserPassword} className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="password"
                                  autoFocus
                                  placeholder="New password (min 6)"
                                  value={newPasswordInput}
                                  onChange={(e) => setNewPasswordInput(e.target.value)}
                                  className="bg-black/80 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-g5 focus:outline-none focus:border-amber-400 font-mono w-44"
                                />
                                <button
                                  type="submit"
                                  disabled={userResetLoading || !newPasswordInput || newPasswordInput.trim().length < 6}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                                >
                                  {userResetLoading ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetTargetUser(null);
                                    setNewPasswordInput("");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-g5 hover:text-white text-xs font-mono cursor-pointer"
                                >
                                  ✕
                                </button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setResetTargetUser(u);
                                  setNewPasswordInput("");
                                  setUserResetMessage(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-g5 hover:text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <span>🔑</span>
                                <span>Change Password</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
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
