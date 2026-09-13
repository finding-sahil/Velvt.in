"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePortfolioProfile, togglePortfolioSection } from "@/app/actions";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

interface Member {
  id: string;
  name: string;
  role: string;
  category: string;
  bio?: string | null;
  detailedBio?: string | null;
  portrait?: string | null;
  quote?: string | null;
  highlights?: string | null;
  responsibilities?: string | null;
  achievements?: string | null;
  skills?: string | null;
  timeline?: string | null;
  socialLinks?: string | null;
  portfolioUrl?: string | null;
  sectionVisibility?: string | null;
  joinedYear?: string | null;
  displayOrder: number;
  isPublished: boolean;
}

interface PortfolioManagerProps {
  members: Member[];
}

export function PortfolioManager({ members }: PortfolioManagerProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(
    members.find((m) => m.category.toLowerCase().includes("founder") || m.name.toLowerCase().includes("sahil"))?.id ||
    members[0]?.id || ""
  );

  const selectedMember = members.find((m) => m.id === selectedId);

  // Parse state from selected member
  const [activeTab, setActiveTab] = useState<"overview" | "responsibilities" | "achievements" | "skills" | "timeline" | "socials" | "visibility">("overview");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form states
  const [name, setName] = useState(selectedMember?.name || "");
  const [role, setRole] = useState(selectedMember?.role || "");
  const [category, setCategory] = useState(selectedMember?.category || "Founders");
  const [bio, setBio] = useState(selectedMember?.bio || "");
  const [detailedBio, setDetailedBio] = useState(selectedMember?.detailedBio || "");
  const [quote, setQuote] = useState(selectedMember?.quote || "");
  const [portrait, setPortrait] = useState(selectedMember?.portrait || "");
  const [joinedYear, setJoinedYear] = useState(selectedMember?.joinedYear || "");
  const [portfolioUrl, setPortfolioUrl] = useState(selectedMember?.portfolioUrl || "");

  // Parsed sub-lists
  const parseJsonSafe = (raw: string | null | undefined, fallback: any) => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const [responsibilities, setResponsibilities] = useState<string[]>(
    parseJsonSafe(selectedMember?.responsibilities, [
      "Executive Direction & Strategic Vision",
      "Nocturnal Experience & Creative Stage Architecture",
      "Curated Sound Design, Lighting & Atmosphere Engineering",
    ])
  );

  const [achievements, setAchievements] = useState<Array<{ year: string; title: string; metric?: string; description: string }>>(
    parseJsonSafe(selectedMember?.achievements, [
      { year: "2026", title: "Flagship Production", metric: "1,500+ Attendees", description: "Directed immersive experience." },
    ])
  );

  const [skills, setSkills] = useState<Array<{ name: string; category: string; level: string }>>(
    parseJsonSafe(selectedMember?.skills, [
      { name: "Creative Direction", category: "Production", level: "Expert" },
    ])
  );

  const [timeline, setTimeline] = useState<Array<{ year: string; title: string; organization: string; description: string }>>(
    parseJsonSafe(selectedMember?.timeline, [
      { year: "2026", title: "Executive Director", organization: "VELVT", description: "Directing productions." },
    ])
  );

  const [socials, setSocials] = useState<Record<string, string>>(
    parseJsonSafe(selectedMember?.socialLinks, {
      instagram: "https://www.instagram.com/finding.sahil/",
      linkedin: "",
      twitter: "",
      phone: "+91 93951 78940",
      email: "sahil@velvt.in",
    })
  );

  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    parseJsonSafe(selectedMember?.sectionVisibility, {
      showBio: true,
      showQuote: true,
      showRoles: true,
      showAchievements: true,
      showSkills: true,
      showTimeline: true,
      showSocials: true,
    })
  );

  // Sync state when selected member changes
  function handleSelectMember(id: string) {
    setSelectedId(id);
    const m = members.find((item) => item.id === id);
    if (!m) return;
    setName(m.name);
    setRole(m.role);
    setCategory(m.category);
    setBio(m.bio || "");
    setDetailedBio(m.detailedBio || "");
    setQuote(m.quote || "");
    setPortrait(m.portrait || "");
    setJoinedYear(m.joinedYear || "");
    setPortfolioUrl(m.portfolioUrl || "");
    setResponsibilities(parseJsonSafe(m.responsibilities, []));
    setAchievements(parseJsonSafe(m.achievements, []));
    setSkills(parseJsonSafe(m.skills, []));
    setTimeline(parseJsonSafe(m.timeline, []));
    setSocials(parseJsonSafe(m.socialLinks, {}));
    setVisibility(parseJsonSafe(m.sectionVisibility, {
      showBio: true,
      showQuote: true,
      showRoles: true,
      showAchievements: true,
      showSkills: true,
      showTimeline: true,
      showSocials: true,
    }));
  }

  // Portrait upload
  async function handlePortraitUpload(file: File) {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("purpose", "team-portrait");
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.success && json.url) {
        setPortrait(json.url);
        setToast({ message: "Portrait uploaded successfully", type: "success" });
      } else {
        setToast({ message: json.error || "Failed to upload portrait", type: "error" });
      }
    } catch (e: any) {
      setToast({ message: "Upload error: " + e.message, type: "error" });
    } finally {
      setUploading(false);
    }
  }

  // Save all portfolio data
  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("id", selectedId);
      fd.append("name", name);
      fd.append("role", role);
      fd.append("category", category);
      fd.append("bio", bio);
      fd.append("detailedBio", detailedBio);
      fd.append("quote", quote);
      fd.append("portrait", portrait);
      fd.append("joinedYear", joinedYear);
      fd.append("portfolioUrl", portfolioUrl);
      fd.append("responsibilities", JSON.stringify(responsibilities.filter((r) => r.trim())));
      fd.append("achievements", JSON.stringify(achievements.filter((a) => a.title.trim())));
      fd.append("skills", JSON.stringify(skills.filter((s) => s.name.trim())));
      fd.append("timeline", JSON.stringify(timeline.filter((t) => t.title.trim())));
      fd.append("socialLinks", JSON.stringify(socials));
      fd.append("sectionVisibility", JSON.stringify(visibility));

      const res = await updatePortfolioProfile(fd);
      if (res.success) {
        setToast({ message: "Portfolio successfully saved and published!", type: "success" });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to save portfolio", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Error saving: " + err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  // Instant Section Toggle
  async function handleToggleSection(key: string, label: string) {
    if (!selectedId) return;
    const currentVal = visibility[key] !== false;
    const newVal = !currentVal;

    // Optimistic state update
    setVisibility((prev) => ({
      ...prev,
      [key]: newVal,
      ...(key === "showTimeline" ? { timeline: newVal } : {}),
    }));

    try {
      const res = await togglePortfolioSection(selectedId, key, newVal);
      if (res.success) {
        setToast({
          message: `"${label}" is now ${newVal ? "ON (Visible)" : "OFF (Hidden)"} on portfolio!`,
          type: "success",
        });
      } else {
        // Rollback
        setVisibility((prev) => ({
          ...prev,
          [key]: currentVal,
          ...(key === "showTimeline" ? { timeline: currentVal } : {}),
        }));
        setToast({ message: res.error || "Failed to update section visibility", type: "error" });
      }
    } catch (err: any) {
      // Rollback
      setVisibility((prev) => ({
        ...prev,
        [key]: currentVal,
        ...(key === "showTimeline" ? { timeline: currentVal } : {}),
      }));
      setToast({ message: "Error updating: " + err.message, type: "error" });
    }
  }

  function renderSectionToggleBanner(sectionKey: string, title: string, description: string) {
    const isVisible = visibility[sectionKey] !== false;
    return (
      <div className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isVisible
          ? "bg-white/[0.03] border-white/15"
          : "bg-black/90 border-red/40 shadow-[0_0_20px_rgba(200,16,46,0.15)]"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${
            isVisible
              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
              : "bg-red shadow-[0_0_8px_rgba(200,16,46,0.7)] animate-pulse"
          }`} />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                {title}
              </span>
              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                isVisible
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-red/15 text-red border-red/30"
              }`}>
                {isVisible ? "Active (Visible on Portfolio)" : "Hidden (Turned OFF)"}
              </span>
            </div>
            <p className="text-[11px] text-g5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Real Toggle Switch */}
        <div className="flex items-center gap-3 shrink-0">
          <ToggleSwitch
            checked={isVisible}
            onChange={() => handleToggleSection(sectionKey, title)}
            size="md"
            activeLabel="ON"
            inactiveLabel="OFF"
            ariaLabel={`Toggle ${title}`}
          />
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-8 border border-white/10 rounded-2xl bg-white/[0.02] text-center text-g5">
        No team members found. Create a team member first under Core Team management.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}

      {/* Profile Selector & Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono uppercase tracking-wider text-g5">Profile:</label>
          <select
            value={selectedId}
            onChange={(e) => handleSelectMember(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black border border-white/20 text-white font-display text-sm uppercase focus:border-red focus:outline-none"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.role} ({m.category})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/team/${selectedId}`}
            target="_blank"
            className="px-3.5 py-1.5 rounded-full border border-white/15 hover:border-red/40 bg-white/[0.04] text-xs font-mono text-g5 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Preview Live</span>
            <span>↗</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_var(--red-glow)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Portfolio</span>
                <span>✓</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-1 text-xs font-mono uppercase tracking-wider">
        {[
          { id: "overview", label: "Bio & Overview", visKey: "showBio" },
          { id: "responsibilities", label: "Roles & Responsibilities", visKey: "showRoles" },
          { id: "achievements", label: "Achievements", visKey: "showAchievements" },
          { id: "skills", label: "Skills & Domains", visKey: "showSkills" },
          { id: "timeline", label: "Production Timeline", visKey: "showTimeline" },
          { id: "socials", label: "Socials & Links", visKey: "showSocials" },
          { id: "visibility", label: "All Section Toggles", isControl: true },
        ].map((tab) => {
          const isTabActive = activeTab === tab.id;
          const isSectionOn = tab.visKey ? visibility[tab.visKey] !== false : null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isTabActive
                  ? "bg-white/[0.08] text-red font-bold border-b-2 border-red"
                  : "text-g5 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {isSectionOn !== null && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSectionOn ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-red/70 shadow-[0_0_6px_rgba(200,16,46,0.8)]"
                  }`}
                  title={isSectionOn ? "Section is Visible" : "Section is Hidden"}
                />
              )}
              <span>{tab.label}</span>
              {isSectionOn === false && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red/10 text-red border border-red/20 uppercase font-bold">
                  OFF
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Bio & Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="lg:col-span-4 space-y-4">
            <label className="text-xs font-mono uppercase tracking-wider text-g5 block">
              Portrait Photo
            </label>
            <div className="aspect-[3/4] rounded-2xl border border-white/15 overflow-hidden bg-black relative group flex flex-col items-center justify-center">
              {portrait ? (
                <img src={portrait} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-g5 font-mono text-xs">No portrait set</div>
              )}
            </div>
            <label className="w-full text-center py-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-red/20 hover:border-red/40 text-xs font-mono text-white cursor-pointer transition-all block">
              {uploading ? "Uploading..." : "Upload New Portrait"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePortraitUpload(f);
                }}
              />
            </label>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-display text-base uppercase focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                >
                  <option value="Founders">Founders</option>
                  <option value="Core Team">Core Team</option>
                  <option value="Creative & Design">Creative & Design</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing & Media">Marketing & Media</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                  Joined Year / Tenure
                </label>
                <input
                  type="text"
                  value={joinedYear}
                  placeholder="e.g. Founding Director, 2024"
                  onChange={(e) => setJoinedYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                />
              </div>
            </div>

            <div>
              {renderSectionToggleBanner(
                "showQuote",
                "Vision & Philosophy Quote",
                "The highlighted quote banner with personal vision on this member's profile."
              )}
              <div className="mt-3">
                <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                  Personal Philosophy / Quote
                </label>
                <input
                  type="text"
                  value={quote}
                  placeholder="e.g. It starts as a thought, ends as a memory."
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white italic text-sm focus:border-red focus:outline-none"
                />
              </div>
            </div>

            <div>
              {renderSectionToggleBanner(
                "showBio",
                "Executive Narrative Bio",
                "The overview bio and detailed personal story paragraphs on this member's profile."
              )}
              <div className="mt-3">
                <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                  Executive Bio (First-Person Voice)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="As the Founder & Executive Director at VELVT, I play a defining role in shaping..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                Detailed Narrative / Creative Journey
              </label>
              <textarea
                rows={4}
                value={detailedBio}
                onChange={(e) => setDetailedBio(e.target.value)}
                placeholder="My creative journey began with a singular conviction: nocturnal experiences in Northeast India deserved..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Responsibilities */}
      {activeTab === "responsibilities" && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-5">
          {renderSectionToggleBanner(
            "showRoles",
            "Core Responsibilities & Directorship",
            "Numbered cards detailing key operational roles, departments, and director tasks."
          )}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Key Roles &amp; Operational Responsibilities
            </h3>
            <button
              onClick={() => setResponsibilities([...responsibilities, ""])}
              className="px-3 py-1.5 rounded-full border border-red/40 bg-red/10 text-red text-xs font-mono hover:bg-red/20 transition-all cursor-pointer"
            >
              + Add Role
            </button>
          </div>

          <div className="space-y-3">
            {responsibilities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-mono text-red w-6">0{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const copy = [...responsibilities];
                    copy[idx] = e.target.value;
                    setResponsibilities(copy);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                  placeholder="e.g. Nocturnal Experience & Stage Architecture"
                />
                <button
                  onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                  className="text-g5 hover:text-red px-2 py-1 cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Achievements */}
      {activeTab === "achievements" && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-5">
          {renderSectionToggleBanner(
            "showAchievements",
            "Production Highlights & Milestones",
            "Major event milestones, metrics, attendee numbers, and flagship badges on this member's profile."
          )}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Major Milestones &amp; Key Achievements
            </h3>
            <button
              onClick={() => setAchievements([...achievements, { year: new Date().getFullYear().toString(), title: "", metric: "", description: "" }])}
              className="px-3 py-1.5 rounded-full border border-red/40 bg-red/10 text-red text-xs font-mono hover:bg-red/20 transition-all cursor-pointer"
            >
              + Add Milestone
            </button>
          </div>

          <div className="space-y-4">
            {achievements.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-red font-bold">Achievement #{idx + 1}</span>
                  <button
                    onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                    className="text-xs text-g5 hover:text-red cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-g5 block mb-1">Year</label>
                    <input
                      type="text"
                      value={item.year}
                      onChange={(e) => {
                        const copy = [...achievements];
                        copy[idx].year = e.target.value;
                        setAchievements(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                      placeholder="2026"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-g5 block mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const copy = [...achievements];
                        copy[idx].title = e.target.value;
                        setAchievements(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                      placeholder="VELVT CURSE 2.O"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-g5 block mb-1">Metric Badge</label>
                    <input
                      type="text"
                      value={item.metric || ""}
                      onChange={(e) => {
                        const copy = [...achievements];
                        copy[idx].metric = e.target.value;
                        setAchievements(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                      placeholder="e.g. Flagship 2026"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-g5 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...achievements];
                      copy[idx].description = e.target.value;
                      setAchievements(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                    placeholder="Brief description of the impact..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Skills & Domains */}
      {activeTab === "skills" && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-5">
          {renderSectionToggleBanner(
            "showSkills",
            "Specialties & Disciplines",
            "Domain tags, proficiency ratings (Mastery/Expert/Advanced), and technical craft specialties on this member's profile."
          )}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Creative &amp; Technical Domains
            </h3>
            <button
              onClick={() => setSkills([...skills, { name: "", category: "Production", level: "Expert" }])}
              className="px-3 py-1.5 rounded-full border border-red/40 bg-red/10 text-red text-xs font-mono hover:bg-red/20 transition-all cursor-pointer"
            >
              + Add Skill
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {skills.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-white/10 bg-black/40 flex items-center gap-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const copy = [...skills];
                    copy[idx].name = e.target.value;
                    setSkills(copy);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs font-mono"
                  placeholder="Skill Name (e.g. Stage Architecture)"
                />
                <select
                  value={item.category}
                  onChange={(e) => {
                    const copy = [...skills];
                    copy[idx].category = e.target.value;
                    setSkills(copy);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-black border border-white/15 text-g5 text-xs font-mono"
                >
                  <option value="Production">Production</option>
                  <option value="Technical">Technical</option>
                  <option value="Operations">Operations</option>
                  <option value="Business">Business</option>
                  <option value="Leadership">Leadership</option>
                </select>
                <button
                  onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                  className="text-g5 hover:text-red cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Production Timeline */}
      {activeTab === "timeline" && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-5">
          {renderSectionToggleBanner(
            "showTimeline",
            "Production Timeline",
            "Chronological history of event roles, productions, and key creative positions on this member's profile."
          )}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Event Production Timeline &amp; Roles
            </h3>
            <button
              onClick={() => setTimeline([...timeline, { year: new Date().getFullYear().toString(), title: "", organization: "VELVT", description: "" }])}
              className="px-3 py-1.5 rounded-full border border-red/40 bg-red/10 text-red text-xs font-mono hover:bg-red/20 transition-all cursor-pointer"
            >
              + Add Timeline Event
            </button>
          </div>

          <div className="space-y-4">
            {timeline.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-red font-bold">Timeline #{idx + 1}</span>
                  <button
                    onClick={() => setTimeline(timeline.filter((_, i) => i !== idx))}
                    className="text-xs text-g5 hover:text-red cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-g5 block mb-1">Year / Period</label>
                    <input
                      type="text"
                      value={item.year}
                      onChange={(e) => {
                        const copy = [...timeline];
                        copy[idx].year = e.target.value;
                        setTimeline(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                      placeholder="2026"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-g5 block mb-1">Title / Role</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const copy = [...timeline];
                        copy[idx].title = e.target.value;
                        setTimeline(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                      placeholder="Executive Director"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-g5 block mb-1">Organization</label>
                    <input
                      type="text"
                      value={item.organization}
                      onChange={(e) => {
                        const copy = [...timeline];
                        copy[idx].organization = e.target.value;
                        setTimeline(copy);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                      placeholder="VELVT"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-g5 block mb-1">Narrative Summary</label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...timeline];
                      copy[idx].description = e.target.value;
                      setTimeline(copy);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white text-xs"
                    placeholder="Summary of responsibilities and productions delivered..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Socials & Links */}
      {activeTab === "socials" && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-5">
          {renderSectionToggleBanner(
            "showSocials",
            "Social Channels & Contact Bar",
            "Instagram, LinkedIn, email, and phone contact buttons on the portrait card."
          )}
          <div className="pt-1">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              Digital Channels &amp; Links
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                Instagram URL / Handle
              </label>
              <input
                type="text"
                value={socials.instagram || ""}
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                placeholder="https://instagram.com/finding.sahil"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={socials.linkedin || ""}
                onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={socials.phone || ""}
                onChange={(e) => setSocials({ ...socials, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                placeholder="+91 93951 78940"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                Direct Contact Email
              </label>
              <input
                type="text"
                value={socials.email || ""}
                onChange={(e) => setSocials({ ...socials, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                placeholder="sahil@velvt.in"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-mono uppercase tracking-wider text-g5 block mb-1">
                Personal External Portfolio Link
              </label>
              <input
                type="text"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:border-red focus:outline-none"
                placeholder="https://sahilmazumder.com"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Visibility Controls */}
      {activeTab === "visibility" && (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">
                Public Portfolio Section Visibility
              </h3>
              <p className="text-xs text-g5 mt-1">
                Toggle which sections appear on this member’s public portfolio page (`/team/[id]` or `/portfolio`). Turn off any sections you do not want visible.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const allOn = {
                    showBio: true,
                    showQuote: true,
                    showRoles: true,
                    showAchievements: true,
                    showSkills: true,
                    showTimeline: true,
                    timeline: true,
                    showSocials: true,
                    showActions: true,
                    showOtherMembers: true,
                  };
                  setVisibility(allOn);
                  if (selectedId) {
                    const fd = new FormData();
                    fd.append("id", selectedId);
                    fd.append("sectionVisibility", JSON.stringify(allOn));
                    const res = await updatePortfolioProfile(fd);
                    if (res.success) {
                      setToast({ message: "All sections turned ON and saved!", type: "success" });
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer"
              >
                Turn All ON
              </button>
              <button
                type="button"
                onClick={async () => {
                  const allOff = {
                    showBio: false,
                    showQuote: false,
                    showRoles: false,
                    showAchievements: false,
                    showSkills: false,
                    showTimeline: false,
                    timeline: false,
                    showSocials: false,
                    showActions: false,
                    showOtherMembers: false,
                  };
                  setVisibility(allOff);
                  if (selectedId) {
                    const fd = new FormData();
                    fd.append("id", selectedId);
                    fd.append("sectionVisibility", JSON.stringify(allOff));
                    const res = await updatePortfolioProfile(fd);
                    if (res.success) {
                      setToast({ message: "All sections turned OFF and saved!", type: "success" });
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-red/10 hover:bg-red/20 border border-red/30 text-[11px] font-mono text-red transition-all cursor-pointer"
              >
                Turn All OFF
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {[
              {
                key: "showBio",
                label: "Executive Narrative Bio",
                desc: "The overview bio and detailed personal story paragraphs.",
              },
              {
                key: "showQuote",
                label: "Vision & Philosophy Quote",
                desc: "The highlighted quote banner with personal vision.",
              },
              {
                key: "showRoles",
                label: "Operational Roles & Responsibilities",
                desc: "Numbered cards detailing key operational domains and director tasks.",
              },
              {
                key: "showAchievements",
                label: "Achievements & Milestones",
                desc: "Production highlight cards with metrics and flagship tags.",
              },
              {
                key: "showSkills",
                label: "Specialties & Disciplines",
                desc: "Interactive chips displaying domains and proficiency levels.",
              },
              {
                key: "showTimeline",
                label: "Production Timeline",
                desc: "Chronological milestone timeline of productions and roles.",
              },
              {
                key: "showSocials",
                label: "Social & Contact Bar",
                desc: "Instagram, LinkedIn, and direct contact buttons on portrait.",
              },
              {
                key: "showActions",
                label: "Action CTA Buttons",
                desc: "Bottom CTA row (Connect on Instagram, Join Crew, Sponsor).",
              },
              {
                key: "showOtherMembers",
                label: "Other Core Members Grid",
                desc: "Bottom showcase recommending other team members.",
              },
            ].map((sec) => {
              const isVisible = visibility[sec.key] !== false;
              return (
                <div
                  key={sec.key}
                  onClick={() => handleToggleSection(sec.key, sec.label)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isVisible
                      ? "bg-white/[0.03] border-white/15 hover:border-emerald-500/40"
                      : "bg-black/60 border-red/20 opacity-60 hover:opacity-100 hover:border-red/40"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isVisible ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-red shadow-[0_0_8px_rgba(200,16,46,0.6)]"
                        }`}
                      />
                      <p className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                        {sec.label}
                      </p>
                    </div>
                    <p className="text-[11px] text-g5 font-sans leading-relaxed">
                      {sec.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                        isVisible ? "text-emerald-300" : "text-red"
                      }`}
                    >
                      {isVisible ? "Active" : "Hidden"}
                    </span>
                    <ToggleSwitch
                      checked={isVisible}
                      onChange={() => handleToggleSection(sec.key, sec.label)}
                      size="sm"
                      ariaLabel={`Toggle ${sec.label}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_25px_var(--red-glow)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Portfolio Changes ✓"}
        </button>
      </div>
    </div>
  );
}
