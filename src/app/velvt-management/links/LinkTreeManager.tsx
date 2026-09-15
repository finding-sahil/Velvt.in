"use client";

import { useState } from "react";
import Link from "next/link";
import type { LinkTreeConfig, LinkTreeLink } from "@/app/actions";
import {
  saveLinkTreeConfig,
  addLinkTreeLink,
  updateLinkTreeLink,
  deleteLinkTreeLink,
  reorderLinkTreeLinks,
} from "@/app/actions";
import {
  REAL_ICON_OPTIONS,
  RealLinkIcon,
  InstagramIcon,
  WhatsAppIcon,
  SpotifyIcon,
  YouTubeIcon,
  MailIcon,
  PhoneIcon,
} from "@/app/links/LinkTreeIcons";

interface LinkTreeManagerProps {
  initialConfig: LinkTreeConfig;
}

const EMOJI_PRESETS = ["ticket", "crown", "instagram", "whatsapp", "spotify", "youtube", "camera", "crew", "sponsor", "phone", "mail", "location", "lightning", "fire", "star", "link"];

const URL_PRESETS = [
  { label: "Flagship Event (Curse 2.O)", url: "/events/velvt-curse-2-0" },
  { label: "Book Passes / Tickets", url: "/tickets" },
  { label: "Sponsorship Deck & VIP", url: "/sponsors" },
  { label: "Volunteer / Crew Application", url: "/volunteers" },
  { label: "Production Gallery & Recaps", url: "/gallery" },
  { label: "Press & Editorial Kit", url: "/press" },
  { label: "Contact Production Desk", url: "/contact" },
  { label: "VIP WhatsApp Updates", url: "https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8" },
  { label: "Instagram Profile", url: "https://www.instagram.com/velvt.in" },
];

export function LinkTreeManager({ initialConfig }: LinkTreeManagerProps) {
  const [config, setConfig] = useState<LinkTreeConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"links" | "profile">("links");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Link Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkTreeLink | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDesktopBg, setIsUploadingDesktopBg] = useState(false);
  const [isUploadingMobileBg, setIsUploadingMobileBg] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  // Form State for Add/Edit
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    subtitle: "",
    badge: "",
    icon: "🎟️",
    category: "general",
    isFeatured: false,
    isActive: true,
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    title: config.title,
    bio: config.bio,
    avatarUrl: config.avatarUrl || "",
    desktopBackgroundUrl: config.desktopBackgroundUrl || "",
    mobileBackgroundUrl: config.mobileBackgroundUrl || "",
    backgroundDim: config.backgroundDim !== undefined ? config.backgroundDim : 70,
    verified: config.verified,
    location: config.location,
    instagram: config.socials.instagram || "",
    whatsapp: config.socials.whatsapp || "",
    email: config.socials.email || "",
    phone: config.socials.phone || "",
    youtube: config.socials.youtube || "",
    spotify: config.socials.spotify || "",
  });

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "linktree-logo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload logo");
      }

      setProfileForm((prev) => ({ ...prev, avatarUrl: data.url }));
      showToast("Link Tree logo uploaded successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to upload logo", "error");
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  }

  async function handleDesktopBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDesktopBg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "linktree-desktop-bg");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload desktop wallpaper");
      }

      setProfileForm((prev) => ({ ...prev, desktopBackgroundUrl: data.url }));
      showToast("Desktop wallpaper uploaded successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to upload desktop wallpaper", "error");
    } finally {
      setIsUploadingDesktopBg(false);
      e.target.value = "";
    }
  }

  async function handleMobileBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMobileBg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "linktree-mobile-bg");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload mobile wallpaper");
      }

      setProfileForm((prev) => ({ ...prev, mobileBackgroundUrl: data.url }));
      showToast("Mobile wallpaper uploaded successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to upload mobile wallpaper", "error");
    } finally {
      setIsUploadingMobileBg(false);
      e.target.value = "";
    }
  }

  function openAddModal() {
    setEditingLink(null);
    setLinkForm({
      title: "",
      url: "",
      subtitle: "",
      badge: "",
      icon: "🎟️",
      category: "general",
      isFeatured: false,
      isActive: true,
    });
    setIsAddModalOpen(true);
  }

  function openEditModal(link: LinkTreeLink) {
    setEditingLink(link);
    setLinkForm({
      title: link.title,
      url: link.url,
      subtitle: link.subtitle || "",
      badge: link.badge || "",
      icon: link.icon || "🔗",
      category: link.category || "general",
      isFeatured: !!link.isFeatured,
      isActive: link.isActive,
    });
    setIsAddModalOpen(true);
  }

  async function handleSaveLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkForm.title.trim() || !linkForm.url.trim()) {
      showToast("Title and URL are required", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (editingLink) {
        const res = await updateLinkTreeLink(editingLink.id, linkForm);
        if (res.success) {
          setConfig((prev) => ({
            ...prev,
            links: prev.links.map((l) => (l.id === editingLink.id ? { ...l, ...linkForm } : l)),
          }));
          showToast("Link updated successfully");
          setIsAddModalOpen(false);
        } else {
          showToast(res.error || "Failed to update link", "error");
        }
      } else {
        const res = await addLinkTreeLink(linkForm);
        if (res.success) {
          const newLink: LinkTreeLink = {
            ...linkForm,
            id: `link_${Date.now()}`,
            clicks: 0,
          };
          setConfig((prev) => ({
            ...prev,
            links: [newLink, ...prev.links],
          }));
          showToast("New link added to Link Tree");
          setIsAddModalOpen(false);
        } else {
          showToast(res.error || "Failed to add link", "error");
        }
      }
    } catch (err: any) {
      showToast(err?.message || "Operation failed", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteLink(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}" from your Link Tree?`)) return;

    setIsSaving(true);
    try {
      const res = await deleteLinkTreeLink(id);
      if (res.success) {
        setConfig((prev) => ({
          ...prev,
          links: prev.links.filter((l) => l.id !== id),
        }));
        showToast("Link removed from Link Tree");
      } else {
        showToast(res.error || "Failed to delete link", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to delete link", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(link: LinkTreeLink) {
    const updatedStatus = !link.isActive;
    setConfig((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === link.id ? { ...l, isActive: updatedStatus } : l)),
    }));

    const res = await updateLinkTreeLink(link.id, { isActive: updatedStatus });
    if (!res.success) {
      showToast("Failed to update status", "error");
    } else {
      showToast(updatedStatus ? "Link published to live tree" : "Link hidden from live tree");
    }
  }

  async function handleToggleFeatured(link: LinkTreeLink) {
    const updatedFeatured = !link.isFeatured;
    setConfig((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === link.id ? { ...l, isFeatured: updatedFeatured } : l)),
    }));

    const res = await updateLinkTreeLink(link.id, { isFeatured: updatedFeatured });
    if (!res.success) {
      showToast("Failed to update featured flag", "error");
    } else {
      showToast(updatedFeatured ? "Link highlighted with radiant glow" : "Link unhighlighted");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newLinks = [...config.links];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    setConfig((prev) => ({ ...prev, links: newLinks }));

    const ids = newLinks.map((l) => l.id);
    await reorderLinkTreeLinks(ids);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedConfig: LinkTreeConfig = {
        ...config,
        title: profileForm.title.trim() || "VELVT.in",
        bio: profileForm.bio.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
        desktopBackgroundUrl: profileForm.desktopBackgroundUrl.trim(),
        mobileBackgroundUrl: profileForm.mobileBackgroundUrl.trim(),
        backgroundDim: Number(profileForm.backgroundDim) || 70,
        verified: profileForm.verified,
        location: profileForm.location.trim(),
        socials: {
          instagram: profileForm.instagram.trim(),
          whatsapp: profileForm.whatsapp.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim(),
          youtube: profileForm.youtube.trim(),
          spotify: profileForm.spotify.trim(),
        },
      };

      const res = await saveLinkTreeConfig(updatedConfig);
      if (res.success) {
        setConfig(updatedConfig);
        showToast("Profile & appearance settings saved");
      } else {
        showToast(res.error || "Failed to save profile", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save profile", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function copyPublicLink() {
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://velvt.in"}/links`;
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(url);
      showToast("Public Link copied: " + url);
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl border text-xs font-mono font-medium uppercase tracking-wider shadow-2xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "bg-red-dim border-red-glow text-white shadow-[0_0_20px_rgba(200,16,46,0.3)]"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Top Banner & Quick Controls */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
            <h2 className="text-base font-display font-black text-white uppercase tracking-wider">
              Public Bio Link URL
            </h2>
          </div>
          <p className="text-xs font-mono text-muted">
            Share this URL on Instagram bio, TikTok, WhatsApp stories, and physical print posters:
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-xs text-primary">
            <span className="bg-black/60 px-3 py-1 rounded-lg border border-white/10 select-all">
              velvt.in/links
            </span>
            <button
              onClick={copyPublicLink}
              className="text-xs text-muted hover:text-white underline cursor-pointer"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <a
            href="/links"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-red/40 hover:bg-white/[0.08] text-xs font-mono text-white transition-all text-center flex items-center justify-center gap-1.5"
          >
            <span>Open Live Tree</span>
            <span>↗</span>
          </a>

          <button
            onClick={openAddModal}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(200,16,46,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ Add Link</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("links")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "links"
              ? "bg-white/[0.08] border border-white/20 text-white shadow-sm"
              : "text-muted hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          Links & Passes ({config.links.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white/[0.08] border border-white/20 text-white shadow-sm"
              : "text-muted hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          Profile & Socials
        </button>
      </div>

      {/* Main Grid: Management Controls + Live Phone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Management Area */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {activeTab === "links" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                    Link Tree Directory
                  </h3>
                  <p className="text-xs font-mono text-muted">
                    Order items using the arrows. Toggle visibility or highlight flagship events.
                  </p>
                </div>
                <span className="text-xs font-mono text-muted bg-white/[0.03] px-3 py-1 rounded-full border border-white/10">
                  {config.links.filter((l) => l.isActive).length} active •{" "}
                  {config.links.reduce((acc, l) => acc + (l.clicks || 0), 0)} total clicks
                </span>
              </div>

              {config.links.length === 0 ? (
                <div className="p-12 text-center border border-white/10 rounded-2xl bg-white/[0.02] space-y-4">
                  <p className="text-sm font-mono text-muted">No links created yet.</p>
                  <button
                    onClick={openAddModal}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-mono uppercase"
                  >
                    Add First Link
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.links.map((link, idx) => (
                    <div
                      key={link.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        link.isFeatured
                          ? "bg-red-dim/30 border-red-glow/60 shadow-[0_0_20px_rgba(200,16,46,0.15)] hover:scale-[1.01]"
                          : link.isActive
                          ? "bg-white/[0.03] border-white/10 hover:border-white/25 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(200,16,46,0.15)]"
                          : "bg-white/[0.01] border-white/5 opacity-60 hover:scale-[1.01]"
                      }`}
                    >
                      {/* Left info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Order arrows */}
                        <div className="flex flex-col gap-1 shrink-0 text-muted">
                          <button
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0}
                            className="w-6 h-6 rounded bg-white/[0.04] hover:bg-white/[0.1] hover:text-white flex items-center justify-center text-xs disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === config.links.length - 1}
                            className="w-6 h-6 rounded bg-white/[0.04] hover:bg-white/[0.1] hover:text-white flex items-center justify-center text-xs disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                          <RealLinkIcon icon={link.icon} title={link.title} url={link.url} className="w-5 h-5" />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-sm text-white uppercase tracking-tight line-clamp-1">
                              {link.title}
                            </span>
                            {link.badge && (
                              <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-primary/20 border border-primary/40 text-primary shrink-0">
                                {link.badge}
                              </span>
                            )}
                            {link.isFeatured && (
                              <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                                ★ Featured
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-mono text-muted flex-wrap">
                            <span className="truncate max-w-[200px] text-white/70">{link.url}</span>
                            <span>•</span>
                            <span className="text-muted/80">👁️ {link.clicks || 0} clicks</span>
                            {link.category && (
                              <>
                                <span>•</span>
                                <span className="uppercase text-muted/60">{link.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5 w-full sm:w-auto justify-end">
                        {/* Featured Toggle */}
                        <button
                          onClick={() => handleToggleFeatured(link)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                            link.isFeatured
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                              : "bg-white/[0.03] border-white/10 text-muted hover:text-white"
                          }`}
                          title="Toggle Highlight / Radiant Glow"
                        >
                          ★
                        </button>

                        {/* Active Toggle */}
                        <button
                          onClick={() => handleToggleActive(link)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                            link.isActive
                              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                              : "bg-white/[0.03] border-white/10 text-muted"
                          }`}
                          title="Toggle visibility on live tree"
                        >
                          {link.isActive ? "Active" : "Hidden"}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(link)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/30 text-xs font-mono text-white transition-all cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteLink(link.id, link.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-dim/40 border border-red-glow/40 hover:bg-primary text-xs font-mono text-white transition-all cursor-pointer"
                          title="Delete link"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                    Header Profile &amp; Bio
                  </h3>
                  <p className="text-xs font-mono text-muted">
                    Configure the top header, avatar, verified status, and identity of your link tree.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      Brand / Page Title
                    </label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      Location Tag
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="Silchar, Assam, India"
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                    Bio / Subtitle Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red resize-none"
                  />
                </div>

                {/* Logo / Avatar Editor with Upload */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider">
                    Link Tree Logo / Avatar
                  </label>

                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Live Logo Preview */}
                    <div className="w-16 h-16 rounded-full border border-red/50 p-0.5 bg-gradient-to-tr from-red-600 to-red-950 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(200,16,46,0.35)]">
                      {profileForm.avatarUrl ? (
                        <img
                          src={profileForm.avatarUrl}
                          alt="Logo Preview"
                          className="w-full h-full rounded-full object-cover bg-black"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-black text-sm">
                          V<span className="text-red">.</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="px-3 py-1.5 rounded-lg bg-red hover:bg-red/90 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                          <span>{isUploadingLogo ? "Uploading..." : "📁 Upload New Logo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploadingLogo}
                            className="hidden"
                          />
                        </label>

                        {profileForm.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setProfileForm((prev) => ({ ...prev, avatarUrl: "" }))}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-muted hover:text-white transition-all cursor-pointer"
                          >
                            Reset to Default
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={profileForm.avatarUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                        placeholder="Or enter public image URL (https://...)"
                        className="w-full px-3.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profileForm.verified}
                        onChange={(e) => setProfileForm({ ...profileForm, verified: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-black text-primary accent-primary"
                      />
                      <span className="text-xs font-mono text-white">
                        Show Official Verified Badge (✓)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Custom Wallpapers (Desktop & Mobile Separate) */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="font-display font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
                      <span>🎨</span>
                      <span>Link Tree Background Wallpapers</span>
                    </h3>
                    <p className="text-xs font-mono text-muted mt-0.5">
                      Set separate high-resolution backgrounds for Desktop and Mobile screens. A dim overlay ensures passes & links stay 100% visible.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* 1. Desktop Wallpaper */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <span>🖥️</span>
                          <span>Desktop Background (16:9)</span>
                        </span>
                        {profileForm.desktopBackgroundUrl && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">● Active</span>
                        )}
                      </div>

                      {/* Desktop Preview Box */}
                      <div className="aspect-video w-full rounded-xl bg-black border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
                        {profileForm.desktopBackgroundUrl ? (
                          <img
                            src={profileForm.desktopBackgroundUrl}
                            alt="Desktop Wallpaper Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-3 space-y-1">
                            <span className="text-xl">🌌</span>
                            <p className="text-[11px] font-mono text-muted">Default Gothic Velvet Gradient</p>
                          </div>
                        )}
                      </div>

                      {/* Desktop Upload Controls */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                            <span>{isUploadingDesktopBg ? "Uploading..." : "📁 Upload Desktop"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleDesktopBgUpload}
                              disabled={isUploadingDesktopBg}
                              className="hidden"
                            />
                          </label>

                          {profileForm.desktopBackgroundUrl && (
                            <button
                              type="button"
                              onClick={() => setProfileForm((prev) => ({ ...prev, desktopBackgroundUrl: "" }))}
                              className="px-2.5 py-1.5 rounded-lg bg-red/10 border border-red/20 text-red hover:bg-red/20 text-xs font-mono transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={profileForm.desktopBackgroundUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, desktopBackgroundUrl: e.target.value })}
                          placeholder="Or enter desktop image URL (https://...)"
                          className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red"
                        />
                      </div>
                    </div>

                    {/* 2. Mobile Wallpaper */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <span>📱</span>
                          <span>Mobile Background (9:16)</span>
                        </span>
                        {profileForm.mobileBackgroundUrl && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">● Active</span>
                        )}
                      </div>

                      {/* Mobile Preview Box */}
                      <div className="aspect-video w-full rounded-xl bg-black border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
                        {profileForm.mobileBackgroundUrl ? (
                          <img
                            src={profileForm.mobileBackgroundUrl}
                            alt="Mobile Wallpaper Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-3 space-y-1">
                            <span className="text-xl">📱</span>
                            <p className="text-[11px] font-mono text-muted">Default Gothic Velvet Gradient</p>
                          </div>
                        )}
                      </div>

                      {/* Mobile Upload Controls */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                            <span>{isUploadingMobileBg ? "Uploading..." : "📁 Upload Mobile"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMobileBgUpload}
                              disabled={isUploadingMobileBg}
                              className="hidden"
                            />
                          </label>

                          {profileForm.mobileBackgroundUrl && (
                            <button
                              type="button"
                              onClick={() => setProfileForm((prev) => ({ ...prev, mobileBackgroundUrl: "" }))}
                              className="px-2.5 py-1.5 rounded-lg bg-red/10 border border-red/20 text-red hover:bg-red/20 text-xs font-mono transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={profileForm.mobileBackgroundUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, mobileBackgroundUrl: e.target.value })}
                          placeholder="Or enter mobile image URL (https://...)"
                          className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Wallpaper Contrast / Dim Slider */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold uppercase tracking-wider">
                        Wallpaper Dimming Level: {profileForm.backgroundDim ?? 70}%
                      </span>
                      <span className="text-muted text-[11px]">Recommended: 60% – 85%</span>
                    </div>

                    <input
                      type="range"
                      min={20}
                      max={95}
                      step={5}
                      value={profileForm.backgroundDim ?? 70}
                      onChange={(e) => setProfileForm({ ...profileForm, backgroundDim: parseInt(e.target.value, 10) })}
                      className="w-full accent-red cursor-pointer"
                    />

                    <p className="text-[11px] font-mono text-muted">
                      Controls the dark overlay on top of your wallpapers. Higher values increase darkness so passes, badges, and link text remain crystal clear.
                    </p>
                  </div>
                </div>
              </div>

              {/* Socials Block */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                    Header Social Icons
                  </h3>
                  <p className="text-xs font-mono text-muted">
                    Quick-access buttons rendered below the bio in the header.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={profileForm.instagram}
                      onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                      placeholder="https://www.instagram.com/velvt.in"
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      WhatsApp Community Link
                    </label>
                    <input
                      type="url"
                      value={profileForm.whatsapp}
                      onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="velvt.in@gmail.com"
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      Direct Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 93951 78940"
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      YouTube URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={profileForm.youtube}
                      onChange={(e) => setProfileForm({ ...profileForm, youtube: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                      Spotify Playlist (Optional)
                    </label>
                    <input
                      type="url"
                      value={profileForm.spotify}
                      onChange={(e) => setProfileForm({ ...profileForm, spotify: e.target.value })}
                      placeholder="https://open.spotify.com/..."
                      className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? "Saving..." : "Save Profile Settings"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right: Live Smartphone Simulator */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-white uppercase font-bold tracking-wider">
                  Live Preview
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-black/70 p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-red text-white font-bold shadow-sm"
                        : "text-muted hover:text-white"
                    }`}
                    title="Preview Mobile Wallpaper"
                  >
                    📱 Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-red text-white font-bold shadow-sm"
                        : "text-muted hover:text-white"
                    }`}
                    title="Preview Desktop Wallpaper"
                  >
                    🖥️ Desktop
                  </button>
                </div>
                <a
                  href="/links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-primary hover:underline"
                >
                  velvt.in/links ↗
                </a>
              </div>
            </div>

            {/* Mock iPhone Chassis */}
            <div className="w-full max-w-[340px] mx-auto rounded-[40px] border-4 border-zinc-800 bg-[#060205] p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center min-h-[580px] max-h-[640px]">
              {/* Simulated Wallpaper based on previewDevice */}
              {(() => {
                const activeWallpaper =
                  previewDevice === "mobile"
                    ? profileForm.mobileBackgroundUrl || config.mobileBackgroundUrl || profileForm.desktopBackgroundUrl || config.desktopBackgroundUrl
                    : profileForm.desktopBackgroundUrl || config.desktopBackgroundUrl || profileForm.mobileBackgroundUrl || config.mobileBackgroundUrl;

                if (!activeWallpaper) return null;

                return (
                  <>
                    <img
                      src={activeWallpaper}
                      alt="Simulator Wallpaper"
                      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-300"
                    />
                    <div
                      className="absolute inset-0 bg-[#060205] pointer-events-none"
                      style={{ opacity: (profileForm.backgroundDim ?? 70) / 100 }}
                    />
                  </>
                );
              })()}

              {/* Dynamic Island Notch */}
              <div className="w-24 h-4 rounded-full bg-zinc-900 border border-white/10 mb-4 shrink-0 z-10" />

              {/* Scrollable preview content */}
              <div className="w-full overflow-y-auto space-y-4 pr-1 text-center scrollbar-thin scrollbar-thumb-zinc-800 z-10">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary to-red mx-auto flex items-center justify-center">
                  {config.avatarUrl ? (
                    <img
                      src={config.avatarUrl}
                      alt={config.title}
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-black text-sm">
                      V<span className="text-primary">.</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-display font-black text-sm text-white uppercase tracking-wider">
                      VELVT<span className="text-red">.in</span>
                    </span>
                    {config.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-red text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-muted leading-tight line-clamp-2 px-2 tracking-wider uppercase">
                    {config.bio || "Experience Architecture"}
                  </p>
                </div>

                {/* Socials bar */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {config.socials.instagram && <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />}
                  {config.socials.whatsapp && <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />}
                  {config.socials.spotify && <SpotifyIcon className="w-3.5 h-3.5 text-[#1DB954]" />}
                  {config.socials.youtube && <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />}
                  {config.socials.email && <MailIcon className="w-3.5 h-3.5 text-blue-400" />}
                  {config.socials.phone && <PhoneIcon className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                {/* Simulated Link Cards */}
                <div className="space-y-2 pt-1 text-left">
                  {config.links
                    .filter((l) => l.isActive)
                    .map((link) => (
                      <div
                        key={link.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                          link.isFeatured
                            ? "bg-red-dim/60 border-red-glow shadow-[0_0_12px_rgba(200,16,46,0.3)]"
                            : "bg-white/[0.04] border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                            <RealLinkIcon icon={link.icon} title={link.title} url={link.url} className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display font-bold text-[11px] text-white uppercase truncate">
                              {link.title}
                            </p>
                            {link.subtitle && (
                              <p className="text-[9px] font-mono text-muted truncate">
                                {link.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted shrink-0">→</span>
                      </div>
                    ))}
                </div>

                {/* Footer in phone */}
                <div className="pt-4 text-[9px] font-mono text-white/50 space-y-1">
                  <p>&copy; 2026 VELVT. All rights reserved.</p>
                  <p className="text-[8px] text-white/70">Created with ❤️ by Sahil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Link Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                {editingLink ? "Edit Link Item" : "Add Link Item"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-muted hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              {/* Real Vector Icon Selector */}
              <div>
                <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">
                  Select Real Icon Style
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1 bg-black/40 border border-white/10 rounded-xl">
                  {REAL_ICON_OPTIONS.map((opt) => {
                    const IconComp = opt.component;
                    const isSelected =
                      linkForm.icon === opt.id ||
                      (linkForm.icon === "🎟️" && opt.id === "ticket") ||
                      (linkForm.icon === "👑" && opt.id === "crown") ||
                      (linkForm.icon === "📷" && opt.id === "instagram") ||
                      (linkForm.icon === "💬" && opt.id === "whatsapp") ||
                      (linkForm.icon === "🎧" && opt.id === "spotify");
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setLinkForm({ ...linkForm, icon: opt.id })}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-red/20 border-red text-white shadow-[0_0_12px_rgba(200,16,46,0.4)] scale-105"
                            : "bg-white/[0.03] border-white/10 hover:border-white/30 text-white/70 hover:text-white"
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${opt.colorClass}`} />
                        <span className="text-[9px] font-mono truncate w-full text-center">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                  Link Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={linkForm.title}
                  onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                  placeholder="e.g. 🎟️ Book Passes — VELVT CURSE 2.O"
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                />
              </div>

              {/* Destination URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-muted uppercase tracking-wider">
                    Destination URL <span className="text-primary">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="/events/velvt-curse-2-0 or https://..."
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                />

                {/* URL Presets Dropdown */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-muted uppercase">Quick Fill:</span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {URL_PRESETS.slice(0, 5).map((preset) => (
                      <button
                        type="button"
                        key={preset.url}
                        onClick={() => setLinkForm({ ...linkForm, url: preset.url })}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/10 hover:border-red hover:text-white text-muted transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                  Subtitle / Subtext (Optional)
                </label>
                <input
                  type="text"
                  value={linkForm.subtitle}
                  onChange={(e) => setLinkForm({ ...linkForm, subtitle: e.target.value })}
                  placeholder="e.g. 1 November 2026 • Silchar • Limited Passes"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                />
              </div>

              {/* Badge & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                    Pill Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkForm.badge}
                    onChange={(e) => setLinkForm({ ...linkForm, badge: e.target.value })}
                    placeholder="HOT, NEW, VIP, OPEN"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={linkForm.category}
                    onChange={(e) => setLinkForm({ ...linkForm, category: e.target.value })}
                    placeholder="tickets, crew, social, media"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red"
                  />
                </div>
              </div>

              {/* Switches: Featured & Active */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      ★ Highlight As Featured
                    </span>
                    <span className="text-[10px] font-mono text-muted">
                      Adds a pulsating crimson border and radiant glow on the Link Tree
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={linkForm.isFeatured}
                    onChange={(e) => setLinkForm({ ...linkForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-black text-primary accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none pt-2 border-t border-white/5">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      ● Published &amp; Active
                    </span>
                    <span className="text-[10px] font-mono text-muted">
                      When unchecked, this link is hidden from public view
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={linkForm.isActive}
                    onChange={(e) => setLinkForm({ ...linkForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-black text-primary accent-primary"
                  />
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingLink ? "Save Changes" : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
