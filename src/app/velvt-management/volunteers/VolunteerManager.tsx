"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  approveVolunteer,
  revokeVolunteer,
  verifyVolunteer,
  updateVolunteerPhoto,
  updateVolunteerSocials,
  deleteVolunteer,
} from "@/app/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";
import DownloadQrButton from "@/components/ui/DownloadQrButton";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

interface VolunteerItem {
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
  event: { name: string };
}

interface VolunteerManagerProps {
  volunteers: VolunteerItem[];
}

export function VolunteerManager({ volunteers }: VolunteerManagerProps) {
  const router = useRouter();
  const [volunteerList, setVolunteerList] = useState<VolunteerItem[]>(volunteers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    setVolunteerList(volunteers);
  }, [volunteers]);

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
    const assignedRole = prompt(
      "Assign role / specialization (leave empty to keep applicant's preferred role):",
      currentRole
    );
    if (assignedRole === null) return;

    setLoadingId(id);
    // Optimistic status update
    setVolunteerList((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "approved", assignedRole: assignedRole.trim() || currentRole } : v
      )
    );
    setToast({ message: "Volunteer approved & Credential issued", type: "success" });

    try {
      const res = await approveVolunteer(id, assignedRole.trim() || undefined);
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
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "verified" } : v))
    );
    setToast({ message: "Volunteer marked as verified for live operations", type: "success" });

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

  async function handleEditSocials(id: string, currentSocialLink: string | null) {
    let currentInstagram = "";
    let currentLinkedin = "";
    let currentPhone = "";
    if (currentSocialLink) {
      try {
        const parsed = JSON.parse(currentSocialLink);
        currentInstagram = parsed.instagram || "";
        currentLinkedin = parsed.linkedin || "";
        currentPhone = parsed.phone || "";
      } catch {
        currentInstagram = currentSocialLink;
      }
    }

    const newInsta = prompt("Volunteer Instagram handle/URL:", currentInstagram);
    if (newInsta === null) return;
    const newLinkedin = prompt("Volunteer LinkedIn URL:", currentLinkedin);
    if (newLinkedin === null) return;
    const newPhone = prompt("Volunteer WhatsApp/Contact Number:", currentPhone);
    if (newPhone === null) return;

    const soc: Record<string, string> = {};
    if (newInsta.trim()) soc.instagram = newInsta.trim();
    if (newLinkedin.trim()) soc.linkedin = newLinkedin.trim();
    if (newPhone.trim()) soc.phone = newPhone.trim();

    const jsonStr = JSON.stringify(soc);
    setVolunteerList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, socialLink: jsonStr } : v))
    );

    try {
      await updateVolunteerSocials(id, jsonStr);
      setToast({ message: "Social handles updated successfully", type: "success" });
      router.refresh();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to update socials", type: "error" });
      setVolunteerList(volunteers);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Team &amp; Operations
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Volunteer Management
          </h1>
          <p className="text-xs text-g5 mt-1">
            Review submissions, assign roles, issue verified volunteer IDs, and manage team status.
          </p>
        </div>

        <div className="text-xs font-mono text-g5 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 self-start sm:self-auto">
          Total Registered: <span className="text-white font-bold">{volunteerList.length}</span>
        </div>
      </div>

      {volunteerList.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.02] p-12 text-center rounded-2xl space-y-3">
          <p className="font-display font-bold text-xl text-white uppercase">No Volunteer Applications</p>
          <p className="text-xs text-g5">
            Submissions from the public volunteer registration form will appear here for review.
          </p>
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
                  <th className="py-3.5 px-4">Applied</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {volunteerList.map((vol) => {
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
                              <a
                                href={vol.socialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red hover:underline block text-[10px] font-mono mt-0.5"
                              >
                                🔗 Social / Portfolio &nearr;
                              </a>
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

                          {/* Edit socials button */}
                          <button
                            onClick={() => handleEditSocials(vol.id, vol.socialLink)}
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
                              className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer"
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

                          {/* Instant Delete Button */}
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

      {/* Toast Notification Overlay */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
