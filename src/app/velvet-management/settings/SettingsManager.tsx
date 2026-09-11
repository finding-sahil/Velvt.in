"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "@/app/actions";
import { defaultPillars, ExperienceHighlightItem } from "@/app/sections/HalloweenExperienceSection";

interface SettingsManagerProps {
  settings: Record<string, string>;
  events: any[];
}

const EMOJI_PRESETS = ["🕯️", "🎭", "🔮", "🍸", "🦇", "🕷️", "💀", "🖤", "🍷", "✦", "◈", "🔊", "🩸", "⚡"];

export function SettingsManager({ settings, events }: SettingsManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"highlights" | "hero" | "story" | "socials" | "event_cta">("highlights");

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
    hero_sub: settings.hero_sub || "Thematic nightlife, immersive staging, and sensory productions in Kolkata.",
    hero_cta_primary: settings.hero_cta_primary || "Explore Curse 2.O",
    hero_cta_secondary: settings.hero_cta_secondary || "Book Passes",

    // Experience Highlights Section
    experience_highlights_title: settings.experience_highlights_title || "Experience Highlights.",
    experience_highlights_cta_label: settings.experience_highlights_cta_label || "Production Dossier",

    // Brand Intro Section
    brand_intro_title: settings.brand_intro_title || "Sensory Architecture.",
    brand_intro_headline: settings.brand_intro_headline || "We don't just organize events — we construct immersive nocturnal worlds.",
    brand_intro_body: settings.brand_intro_body || "From subterranean set design to synchronized lighting and acoustics, VELVT crafts experiences that linger long after the night ends.",
    brand_intro_badge: settings.brand_intro_badge || "Thematic Event Production • Kolkata",

    // Services Section
    services_title: settings.services_title || "What We Do.",
    services_subtitle: settings.services_subtitle || "The planning, design, and production craft behind every VELVT experience.",

    // Socials & Contacts
    contact_email: settings.contact_email || "contact@velvt.in",
    press_email: settings.press_email || "press@velvt.in",
    social_instagram: settings.social_instagram || "https://www.instagram.com/velvt.in",
    social_whatsapp: settings.social_whatsapp || "https://chat.whatsapp.com/invite/velvt-community",
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
      alert("You must keep at least 1 highlight card.");
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

    const res = await updateSiteSettings(payload);
    setLoading(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      router.refresh();
    } else {
      alert("Failed to update settings: " + (res.error || "Unknown error"));
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
          { id: "highlights", label: "✨ Experience Highlights", badge: `${highlights.length} cards` },
          { id: "hero", label: "⚡ Hero & Identity" },
          { id: "story", label: "🏛️ Story & Services" },
          { id: "socials", label: "💬 Socials & Contact" },
          { id: "event_cta", label: "🎃 Event Hub & CTA" },
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
                  placeholder="Thematic Event Production • Kolkata"
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
                  <label className="block text-g5 mb-1 uppercase">WhatsApp VIP Invite URL</label>
                  <input
                    type="url"
                    value={form.social_whatsapp}
                    onChange={(e) => setForm({ ...form, social_whatsapp: e.target.value })}
                    placeholder="https://chat.whatsapp.com/invite/..."
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
    </div>
  );
}
