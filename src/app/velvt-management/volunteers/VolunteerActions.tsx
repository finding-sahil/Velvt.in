"use client";

import { useState } from "react";
import {
  approveVolunteer,
  revokeVolunteer,
  verifyVolunteer,
  updateVolunteerPhoto,
  updateVolunteerSocials,
} from "@/app/actions";
import { useRouter } from "next/navigation";
import DownloadQrButton from "@/components/ui/DownloadQrButton";

interface VolunteerActionsProps {
  id: string;
  status: string;
  volunteerId?: string | null;
  fullName?: string;
  assignedRole?: string | null;
  currentPhoto?: string | null;
  currentSocialLink?: string | null;
}

export function VolunteerActions({
  id,
  status,
  volunteerId,
  fullName,
  assignedRole,
  currentPhoto,
  currentSocialLink,
}: VolunteerActionsProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleEditSocials() {
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

    setLoading(true);
    await updateVolunteerSocials(id, JSON.stringify(soc));
    setLoading(false);
    router.refresh();
  }

  async function handleApprove() {
    const assignedRole = prompt("Assign role / specialization (leave empty to keep applicant's preferred role):", "");
    if (assignedRole === null) return; // cancelled
    setLoading(true);
    await approveVolunteer(id, assignedRole.trim() || undefined);
    setLoading(false);
    router.refresh();
  }

  async function handleVerify() {
    if (!confirm("Mark this credential as officially verified for live event operations?")) return;
    setLoading(true);
    await verifyVolunteer(id);
    setLoading(false);
    router.refresh();
  }

  async function handleRevoke() {
    if (!confirm("Revoke this credential? The credential status will immediately show 'REVOKED' on public verification.")) return;
    setLoading(true);
    await revokeVolunteer(id);
    setLoading(false);
    router.refresh();
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        await updateVolunteerPhoto(id, data.url);
        router.refresh();
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {/* Upload photo button */}
      <label
        className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.05] text-g6 border border-white/10 hover:border-red/40 hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1"
        title={currentPhoto ? "Change Badge Photo" : "Upload Badge Photo"}
      >
        <span>📷</span>
        <span>{uploading ? "..." : currentPhoto ? "Photo ✓" : "+ Photo"}</span>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </label>

      {/* Edit socials button */}
      <button
        onClick={handleEditSocials}
        disabled={loading}
        className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.05] text-g5 border border-white/10 hover:border-blue-400 hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1"
        title="Edit Social Links & WhatsApp"
      >
        <span>🔗</span>
        <span>Socials</span>
      </button>

      {status === "pending" && (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "..." : "Approve & ID"}
        </button>
      )}

      {status === "approved" && (
        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-red-dim text-white border border-red-glow hover:bg-red/30 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "..." : "Mark Verified"}
        </button>
      )}

      {status !== "revoked" && status !== "pending" && (
        <button
          onClick={handleRevoke}
          disabled={loading}
          className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "..." : "Revoke"}
        </button>
      )}

      {(volunteerId || status === "approved" || status === "verified") && (
        <>
          <a
            href={`/verify/${encodeURIComponent(volunteerId || id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-white/[0.04] text-g5 border border-white/[0.08] hover:text-white transition-colors"
          >
            View Badge &nearr;
          </a>

          <DownloadQrButton
            data={`/verify/${encodeURIComponent(volunteerId || id)}`}
            filename={`VELVT-Volunteer-${volunteerId || id}-Pass.png`}
            title={fullName || "VELVT VOLUNTEER"}
            subtitle={`ID: ${volunteerId || id} • ${assignedRole || "Event Contributor"}`}
            badgeText="OFFICIAL CREDENTIAL"
            label="Download QR"
            variant="pill"
          />
        </>
      )}
    </div>
  );
}
