"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  updateSponsorInquiryStatus,
  deleteSponsorInquiry,
  updateSiteSettings,
  generateSponsorPass,
} from "@/app/actions";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";
import { formatDate } from "@/lib/utils";

interface SponsorInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string | null;
  sponsorshipInterest?: string | null;
  budgetRange?: string | null;
  collaborationType?: string | null;
  message: string;
  status: string;
  adminNotes?: string | null;
  createdAt: Date | string;
}

interface SponsorInquiryManagerProps {
  initialInquiries: SponsorInquiry[];
  initialDeckUrl: string;
}

export function SponsorInquiryManager({
  initialInquiries,
  initialDeckUrl,
}: SponsorInquiryManagerProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<SponsorInquiry[]>(initialInquiries);
  const [deckUrl, setDeckUrl] = useState(initialDeckUrl);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [uploadingDeck, setUploadingDeck] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesModalInquiry, setNotesModalInquiry] = useState<SponsorInquiry | null>(null);
  const [noteText, setNoteText] = useState("");

  // Sponsor Pass Modal State
  const [passModalInquiry, setPassModalInquiry] = useState<SponsorInquiry | null>(null);
  const [passData, setPassData] = useState<any | null>(null);
  const [passQrDataUrl, setPassQrDataUrl] = useState<string>("");
  const [generatingPass, setGeneratingPass] = useState(false);

  // Filter & Search
  const filtered = inquiries.filter((inq) => {
    if (filter !== "all" && inq.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inq.companyName.toLowerCase().includes(q) ||
        inq.contactPerson.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        (inq.sponsorshipInterest && inq.sponsorshipInterest.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export to CSV
  function handleExportCsv() {
    const headers = [
      "Company Name",
      "Contact Person",
      "Email",
      "Phone",
      "Interest",
      "Budget Range",
      "Status",
      "Submitted At",
      "Message",
      "Admin Notes",
    ];

    const rows = inquiries.map((i) => [
      `"${i.companyName.replace(/"/g, '""')}"`,
      `"${i.contactPerson.replace(/"/g, '""')}"`,
      `"${i.email}"`,
      `"${i.phone || ""}"`,
      `"${i.sponsorshipInterest || ""}"`,
      `"${i.budgetRange || ""}"`,
      `"${i.status}"`,
      `"${new Date(i.createdAt).toLocaleDateString()}"`,
      `"${i.message.replace(/"/g, '""')}"`,
      `"${(i.adminNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VELVT_Sponsor_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Update Status
  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    const res = await updateSponsorInquiryStatus(id, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
      setToast({ message: "Status updated successfully", type: "success" });
    } else {
      setToast({ message: res.error || "Failed to update status", type: "error" });
    }
  }

  // Save Admin Note
  async function handleSaveNote() {
    if (!notesModalInquiry) return;
    const res = await updateSponsorInquiryStatus(notesModalInquiry.id, notesModalInquiry.status, noteText);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === notesModalInquiry.id ? { ...i, adminNotes: noteText } : i))
      );
      setNotesModalInquiry(null);
      setToast({ message: "Admin note saved", type: "success" });
    } else {
      setToast({ message: res.error || "Failed to save note", type: "error" });
    }
  }

  // Generate and View VIP Sponsor Pass
  async function handleOpenPass(inq: SponsorInquiry) {
    setPassModalInquiry(inq);
    setGeneratingPass(true);
    setPassData(null);
    setPassQrDataUrl("");

    const res = await generateSponsorPass(inq.id);
    setGeneratingPass(false);
    if (res.success && res.pass) {
      setPassData(res.pass);
      try {
        const fullUrl = `${window.location.origin}${res.pass.verifyUrl}`;
        const dataUrl = await QRCode.toDataURL(fullUrl, {
          width: 300,
          margin: 1,
          color: { dark: "#050505", light: "#ffffff" },
        });
        setPassQrDataUrl(dataUrl);
      } catch (err) {
        console.error("QR gen error:", err);
      }
    } else {
      setToast({ message: res.error || "Failed to generate VIP sponsor pass", type: "error" });
    }
  }

  // Delete
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this sponsor inquiry?")) return;
    const res = await deleteSponsorInquiry(id);
    if (res.success) {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      setToast({ message: "Inquiry removed", type: "success" });
    } else {
      setToast({ message: res.error || "Failed to delete inquiry", type: "error" });
    }
  }

  // Deck Upload
  async function handleDeckUpload(file: File) {
    setUploadingDeck(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("purpose", "sponsorship-deck");
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.success && json.url) {
        setDeckUrl(json.url);
        // Save to site setting
        await updateSiteSettings({ sponsorship_deck_url: json.url });
        setToast({ message: "Sponsorship Deck PDF uploaded & live!", type: "success" });
        router.refresh();
      } else {
        setToast({ message: json.error || "Upload failed", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Error uploading deck: " + err.message, type: "error" });
    } finally {
      setUploadingDeck(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}

      {/* Top Banner: Sponsorship Deck PDF Management */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red" />
            <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
              Official Sponsorship Deck (PDF)
            </h3>
          </div>
          <p className="text-xs text-g5">
            {deckUrl ? "Deck is currently active and downloadable on the public /sponsors page." : "No PDF deck uploaded yet. Upload a deck for instant download by prospective sponsors."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {deckUrl && (
            <a
              href={deckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] text-xs font-mono text-white hover:border-red/40 transition-colors flex items-center gap-1.5"
            >
              <span>View Current Deck</span>
              <span>↗</span>
            </a>
          )}

          <label className="px-5 py-2 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_var(--red-glow)] transition-all cursor-pointer">
            {uploadingDeck ? "Uploading..." : "Upload New Deck (PDF)"}
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleDeckUpload(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono uppercase">
          {[
            { id: "all", label: "All" },
            { id: "new", label: "New" },
            { id: "in_discussion", label: "In Discussion" },
            { id: "confirmed", label: "Confirmed" },
            { id: "declined", label: "Declined" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                filter === f.id
                  ? "bg-red text-white font-bold"
                  : "bg-white/[0.04] text-g5 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, person, email..."
            className="px-4 py-1.5 rounded-full bg-black border border-white/15 text-white text-xs font-mono focus:border-red focus:outline-none w-full sm:w-64"
          />

          <button
            onClick={handleExportCsv}
            className="px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/10 text-xs font-mono text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Export CSV ↓
          </button>
        </div>
      </div>

      {/* Inquiries Table / Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/[0.02] text-g5 font-mono text-xs">
          No sponsor inquiries found matching current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => (
            <div
              key={inq.id}
              className="p-6 rounded-2xl border border-white/10 bg-black/40 hover:border-white/25 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                      {inq.companyName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                        inq.status === "new"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                          : inq.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : inq.status === "declined"
                          ? "bg-red/10 text-red border border-red/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {inq.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-g5">
                    Contact: {inq.contactPerson} • {inq.email} {inq.phone ? `• ${inq.phone}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPass(inq)}
                    className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono text-amber-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
                    title="Generate and view VIP Sponsor Entry Pass"
                  >
                    <span>🎟️</span>
                    <span>VIP Pass</span>
                  </button>

                  <select
                    value={inq.status}
                    disabled={updatingId === inq.id}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-mono text-white focus:border-red focus:outline-none cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="in_discussion">In Discussion</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                  </select>

                  <button
                    onClick={() => {
                      setNotesModalInquiry(inq);
                      setNoteText(inq.adminNotes || "");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/10 text-xs font-mono text-g5 hover:text-white cursor-pointer"
                    title="Add or edit notes"
                  >
                    {inq.adminNotes ? "📝 View Note" : "+ Note"}
                  </button>

                  <button
                    onClick={() => handleDelete(inq.id)}
                    className="px-3 py-1.5 rounded-lg border border-red/20 bg-red/5 hover:bg-red/20 text-xs font-mono text-red cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Inquiry Details Row */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-g5 block">Area of Interest:</span>
                  <span className="text-white font-semibold">{inq.sponsorshipInterest || "General Partnership"}</span>
                </div>
                <div>
                  <span className="text-g5 block">Budget Estimate:</span>
                  <span className="text-red font-semibold">{inq.budgetRange || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-g5 block">Received:</span>
                  <span className="text-g5">{formatDate(inq.createdAt)}</span>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-g6 leading-relaxed">
                <p className="font-mono text-[10px] text-g5 uppercase tracking-wider mb-1">Collaboration Proposal:</p>
                {inq.message}
              </div>

              {/* Admin Note if present */}
              {inq.adminNotes && (
                <div className="p-3 rounded-xl bg-red/[0.03] border border-red/20 text-xs font-mono text-white/90">
                  <span className="text-red font-bold mr-2">Internal Note:</span>
                  {inq.adminNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Notes Modal */}
      {notesModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-white/15 bg-[#0a0a0d] space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-lg uppercase text-white">
              Internal Notes — {notesModalInquiry.companyName}
            </h3>
            <p className="text-xs text-g5">
              These notes are strictly private to authorized VELVT administrators.
            </p>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Discussed title partnership; awaiting final pitch deck sign-off by Friday."
              className="w-full p-3 rounded-xl bg-black border border-white/15 text-white text-xs font-mono focus:border-red focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNotesModalInquiry(null)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs font-mono text-g5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-full bg-red hover:bg-red-glow text-white text-xs font-mono font-bold uppercase tracking-wider"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Sponsor Pass Modal */}
      {passModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-[#0a0a0e] space-y-6 shadow-[0_0_60px_rgba(245,158,11,0.2)] relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-display font-black text-lg uppercase tracking-wider text-amber-300">
                  VIP Sponsor Pass
                </h3>
              </div>
              <button
                onClick={() => setPassModalInquiry(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-g5 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {generatingPass ? (
              <div className="py-12 text-center space-y-3 font-mono text-xs text-g5">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Generating cryptographically signed pass...</p>
              </div>
            ) : passData ? (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h4 className="font-display font-bold text-xl text-white uppercase tracking-tight">
                    {passData.companyName}
                  </h4>
                  <p className="text-xs font-mono text-amber-300">
                    {passData.contactPerson} • {passData.tierName}
                  </p>
                  <div className="inline-block px-3 py-0.5 mt-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-400">
                    PASS ID: {passData.ticketNumber}
                  </div>
                </div>

                {passQrDataUrl && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-white rounded-2xl border-2 border-amber-500/30 shadow-lg">
                      <img src={passQrDataUrl} alt="Sponsor QR" className="w-48 h-48" />
                    </div>
                    <p className="text-[10px] font-mono text-g5 uppercase tracking-wider">
                      Gate Scanner Validated Token
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] font-mono text-g5 space-y-1">
                  <div className="flex justify-between">
                    <span>Venue Admission:</span>
                    <span className={passData.isCheckedIn ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      {passData.isCheckedIn ? "ADMITTED AT GATE" : "READY AT GATE"}
                    </span>
                  </div>
                  {passData.checkedInAt && (
                    <div className="flex justify-between">
                      <span>Admitted At:</span>
                      <span className="text-white">{new Date(passData.checkedInAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    href={passData.verifyUrl}
                    target="_blank"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    Open Live Pass &rarr;
                  </Link>
                  {passQrDataUrl && (
                    <a
                      href={passQrDataUrl}
                      download={`${passData.ticketNumber}-VIP-Pass.png`}
                      className="py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider text-center transition-colors"
                    >
                      Download QR
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-red">
                Unable to load pass details. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
