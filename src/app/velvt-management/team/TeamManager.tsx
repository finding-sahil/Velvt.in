"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createTeamMember,
  updateTeamMember,
  toggleTeamMemberPublish,
  deleteTeamMember,
  assignTeamCredentials,
  removeTeamCredentials,
} from "@/app/actions";
import DownloadQrButton from "@/components/ui/DownloadQrButton";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

interface TeamManagerProps {
  members: any[];
  adminUsers?: any[];
  currentUserRole?: string;
}

export function TeamManager({ members, adminUsers = [], currentUserRole = "admin" }: TeamManagerProps) {
  const router = useRouter();
  const [teamList, setTeamList] = useState(members);
  const [userList, setUserList] = useState(adminUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [credentialsModalMember, setCredentialsModalMember] = useState<any | null>(null);
  const [credForm, setCredForm] = useState({ email: "", password: "", role: "core_team" });
  const [credLoading, setCredLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    setTeamList(members);
  }, [members]);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "Core Team",
    bio: "",
    portrait: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    phone: "",
    email: "",
    displayOrder: 0,
    isPublished: true,
  });

  async function handleFileUpload(file: File, isEdit: boolean) {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success && json.url) {
        if (isEdit) {
          setEditingMember((prev: any) => ({ ...prev, portrait: json.url }));
        } else {
          setFormData((prev) => ({ ...prev, portrait: json.url }));
        }
      } else {
        setToast({ message: json.error || "Failed to upload image", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Error uploading image: " + err.message, type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const socialLinksObj = {
      instagram: formData.instagram.trim(),
      linkedin: formData.linkedin.trim(),
      twitter: formData.twitter.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    };

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("role", formData.role);
    fd.append("category", formData.category);
    fd.append("bio", formData.bio);
    fd.append("portrait", formData.portrait);
    fd.append("socialLinks", JSON.stringify(socialLinksObj));
    fd.append("displayOrder", String(formData.displayOrder));
    fd.append("isPublished", String(formData.isPublished));

    const res = await createTeamMember(fd);
    setLoading(false);

    if (res.success) {
      setShowCreateModal(false);
      setFormData({
        name: "",
        role: "",
        category: "Core Team",
        bio: "",
        portrait: "",
        instagram: "",
        linkedin: "",
        twitter: "",
        phone: "",
        email: "",
        displayOrder: 0,
        isPublished: true,
      });
      setToast({ message: "Team member added successfully", type: "success" });
      router.refresh();
    } else {
      setToast({ message: res.error || "Failed to create team member", type: "error" });
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;
    setLoading(true);

    let socialObj = { instagram: "", linkedin: "", twitter: "", phone: "", email: "" };
    try {
      if (editingMember.socialLinks) {
        socialObj = typeof editingMember.socialLinks === "string"
          ? JSON.parse(editingMember.socialLinks)
          : editingMember.socialLinks;
      }
    } catch {}

    const fd = new FormData();
    fd.append("name", editingMember.name);
    fd.append("role", editingMember.role);
    fd.append("category", editingMember.category);
    fd.append("bio", editingMember.bio || "");
    fd.append("portrait", editingMember.portrait || "");
    fd.append("socialLinks", JSON.stringify(socialObj));
    fd.append("displayOrder", String(editingMember.displayOrder || 0));
    fd.append("isPublished", String(editingMember.isPublished));

    const res = await updateTeamMember(editingMember.id, fd);
    setLoading(false);

    if (res.success) {
      setEditingMember(null);
      setToast({ message: "Team member updated successfully", type: "success" });
      router.refresh();
    } else {
      setToast({ message: res.error || "Failed to update team member", type: "error" });
    }
  }

  async function handleTogglePublish(id: string, current: boolean) {
    // Instant optimistic toggle
    setTeamList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPublished: !current } : m))
    );
    setToast({
      message: !current ? "Team member published" : "Team member hidden",
      type: "success",
    });
    try {
      const res = await toggleTeamMemberPublish(id, !current);
      if (!res.success) {
        setToast({ message: res.error || "Failed to update team member status", type: "error" });
        setTeamList(members); // revert
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update team member status", type: "error" });
      setTeamList(members);
    }
  }

  async function handleDelete(id: string) {
    // Instant optimistic removal from UI (0ms, no popups)
    const prevList = teamList;
    setTeamList((prev) => prev.filter((m) => m.id !== id));

    setToast({
      message: "Team member deleted",
      type: "success",
      actionLabel: "Undo",
      onAction: () => {
        setTeamList(prevList);
      },
    });

    try {
      const res = await deleteTeamMember(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete team member", type: "error" });
        setTeamList(prevList); // revert on failure
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete team member", type: "error" });
      setTeamList(prevList);
    }
  }

  function parseSocials(raw: string | null) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function handleOpenCredentials(member: any) {
    const existingUser = userList.find((u) => u.teamMemberId === member.id);
    setCredentialsModalMember(member);
    setCredForm({
      email: existingUser?.email || `${member.name.toLowerCase().replace(/\s+/g, ".")}@velvt.in`,
      password: "",
      role: existingUser?.role || (member.category?.toLowerCase().includes("founder") ? "founder" : "core_team"),
    });
  }

  async function handleSaveCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!credentialsModalMember) return;
    setCredLoading(true);
    try {
      const res = await assignTeamCredentials({
        teamMemberId: credentialsModalMember.id,
        email: credForm.email,
        password: credForm.password,
        role: credForm.role as any,
      });

      if (res.success) {
        setToast({
          type: "success",
          message: `Login credentials configured for ${credentialsModalMember.name}!`,
        });
        setUserList((prev) => {
          const filtered = prev.filter((u) => u.teamMemberId !== credentialsModalMember.id);
          return [
            ...filtered,
            {
              teamMemberId: credentialsModalMember.id,
              email: credForm.email,
              role: credForm.role,
              name: credentialsModalMember.name,
              isActive: true,
            },
          ];
        });
        setCredentialsModalMember(null);
      } else {
        setToast({ type: "error", message: res.error || "Failed to assign credentials." });
      }
    } catch (err: any) {
      setToast({ type: "error", message: err?.message || "Failed to assign credentials." });
    } finally {
      setCredLoading(false);
    }
  }

  async function handleRevokeCredentials(teamMemberId: string) {
    if (!confirm("Are you sure you want to revoke staff login credentials for this member?")) return;
    setCredLoading(true);
    try {
      const res = await removeTeamCredentials(teamMemberId);
      if (res.success) {
        setToast({ type: "success", message: "Staff credentials revoked." });
        setUserList((prev) => prev.filter((u) => u.teamMemberId !== teamMemberId));
        setCredentialsModalMember(null);
      } else {
        setToast({ type: "error", message: res.error || "Failed to revoke credentials." });
      }
    } catch (err: any) {
      setToast({ type: "error", message: err?.message || "Failed to revoke credentials." });
    } finally {
      setCredLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Organization Leadership
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Core Team &amp; Personnel
          </h1>
          <p className="text-xs text-g5 mt-1">
            Manage founders, directors, experience designers, social links, contact numbers, and official portraits.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider rounded-full bg-red text-white font-bold hover:bg-red-700 transition-all cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.35)]"
        >
          + Add Core Team Member
        </button>
      </div>

      {/* Member List */}
      <div className="grid gap-4">
        {teamList.length === 0 ? (
          <div className="p-12 text-center border border-white/10 bg-white/[0.02] rounded-2xl font-mono text-xs text-g5">
            No team members added yet.
          </div>
        ) : (
          teamList.map((m) => {
            const socials = parseSocials(m.socialLinks);
            const existingUser = userList.find((u) => u.teamMemberId === m.id);

            return (
              <div
                key={m.id}
                className="p-5 border border-white/10 bg-white/[0.03] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  {m.portrait ? (
                    <img
                      src={m.portrait}
                      alt={m.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-display font-black text-lg text-white/40">
                      {m.name.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-white text-base font-display uppercase tracking-wide">
                        {m.name}
                      </span>
                      <span className="text-red font-semibold">({m.role})</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] text-g5">
                        {m.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          m.isPublished
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : "bg-red-950/40 text-red-400 border border-red-900/40"
                        }`}
                      >
                        {m.isPublished ? "Published" : "Draft / Hidden"}
                      </span>
                      {existingUser && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono flex items-center gap-1">
                          <span>🔑</span>
                          <span>Staff Login ({existingUser.role})</span>
                        </span>
                      )}
                    </div>
                    {m.bio && (
                      <p className="text-xs text-g5 max-w-xl line-clamp-1">
                        {m.bio}
                      </p>
                    )}
                    {/* Social links indicators */}
                    {socials && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-g5">
                        {socials.instagram && (
                          <a
                            href={socials.instagram.startsWith("http") ? socials.instagram : `https://instagram.com/${socials.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red hover:underline flex items-center gap-1"
                          >
                            <span>📷</span> Instagram
                          </a>
                        )}
                        {socials.linkedin && (
                          <a
                            href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>💼</span> LinkedIn
                          </a>
                        )}
                        {socials.twitter && (
                          <a
                            href={socials.twitter.startsWith("http") ? socials.twitter : `https://x.com/${socials.twitter.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-g6 hover:underline flex items-center gap-1"
                          >
                            <span>𝕏</span> Twitter
                          </a>
                        )}
                        {socials.phone && (
                          <a
                            href={`https://wa.me/${socials.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>💬</span> WhatsApp: {socials.phone}
                          </a>
                        )}
                        {socials.email && (
                          <a
                            href={`mailto:${socials.email}`}
                            className="text-g5 hover:underline flex items-center gap-1"
                          >
                            <span>✉️</span> {socials.email}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href={`/team/${m.id}`}
                    target="_blank"
                    className="px-3 py-1.5 text-xs font-mono rounded border border-white/10 text-g5 hover:text-white flex items-center gap-1 hover:border-red/40"
                  >
                    <span>Portfolio</span>
                    <span>&nearr;</span>
                  </Link>

                  {(currentUserRole === "admin" || currentUserRole === "founder") && (
                    <button
                      type="button"
                      onClick={() => handleOpenCredentials(m)}
                      className="px-3 py-1.5 text-xs font-mono rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔑</span>
                      <span>{existingUser ? "Credentials" : "Set Login"}</span>
                    </button>
                  )}

                  <DownloadQrButton
                    data={`/team#${encodeURIComponent(m.name.toLowerCase().replace(/\s+/g, "-"))}`}
                    filename={`VELVT-CoreTeam-${m.name.replace(/\s+/g, "_")}-Pass.png`}
                    title={m.name}
                    subtitle={`VELVT CORE TEAM • ${m.role}`}
                    badgeText="VELVT CORE TEAM"
                    label="Download QR"
                    variant="pill"
                  />
                  <button
                    onClick={() => handleTogglePublish(m.id, m.isPublished)}
                    className="px-3 py-1.5 text-xs font-mono rounded border border-white/10 text-g5 hover:text-white cursor-pointer"
                  >
                    {m.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => {
                      const soc = parseSocials(m.socialLinks) || {
                        instagram: "",
                        linkedin: "",
                        twitter: "",
                        phone: "",
                        email: "",
                      };
                      setEditingMember({
                        ...m,
                        socialLinks: soc,
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-mono rounded border border-white/10 bg-white/[0.04] text-white hover:bg-white/10 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="px-3 py-1.5 text-xs font-mono rounded border border-red/30 text-red hover:bg-red/10 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
                Add Team Member
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-g5 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-g5 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya Banerjee"
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lighting Designer"
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-red"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-red"
                  >
                    <option value="Founders">Founders</option>
                    <option value="Core Team">Core Team</option>
                    <option value="Creative & Design">Creative &amp; Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-g5 mb-1">Bio / Profile</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short creative bio..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-red"
                />
              </div>

              {/* Image Upload Option */}
              <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
                <label className="block text-white font-bold text-xs uppercase tracking-wider">
                  Portrait Image
                </label>
                <div className="flex items-center gap-3">
                  {formData.portrait && (
                    <img
                      src={formData.portrait}
                      alt="Preview"
                      className="w-14 h-14 rounded-lg object-cover border border-white/20 shadow-md"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white cursor-pointer transition-colors text-xs font-mono">
                      <span>📁</span> {uploading ? "Uploading..." : "Upload Photo from PC"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, false);
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={formData.portrait}
                      onChange={(e) => setFormData({ ...formData, portrait: e.target.value })}
                      placeholder="Or paste external image URL: https://..."
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-2.5">
                <label className="block text-white font-bold text-xs uppercase tracking-wider">
                  Social Links
                </label>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Instagram URL / Profile</label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Twitter / X URL</label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://x.com/username"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Phone / WhatsApp Number (e.g. +91 98765 43210)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@velvt.in"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-g5 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublished: e.target.checked })
                      }
                    />
                    Publish Immediately
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs rounded-full bg-white/[0.05] text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-red text-white hover:bg-red-700"
                >
                  {loading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
                Edit Team Member
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-g5 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-g5 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-g5 mb-1">Role</label>
                  <input
                    type="text"
                    required
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, role: e.target.value })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-g5 mb-1">Category</label>
                  <select
                    value={editingMember.category}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, category: e.target.value })
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Founders">Founders</option>
                    <option value="Core Team">Core Team</option>
                    <option value="Creative & Design">Creative &amp; Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-g5 mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editingMember.bio || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, bio: e.target.value })
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Portrait Image Upload */}
              <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
                <label className="block text-white font-bold text-xs uppercase tracking-wider">
                  Portrait Image
                </label>
                <div className="flex items-center gap-3">
                  {editingMember.portrait && (
                    <img
                      src={editingMember.portrait}
                      alt="Preview"
                      className="w-14 h-14 rounded-lg object-cover border border-white/20 shadow-md"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/15 border border-white/15 text-white cursor-pointer transition-colors text-xs font-mono">
                      <span>📁</span> {uploading ? "Uploading..." : "Upload New Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, true);
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingMember.portrait || ""}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, portrait: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-xl space-y-2.5">
                <label className="block text-white font-bold text-xs uppercase tracking-wider">
                  Social Media Links
                </label>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Instagram URL</label>
                  <input
                    type="url"
                    value={editingMember.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        socialLinks: {
                          ...editingMember.socialLinks,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/username"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={editingMember.socialLinks?.linkedin || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        socialLinks: {
                          ...editingMember.socialLinks,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Twitter / X</label>
                  <input
                    type="url"
                    value={editingMember.socialLinks?.twitter || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        socialLinks: {
                          ...editingMember.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://x.com/username"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Phone / WhatsApp Number (e.g. +91 98765 43210)</label>
                  <input
                    type="tel"
                    value={editingMember.socialLinks?.phone || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        socialLinks: {
                          ...editingMember.socialLinks,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-g5 text-[10px] mb-0.5">Email Address</label>
                  <input
                    type="email"
                    value={editingMember.socialLinks?.email || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        socialLinks: {
                          ...editingMember.socialLinks,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="name@velvt.in"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-g5 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingMember.displayOrder || 0}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        displayOrder: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={editingMember.isPublished}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          isPublished: e.target.checked,
                        })
                      }
                    />
                    Published
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs rounded-full bg-white/[0.05] text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-red text-white hover:bg-red-700"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Login Credentials Modal */}
      {credentialsModalMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <span>🔑</span> Staff Credentials
                </span>
                <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
                  {credentialsModalMember.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCredentialsModalMember(null)}
                className="text-g5 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-g5">
              Assign or update staff login credentials. Core Team members can view inquiries, manage volunteers, and curate their portfolio. Founders have full access.
            </p>

            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-g5 uppercase tracking-wider block">
                  Staff Email Address <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={credForm.email}
                  onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
                  placeholder="e.g. member@velvt.in"
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:border-red focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-g5 uppercase tracking-wider block">
                  Password <span className="text-red">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={credForm.password}
                  onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:border-red focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-g5 uppercase tracking-wider block">
                  Permission Role
                </label>
                <select
                  value={credForm.role}
                  onChange={(e) => setCredForm({ ...credForm, role: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:border-red focus:outline-none"
                >
                  <option value="core_team">Core Team (Volunteers + Inquiries + Portfolio)</option>
                  <option value="admin">Co-Admin (Events + Tickets + Content)</option>
                  <option value="founder">Founder (Full Unrestricted Freedom)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {userList.some((u) => u.teamMemberId === credentialsModalMember.id) ? (
                  <button
                    type="button"
                    disabled={credLoading}
                    onClick={() => handleRevokeCredentials(credentialsModalMember.id)}
                    className="px-3.5 py-2 text-xs font-mono text-red hover:bg-red/10 rounded-xl border border-red/30 cursor-pointer"
                  >
                    Revoke Access
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCredentialsModalMember(null)}
                    className="px-4 py-2 text-xs rounded-xl bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={credLoading}
                    className="px-5 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-red text-white hover:bg-red-700 shadow-[0_0_15px_var(--red-glow)] cursor-pointer"
                  >
                    {credLoading ? "Saving..." : "Save Credentials"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Overlay */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
