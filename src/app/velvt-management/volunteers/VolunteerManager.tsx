"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  approveVolunteer,
  revokeVolunteer,
  verifyVolunteer,
  updateVolunteerPhoto,
  updateVolunteerSocials,
  deleteVolunteer,
  createVolunteerDirect,
} from "@/app/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";
import DownloadQrButton from "@/components/ui/DownloadQrButton";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

export interface VolunteerItem {
  id: string;
  volunteerId: string | null;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  preferredRole: string;
  assignedRole: string | null;
  experience: string | null;
  socialLink: string | null;
  photo: string | null;
  status: string;
  appliedAt: Date | string;
  event: { id?: string; name: string; date?: Date | string | null };
}

export interface EventOption {
  id: string;
  name: string;
  date: Date | string | null;
  status?: string;
}

interface VolunteerManagerProps {
  volunteers: VolunteerItem[];
  events?: EventOption[];
}

const ROLE_PRESETS = [
  "Stage Operations & Backstage",
  "Crowd Control & Guest Safety",
  "Guest Services & VIP Hospitality",
  "Photography & Videography",
  "Sound & Audio Engineering",
  "Lighting & Visual FX",
  "Box Office, Entry & Ticketing",
  "Logistics & Artist Liaison",
  "General Crew & Production Runner",
];

export function VolunteerManager({ volunteers, events = [] }: VolunteerManagerProps) {
  const router = useRouter();
  const [volunteerList, setVolunteerList] = useState<VolunteerItem[]>(volunteers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Add Volunteer Modal State
  const defaultEvent = events.find((e) => e.status === "upcoming") || events[0];
  const defaultYear = defaultEvent?.date
    ? new Date(defaultEvent.date).getFullYear()
    : new Date().getFullYear();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addPhotoUploading, setAddPhotoUploading] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Kolkata",
    preferredRole: ROLE_PRESETS[0],
    assignedRole: ROLE_PRESETS[0],
    year: defaultYear,
    eventId: defaultEvent?.id || "",
    status: "verified",
    photo: "",
    socialLink: "",
    adminNotes: "",
  });

  // Edit Socials Modal State (replaces browser prompt popups)
  const [editingSocials, setEditingSocials] = useState<{
    id: string;
    fullName: string;
    instagram: string;
    linkedin: string;
    phone: string;
  } | null>(null);
  const [savingSocials, setSavingSocials] = useState(false);

  useEffect(() => {
    setVolunteerList(volunteers);
  }, [volunteers]);

  // Filtered Volunteers List
  const filteredVolunteers = useMemo(() => {
    return volunteerList.filter((v) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = v.fullName.toLowerCase().includes(q);
        const matchesEmail = v.email.toLowerCase().includes(q);
        const matchesPhone = v.phone.toLowerCase().includes(q);
        const matchesId = v.volunteerId?.toLowerCase().includes(q);
        const matchesRole = (v.assignedRole || v.preferredRole).toLowerCase().includes(q);
        const matchesEvent = v.event?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId && !matchesRole && !matchesEvent) {
          return false;
        }
      }

      // Year Filter
      if (filterYear !== "all") {
        const hasYearInId = v.volunteerId?.includes(`-${filterYear}-`);
        const appliedYear = new Date(v.appliedAt).getFullYear().toString();
        const eventYear = v.event?.date ? new Date(v.event.date).getFullYear().toString() : "";
        if (!hasYearInId && appliedYear !== filterYear && eventYear !== filterYear) {
          return false;
        }
      }

      // Status Filter
      if (filterStatus !== "all") {
        if (v.status !== filterStatus) return false;
      }

      return true;
    });
  }, [volunteerList, searchQuery, filterYear, filterStatus]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  async function handleDelete(id: string, name: string) {
    // Instant optimistic deletion from UI (0ms, no popups)
    const prevList = volunteerList;
    setVolunteerList((prev) => prev.filter((v) => v.id !== id));

    setToast({
      message: `Volunteer application for "${name}" deleted`,
      type: "success",
      actionLabel: "Undo",
      onAction: () => setVolunteerList(prevList),
    });

    try {
      const res = await deleteVolunteer(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to delete volunteer", type: "error" });
        setVolunteerList(prevList);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to delete volunteer", type: "error" });
      setVolunteerList(prevList);
    }
  }

  async function handleApprove(id: string, currentRole: string) {
    setLoadingId(id);
    // Instant optimistic status update (0ms, no browser prompt popup)
    setVolunteerList((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "approved", assignedRole: currentRole } : v
      )
    );
    setToast({ message: "Volunteer approved & Credential issued", type: "success" });

    try {
      const res = await approveVolunteer(id, currentRole);
      if (!res.success) {
        setToast({ message: res.error || "Failed to approve volunteer", type: "error" });
        setVolunteerList(volunteers);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to approve volunteer", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleVerify(id: string) {
    setLoadingId(id);
    // Instant optimistic update (0ms, no popups)
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "verified" } : v))
    );
    setToast({ message: "Volunteer marked as verified", type: "success" });

    try {
      const res = await verifyVolunteer(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to verify volunteer", type: "error" });
        setVolunteerList(volunteers);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to verify volunteer", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRevoke(id: string) {
    setLoadingId(id);
    // Instant optimistic update (0ms, no popups)
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "revoked" } : v))
    );
    setToast({ message: "Volunteer credential revoked", type: "info" });

    try {
      const res = await revokeVolunteer(id);
      if (!res.success) {
        setToast({ message: res.error || "Failed to revoke volunteer", type: "error" });
        setVolunteerList(volunteers);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to revoke volunteer", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setLoadingId(null);
    }
  }

  function openSocialsModal(vol: VolunteerItem) {
    let instagram = "";
    let linkedin = "";
    let phone = vol.phone || "";
    if (vol.socialLink) {
      try {
        const parsed = JSON.parse(vol.socialLink);
        instagram = parsed.instagram || "";
        linkedin = parsed.linkedin || "";
        if (parsed.phone) phone = parsed.phone;
      } catch {
        instagram = vol.socialLink;
      }
    }

    setEditingSocials({
      id: vol.id,
      fullName: vol.fullName,
      instagram,
      linkedin,
      phone,
    });
  }

  async function handleSaveSocials(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSocials) return;

    setSavingSocials(true);
    const soc: Record<string, string> = {};
    if (editingSocials.instagram.trim()) soc.instagram = editingSocials.instagram.trim();
    if (editingSocials.linkedin.trim()) soc.linkedin = editingSocials.linkedin.trim();
    if (editingSocials.phone.trim()) soc.phone = editingSocials.phone.trim();

    const jsonStr = JSON.stringify(soc);
    const targetId = editingSocials.id;

    // Instant optimistic update
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === targetId ? { ...v, socialLink: jsonStr, phone: editingSocials.phone } : v))
    );
    setToast({ message: "Social handles updated successfully", type: "success" });
    setEditingSocials(null);

    try {
      await updateVolunteerSocials(targetId, jsonStr);
      router.refresh();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update socials", type: "error" });
      setVolunteerList(volunteers);
    } finally {
      setSavingSocials(false);
    }
  }

  async function handlePhotoUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setVolunteerList((prev) =>
          prev.map((v) => (v.id === id ? { ...v, photo: data.url } : v))
        );
        await updateVolunteerPhoto(id, data.url);
        setToast({ message: "Badge photo uploaded successfully", type: "success" });
        router.refresh();
      } else {
        setToast({ message: data.error || "Failed to upload image", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Upload failed: " + err.message, type: "error" });
    } finally {
      setUploadingId(null);
    }
  }

  async function handleAddPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAddForm((prev) => ({ ...prev, photo: data.url }));
        setToast({ message: "Badge photo uploaded", type: "success" });
      } else {
        setToast({ message: data.error || "Failed to upload photo", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Upload error: " + err.message, type: "error" });
    } finally {
      setAddPhotoUploading(false);
    }
  }

  async function handleCreateVolunteer(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.email.trim() || !addForm.phone.trim()) {
      setToast({ message: "Please fill in Name, Email, and Phone number", type: "error" });
      return;
    }

    setAddLoading(true);

    try {
      const res = await createVolunteerDirect({
        fullName: addForm.fullName,
        email: addForm.email,
        phone: addForm.phone,
        city: addForm.city,
        preferredRole: addForm.preferredRole,
        assignedRole: addForm.assignedRole || addForm.preferredRole,
        year: Number(addForm.year),
        eventId: addForm.eventId,
        status: addForm.status,
        photo: addForm.photo || undefined,
        socialLink: addForm.socialLink ? JSON.stringify({ instagram: addForm.socialLink }) : undefined,
        adminNotes: addForm.adminNotes || undefined,
      });

      if (res.success && res.volunteer) {
        setShowAddModal(false);
        setVolunteerList((prev) => [res.volunteer as any, ...prev]);
        setToast({
          message: `Volunteer "${res.volunteer.fullName}" registered directly with ID ${res.volunteer.volunteerId || "created"}`,
          type: "success",
        });
        // Reset form
        setAddForm({
          fullName: "",
          email: "",
          phone: "",
          city: "Kolkata",
          preferredRole: ROLE_PRESETS[0],
          assignedRole: ROLE_PRESETS[0],
          year: defaultYear,
          eventId: defaultEvent?.id || "",
          status: "verified",
          photo: "",
          socialLink: "",
          adminNotes: "",
        });
        router.refresh();
      } else {
        setToast({ message: res.error || "Failed to register volunteer", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to register volunteer", type: "error" });
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Team &amp; Operations
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Volunteer Management
          </h1>
          <p className="text-xs text-g5 mt-1">
            Directly add team members, assign timelines, review submissions, and manage verified badge credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-mono text-g5 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/10">
            Total: <span className="text-white font-bold">{volunteerList.length}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl bg-primary text-white font-bold hover:bg-red-700 transition-all cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.35)] flex items-center gap-1.5"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Add Volunteer Directly</span>
          </button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, credential ID, email, role, or event..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
            >
              &times;
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Timelines / Years</option>
            <option value="2026">2026 (Current Timeline)</option>
            <option value="2025">2025 (Previous Year)</option>
            <option value="2024">2024 (Archive)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified (Official Pass)</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* ─── Volunteer Table / Empty State ─── */}
      {filteredVolunteers.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.02] p-12 text-center rounded-2xl space-y-3">
          <p className="font-display font-bold text-xl text-white uppercase">No Volunteer Records Found</p>
          <p className="text-xs text-g5">
            {volunteerList.length === 0
              ? "No volunteers registered yet. Click '+ Add Volunteer Directly' above to onboard your first crew member."
              : "No records match your active search or filters. Try resetting the search or filter options above."}
          </p>
          {volunteerList.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterYear("all");
                setFilterStatus("all");
              }}
              className="mt-2 text-xs font-mono text-primary underline underline-offset-4 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10 text-g5 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Credential ID</th>
                  <th className="py-3.5 px-4">Volunteer Details</th>
                  <th className="py-3.5 px-4">Contact (Private)</th>
                  <th className="py-3.5 px-4">Event &amp; Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredVolunteers.map((vol) => {
                  const isLoading = loadingId === vol.id;
                  const isUploading = uploadingId === vol.id;
                  const effectiveRole = vol.assignedRole || vol.preferredRole;

                  return (
                    <tr key={vol.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono">
                        {vol.volunteerId ? (
                          <span className="text-gold font-medium bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                            {vol.volunteerId}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 text-[11px] italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {vol.photo ? (
                            <img
                              src={vol.photo}
                              alt={vol.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center font-bold text-xs text-g5 shrink-0">
                              {vol.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white text-sm">{vol.fullName}</p>
                            <p className="text-g5 text-[11px] font-mono">
                              {vol.city}
                            </p>
                            {vol.socialLink && (
                              <span className="text-red/80 block text-[10px] font-mono mt-0.5">
                                🔗 Social profile attached
                              </span>
                            )}
                          </div>
                        </div>
                        {vol.experience && (
                          <p className="text-g5/80 text-[10px] mt-1.5 line-clamp-1 italic">
                            &ldquo;{vol.experience}&rdquo;
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] space-y-0.5">
                        <p className="text-g6">{vol.email}</p>
                        <p className="text-g5">{vol.phone}</p>
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <p className="text-white font-medium">{vol.event.name}</p>
                        <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-red bg-red-dim px-2 py-0.5 rounded-full border border-red-glow">
                          {effectiveRole}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={vol.status} />
                      </td>

                      <td className="py-4 px-4 font-mono text-g5 text-[11px]">
                        {formatDateShort(vol.appliedAt)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {/* Upload photo button */}
                          <label
                            className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.05] text-g6 border border-white/10 hover:border-red/40 hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1"
                            title={vol.photo ? "Change Badge Photo" : "Upload Badge Photo"}
                          >
                            <span>📷</span>
                            <span>{isUploading ? "..." : vol.photo ? "Photo ✓" : "+ Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(vol.id, e)}
                            />
                          </label>

                          {/* Edit socials button (clean modal, no browser prompt) */}
                          <button
                            onClick={() => openSocialsModal(vol)}
                            disabled={isLoading}
                            className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.05] text-g5 border border-white/10 hover:border-blue-400 hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1"
                            title="Edit Social Links & WhatsApp"
                          >
                            <span>🔗</span>
                            <span>Socials</span>
                          </button>

                          {vol.status === "pending" && (
                            <button
                              onClick={() => handleApprove(vol.id, effectiveRole)}
                              disabled={isLoading}
                              className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/60 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isLoading ? "..." : "Approve & ID"}
                            </button>
                          )}

                          {vol.status === "approved" && (
                            <button
                              onClick={() => handleVerify(vol.id)}
                              disabled={isLoading}
                              className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-red-dim text-white border border-red-glow hover:bg-red/30 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isLoading ? "..." : "Mark Verified"}
                            </button>
                          )}

                          {vol.status !== "revoked" && vol.status !== "pending" && (
                            <button
                              onClick={() => handleRevoke(vol.id)}
                              disabled={isLoading}
                              className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.05] text-g5 border border-white/10 hover:text-red hover:border-red/40 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isLoading ? "..." : "Revoke"}
                            </button>
                          )}

                          {(vol.volunteerId || vol.status === "approved" || vol.status === "verified") && (
                            <>
                              <a
                                href={`/verify/${encodeURIComponent(vol.volunteerId || vol.id)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.04] text-g5 border border-white/[0.08] hover:text-white transition-colors"
                              >
                                Badge &nearr;
                              </a>

                              <DownloadQrButton
                                data={`/verify/${encodeURIComponent(vol.volunteerId || vol.id)}`}
                                filename={`VELVT-Volunteer-${vol.volunteerId || vol.id}-Pass.png`}
                                title={vol.fullName || "VELVT VOLUNTEER"}
                                subtitle={`ID: ${vol.volunteerId || vol.id} • ${effectiveRole}`}
                                badgeText="OFFICIAL CREDENTIAL"
                                label="QR"
                                variant="pill"
                              />
                            </>
                          )}

                          {/* Instant Delete Button (no browser confirm popup) */}
                          <button
                            onClick={() => handleDelete(vol.id, vol.fullName)}
                            className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors cursor-pointer"
                            title="Permanently Delete Application"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADD VOLUNTEER DIRECT MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  Direct Admin Registry
                </span>
                <h2 className="font-display font-bold text-2xl text-white uppercase">
                  Add Volunteer / Crew Member
                </h2>
                <p className="text-xs text-g5 mt-0.5">
                  Directly onboard crew members and assign year, event timeline &amp; credential role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white text-xl p-1 font-mono transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateVolunteer} className="space-y-4 text-xs font-mono">
              {/* 1. Basic Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  1. Basic Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sen"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      placeholder="rahul@velvt.in"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={addForm.city}
                      onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                      placeholder="Kolkata"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Timeline & Event Assignment */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  2. Timeline &amp; Event Assignment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/10">
                  <div>
                    <label className="block text-white font-bold mb-1 uppercase text-[10px]">
                      Assign Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={addForm.year}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value, 10) || new Date().getFullYear();
                        setAddForm((prev) => ({ ...prev, year: yr }));
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Sets credential ID format (e.g. VEL-{addForm.year}-XXXXX)
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-1 uppercase text-[10px]">
                      Connect to Event (Dropdown) *
                    </label>
                    <select
                      value={addForm.eventId}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const ev = events.find((item) => item.id === selId);
                        setAddForm((prev) => ({
                          ...prev,
                          eventId: selId,
                          ...(ev?.date ? { year: new Date(ev.date).getFullYear() } : {}),
                        }));
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {events.length > 0 ? (
                        events.map((ev) => {
                          const yr = ev.date ? new Date(ev.date).getFullYear() : "";
                          const isCurrent = ev.status === "upcoming" || yr === new Date().getFullYear();
                          return (
                            <option key={ev.id} value={ev.id}>
                              {ev.name} {yr ? `(${yr})` : ""} {isCurrent ? "— [Current Timeline]" : "— [Previous Year]"}
                            </option>
                          );
                        })
                      ) : (
                        <option value="">Default Operations Event</option>
                      )}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Links volunteer badge to the event database
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Role & Credential Status */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  3. Role &amp; Credential Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Department / Role *
                    </label>
                    <select
                      value={addForm.preferredRole}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddForm((prev) => ({
                          ...prev,
                          preferredRole: val,
                          assignedRole: prev.assignedRole || val,
                        }));
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {ROLE_PRESETS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Assigned Title / Specialization
                    </label>
                    <input
                      type="text"
                      value={addForm.assignedRole}
                      onChange={(e) => setAddForm({ ...addForm, assignedRole: e.target.value })}
                      placeholder="e.g. Lead Sound Engineer"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Initial Status *
                    </label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="verified">Verified (Official Pass Live)</option>
                      <option value="approved">Approved (Pending Live Check-in)</option>
                      <option value="pending">Pending Application</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Photo & Social Links */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider font-bold">
                  4. Badge Photo &amp; Social Profile (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Badge ID Headshot Photo
                    </label>
                    <div className="flex items-center gap-3">
                      {addForm.photo ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0">
                          <img src={addForm.photo} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <label className="flex-1 px-3 py-2 border border-white/15 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-center cursor-pointer transition-colors">
                        <span className="text-[11px] text-white">
                          {addPhotoUploading
                            ? "Uploading photo..."
                            : addForm.photo
                            ? "Change Photo ✓"
                            : "+ Upload Badge Headshot"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAddPhotoUpload}
                          className="hidden"
                          disabled={addPhotoUploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-1 uppercase text-[10px]">
                      Instagram / Social Profile
                    </label>
                    <input
                      type="text"
                      value={addForm.socialLink}
                      onChange={(e) => setAddForm({ ...addForm, socialLink: e.target.value })}
                      placeholder="@username or profile URL"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Internal Admin Notes */}
              <div>
                <label className="block text-white/60 mb-1 uppercase text-[10px]">
                  Internal Admin Notes
                </label>
                <input
                  type="text"
                  value={addForm.adminNotes}
                  onChange={(e) => setAddForm({ ...addForm, adminNotes: e.target.value })}
                  placeholder="e.g. Added directly by Sahil for VIP backstage operations"
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                  className="px-4 py-2 text-xs rounded-lg bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(200,16,46,0.35)]"
                >
                  {addLoading ? "Registering..." : "Add Volunteer to Registry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT SOCIALS MODAL (Replaces browser prompt popups) ─── */}
      {editingSocials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0e11] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  Update Contact
                </span>
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  {editingSocials.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSocials(null)}
                className="text-white/40 hover:text-white text-xl p-1 font-mono transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSocials} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-white mb-1 uppercase text-[10px]">
                  Instagram Handle / Profile URL
                </label>
                <input
                  type="text"
                  value={editingSocials.instagram}
                  onChange={(e) =>
                    setEditingSocials({ ...editingSocials, instagram: e.target.value })
                  }
                  placeholder="@username or https://instagram.com/..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white mb-1 uppercase text-[10px]">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={editingSocials.linkedin}
                  onChange={(e) =>
                    setEditingSocials({ ...editingSocials, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white mb-1 uppercase text-[10px]">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={editingSocials.phone}
                  onChange={(e) =>
                    setEditingSocials({ ...editingSocials, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSocials(null)}
                  className="px-4 py-2 text-xs rounded-lg bg-white/[0.05] text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSocials}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-red-700 transition-all cursor-pointer shadow-[0_0_15px_rgba(200,16,46,0.3)]"
                >
                  {savingSocials ? "Saving..." : "Save Handles"}
                </button>
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
