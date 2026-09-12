"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  generateIssuedTicket,
  toggleTicketCheckIn,
  deleteIssuedTicket,
  checkInIssuedTicket,
  refreshLegacyTicketQRCodes,
} from "@/app/actions";
import { adminPath } from "@/lib/admin-path";

interface IssuedTicketItem {
  id: string;
  ticketNumber: string;
  securityToken: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string | null;
  tierName: string;
  priceInPaise: number;
  status: string;
  isCheckedIn: boolean;
  checkedInAt: Date | string | null;
  checkedInBy: string | null;
  notes: string | null;
  qrCodeDataUrl: string | null;
  createdAt: Date | string;
  event: {
    id: string;
    name: string;
    slug: string;
    date: Date | string;
    time: string | null;
    status: string;
  };
  ticketType?: {
    id: string;
    name: string;
    priceInPaise: number;
  } | null;
}

interface EventOption {
  id: string;
  name: string;
  slug: string;
  date: Date | string;
  status: string;
  isFeatured: boolean;
  ticketTypes: {
    id: string;
    name: string;
    priceInPaise: number;
  }[];
}

interface TicketManagerProps {
  initialTickets: IssuedTicketItem[];
  events: EventOption[];
}

export function TicketManager({ initialTickets, events }: TicketManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "checked_in" | "pending">("all");
  const [eventFilter, setEventFilter] = useState<string>("all");

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<IssuedTicketItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Verification Lookup
  const [quickLookupCode, setQuickLookupCode] = useState("");
  const [quickLookupResult, setQuickLookupResult] = useState<{
    success: boolean;
    status?: string;
    message?: string;
  } | null>(null);

  // New Ticket Form State
  const defaultEventId = events.find((e) => e.isFeatured)?.id || events[0]?.id || "";
  const [formData, setFormData] = useState({
    attendeeName: "",
    attendeeEmail: "",
    attendeePhone: "",
    eventId: defaultEventId,
    tierName: "VIP Pass",
    priceInRupees: "0",
    notes: "",
  });

  // Calculate Metrics
  const totalCount = initialTickets.length;
  const checkedInCount = initialTickets.filter((t) => t.isCheckedIn).length;
  const pendingCount = totalCount - checkedInCount;
  const checkInRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  // Filtered Tickets
  const filteredTickets = initialTickets.filter((ticket) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      ticket.attendeeName.toLowerCase().includes(query) ||
      ticket.attendeeEmail.toLowerCase().includes(query) ||
      (ticket.attendeePhone && ticket.attendeePhone.includes(query)) ||
      ticket.ticketNumber.toLowerCase().includes(query) ||
      (ticket.notes && ticket.notes.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checked_in" && ticket.isCheckedIn) ||
      (statusFilter === "pending" && !ticket.isCheckedIn);

    const matchesEvent = eventFilter === "all" || ticket.event.id === eventFilter;

    return matchesQuery && matchesStatus && matchesEvent;
  });

  // Handle Form Submission
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const fd = new FormData();
    fd.append("attendeeName", formData.attendeeName);
    fd.append("attendeeEmail", formData.attendeeEmail);
    fd.append("attendeePhone", formData.attendeePhone);
    fd.append("eventId", formData.eventId);
    fd.append("tierName", formData.tierName);
    fd.append("priceInRupees", formData.priceInRupees || "0");
    fd.append("notes", formData.notes);

    startTransition(async () => {
      const res = await generateIssuedTicket(fd);
      if (res.success && res.ticket) {
        setIsGenerateModalOpen(false);
        // Reset form
        setFormData({
          attendeeName: "",
          attendeeEmail: "",
          attendeePhone: "",
          eventId: defaultEventId,
          tierName: "VIP Pass",
          priceInRupees: "0",
          notes: "",
        });
        setSelectedPass(res.ticket as any);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to issue ticket");
      }
    });
  };

  // Toggle Check In
  const handleToggleCheckIn = (ticket: IssuedTicketItem) => {
    startTransition(async () => {
      await toggleTicketCheckIn(ticket.id, ticket.isCheckedIn);
      router.refresh();
    });
  };

  // Delete Pass
  const handleDeleteTicket = (ticket: IssuedTicketItem) => {
    if (!confirm(`Are you sure you want to revoke pass ${ticket.ticketNumber} for ${ticket.attendeeName}?`)) {
      return;
    }
    startTransition(async () => {
      await deleteIssuedTicket(ticket.id);
      if (selectedPass?.id === ticket.id) {
        setSelectedPass(null);
      }
      router.refresh();
    });
  };

  // Quick lookup check-in
  const handleQuickLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLookupCode.trim()) return;

    startTransition(async () => {
      const res = await checkInIssuedTicket(quickLookupCode.trim(), "Admin Quick-Check");
      setQuickLookupResult(res);
      if (res.success) {
        setQuickLookupCode("");
        router.refresh();
      }
    });
  };

  // Export CSV for Gateman
  const handleExportCSV = () => {
    const headers = ["Ticket Number", "Attendee Name", "Email", "Phone", "Pass Tier", "Event", "Status", "Checked In Time", "Notes"];
    const rows = filteredTickets.map((t) => [
      `"${t.ticketNumber}"`,
      `"${t.attendeeName.replace(/"/g, '""')}"`,
      `"${t.attendeeEmail}"`,
      `"${t.attendeePhone || ""}"`,
      `"${t.tierName}"`,
      `"${t.event.name.replace(/"/g, '""')}"`,
      `"${t.isCheckedIn ? "CHECKED IN" : "PENDING"}"`,
      `"${t.checkedInAt ? new Date(t.checkedInAt).toLocaleString("en-IN") : ""}"`,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VELVT_Gateman_Guestlist_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Sheet for Gateman
  const handlePrintGateSheet = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to open the printable sheet.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VELVT Door & Gate Check Sheet</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; }
          h1 { margin: 0 0 4px 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
          p { margin: 0 0 16px 0; font-size: 13px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-size: 12px; }
          th { background: #f4f4f4; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
          .box { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; }
          .checked { background: #000; }
          .status { font-weight: bold; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>VELVT &mdash; GATE CHECK-IN LIST</h1>
        <p>Generated: ${new Date().toLocaleString("en-IN")} | Total Passes: ${filteredTickets.length} | Admitted: ${checkedInCount} | Pending: ${pendingCount}</p>
        <button onclick="window.print()" style="margin-bottom: 16px; padding: 8px 16px; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px;">Print List</button>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">Entry</th>
              <th>Ticket #</th>
              <th>Attendee Name</th>
              <th>Phone</th>
              <th>Tier</th>
              <th>Event</th>
              <th>Status</th>
              <th>Notes / ID Check</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTickets
              .map(
                (t, idx) => `
              <tr>
                <td style="text-align: center;">
                  <div class="box ${t.isCheckedIn ? "checked" : ""}"></div>
                </td>
                <td style="font-family: monospace; font-weight: bold;">${t.ticketNumber}</td>
                <td><strong>${t.attendeeName}</strong></td>
                <td>${t.attendeePhone || "-"}</td>
                <td>${t.tierName}</td>
                <td>${t.event.name}</td>
                <td class="status">${t.isCheckedIn ? "ADMITTED" : "PENDING"}</td>
                <td>${t.notes || ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getVerificationUrl = (pass: IssuedTicketItem) => {
    if (typeof window !== "undefined" && !window.location.origin.includes("localhost")) {
      return `${window.location.origin}/verify/ticket/${pass.securityToken}`;
    }
    return `https://velvt.in/verify/ticket/${pass.securityToken}`;
  };

  const handleRefreshQRCodes = async () => {
    if (!window.confirm("Update all stored QR passes in database to production domain (https://velvt.in)?")) return;
    startTransition(async () => {
      const res = await refreshLegacyTicketQRCodes();
      if (res.success) {
        alert(`Successfully re-rendered ${res.count} QR codes to production!`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header & Action Controls ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-red uppercase">
              Internal Admin Tool &bull; Passes & Live Gate Operations
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl tracking-wider uppercase text-white">
            VIP Passes & Ticket Generator
          </h1>
          <p className="text-sm text-g5 mt-1">
            Issue unique scannable passes with QR codes, assign gate staff, and monitor real-time check-ins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={adminPath("/gate")}
            className="px-3.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Live Scanner</span>
          </Link>

          <Link
            href={adminPath("/gatemen")}
            className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono uppercase tracking-wider text-g3 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>Gatemen Staff</span>
          </Link>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-red text-white text-xs font-mono uppercase tracking-wider font-semibold shadow-[0_0_20px_rgba(200,16,46,0.35)] hover:bg-red-hover transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Generate Pass</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono uppercase tracking-wider text-g3 hover:text-white transition-all flex items-center gap-1.5"
            title="Download CSV for Gateman"
          >
            <svg className="w-4 h-4 text-g4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrintGateSheet}
            className="px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono uppercase tracking-wider text-g3 hover:text-white transition-all flex items-center gap-1.5"
            title="Print Physical Gate Check Sheet"
          >
            <svg className="w-4 h-4 text-g4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </button>

          <button
            onClick={handleRefreshQRCodes}
            disabled={isPending}
            className="px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono uppercase tracking-wider text-g4 hover:text-white transition-all"
            title="Sync all stored QR codes to production URL (https://velvt.in)"
          >
            🔄 Sync QR Links
          </button>
        </div>
      </div>

      {/* ── Key Metrics Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-g5">Total Passes Issued</span>
          <div className="font-heading text-2xl lg:text-3xl text-white mt-1">{totalCount}</div>
          <span className="text-[11px] font-mono text-g5">Active serial passes</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Admitted / Checked In</span>
          <div className="font-heading text-2xl lg:text-3xl text-emerald-400 mt-1">{checkedInCount}</div>
          <span className="text-[11px] font-mono text-emerald-500/70">{checkInRate}% gate admittance</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Pending Entry</span>
          <div className="font-heading text-2xl lg:text-3xl text-amber-300 mt-1">{pendingCount}</div>
          <span className="text-[11px] font-mono text-amber-500/70">Awaiting gate scan</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-g5">Quick Door Lookup</span>
          <form onSubmit={handleQuickLookup} className="mt-1.5 flex gap-1.5">
            <input
              type="text"
              placeholder="Scan or type VLT-..."
              value={quickLookupCode}
              onChange={(e) => setQuickLookupCode(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/[0.15] text-xs font-mono text-white placeholder-g6 focus:outline-none focus:border-red"
            />
            <button
              type="submit"
              disabled={isPending || !quickLookupCode.trim()}
              className="px-3 py-1.5 rounded bg-red text-white text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
            >
              Admit
            </button>
          </form>
          {quickLookupResult && (
            <div
              className={`mt-1.5 text-[10px] font-mono truncate ${
                quickLookupResult.success ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {quickLookupResult.message}
            </div>
          )}
        </div>
      </div>

      {/* ── Search & Filters Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
        <div className="relative flex-1 min-w-[220px]">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-g5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, phone, or VLT- serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-g6 focus:outline-none focus:border-red"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Status Filter */}
          <div className="flex items-center rounded-lg bg-black/40 border border-white/[0.1] p-1 text-xs font-mono">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded ${
                statusFilter === "all" ? "bg-white/[0.12] text-white font-bold" : "text-g5 hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded ${
                statusFilter === "pending" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-g5 hover:text-white"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("checked_in")}
              className={`px-3 py-1 rounded ${
                statusFilter === "checked_in" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-g5 hover:text-white"
              }`}
            >
              Admitted ({checkedInCount})
            </button>
          </div>

          {/* Event Filter */}
          {events.length > 1 && (
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-xs font-mono text-g3 focus:outline-none focus:border-red"
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Passes List Table ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-g5 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Serial / QR Pass</th>
                <th className="py-3 px-4">Attendee Details</th>
                <th className="py-3 px-4">Event & Tier</th>
                <th className="py-3 px-4">Door Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-g5 font-mono">
                    {searchQuery ? "No passes matched your search." : "No tickets generated yet. Click '+ Generate Pass' to issue the first pass!"}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Serial & QR */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2.5">
                        {ticket.qrCodeDataUrl ? (
                          <button
                            onClick={() => setSelectedPass(ticket)}
                            className="w-10 h-10 rounded border border-white/[0.15] bg-white p-0.5 overflow-hidden shrink-0 hover:scale-110 transition-transform cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                            title="Click to view full digital pass"
                          >
                            <img src={ticket.qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded bg-white/[0.05] flex items-center justify-center text-[10px] text-g6">
                            QR
                          </div>
                        )}
                        <div>
                          <button
                            onClick={() => setSelectedPass(ticket)}
                            className="font-bold text-white hover:text-red transition-colors text-left flex items-center gap-1"
                          >
                            <span>{ticket.ticketNumber}</span>
                            <svg className="w-3 h-3 text-g5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          <span className="text-[10px] text-g5 block">
                            Issued: {new Date(ticket.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Attendee */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white text-sm">{ticket.attendeeName}</div>
                      <div className="text-g4 font-mono text-[11px] truncate max-w-[200px]">{ticket.attendeeEmail}</div>
                      {ticket.attendeePhone && (
                        <div className="text-g5 font-mono text-[11px] flex items-center gap-1">
                          <span>{ticket.attendeePhone}</span>
                        </div>
                      )}
                    </td>

                    {/* Event & Tier */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-red-dim border border-red-glow text-white">
                        {ticket.tierName}
                      </span>
                      <div className="text-g4 text-[11px] mt-1 truncate max-w-[180px]">{ticket.event.name}</div>
                      <div className="text-g5 font-mono text-[10px]">
                        {ticket.priceInPaise === 0 ? "Complimentary / VIP" : `₹${(ticket.priceInPaise / 100).toLocaleString("en-IN")}`}
                      </div>
                    </td>

                    {/* Door Status */}
                    <td className="py-3.5 px-4 font-mono">
                      {ticket.isCheckedIn ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Admitted</span>
                          </span>
                          <span className="block text-[10px] text-emerald-500/70 mt-1">
                            {ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "Checked in"}
                            {ticket.checkedInBy ? ` &bull; ${ticket.checkedInBy}` : ""}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Pending Arrival</span>
                          </span>
                          <span className="block text-[10px] text-g5 mt-1">Not scanned yet</span>
                        </div>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-g4 text-[11px] italic max-w-[150px] truncate">
                      {ticket.notes || <span className="text-g6 not-italic font-mono">&mdash;</span>}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleCheckIn(ticket)}
                          disabled={isPending}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            ticket.isCheckedIn
                              ? "bg-white/[0.05] hover:bg-white/[0.1] text-g4 hover:text-white"
                              : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                          }`}
                          title={ticket.isCheckedIn ? "Undo check in" : "Manually check in"}
                        >
                          {ticket.isCheckedIn ? "Undo" : "Admit"}
                        </button>

                        <button
                          onClick={() => setSelectedPass(ticket)}
                          className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-g3 hover:text-white transition-colors"
                          title="View / Print Pass"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteTicket(ticket)}
                          disabled={isPending}
                          className="p-1.5 rounded bg-white/[0.04] hover:bg-red/20 text-g5 hover:text-red transition-colors"
                          title="Revoke / Delete Pass"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Generate New Ticket Pass ──────────────────────────────── */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e0e0e] border border-white/[0.15] shadow-2xl p-6 relative">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute top-4 right-4 text-g5 hover:text-white p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-mono tracking-widest text-red uppercase">Ticket Generator</span>
              <h2 className="font-heading text-xl uppercase tracking-wider text-white mt-1">
                Issue VIP Ticket / Door Pass
              </h2>
              <p className="text-xs text-g5 mt-0.5">
                Generates a unique serial number, secure verification token, and instant scannable QR code.
              </p>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-red/10 border border-red/30 text-red text-xs font-mono">
                {actionError}
              </div>
            )}

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              {/* Attendee Name */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                  Attendee Full Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Roy"
                  value={formData.attendeeName}
                  onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                />
              </div>

              {/* Attendee Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                    Email Address <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@example.com"
                    value={formData.attendeeEmail}
                    onChange={(e) => setFormData({ ...formData, attendeeEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.attendeePhone}
                    onChange={(e) => setFormData({ ...formData, attendeePhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                  />
                </div>
              </div>

              {/* Event & Pass Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                    Event <span className="text-red">*</span>
                  </label>
                  <select
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} {ev.isFeatured ? "(Featured)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                    Pass Tier / Type <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VIP Pass, All-Access, General..."
                    value={formData.tierName}
                    onChange={(e) => setFormData({ ...formData, tierName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                  />
                </div>
              </div>

              {/* Price & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                    Price in ₹ (0 for Complimentary)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formData.priceInRupees}
                    onChange={(e) => setFormData({ ...formData, priceInRupees: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                    Internal Note / Table / Gate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Table 4, Artist Guest"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono uppercase text-g4 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg bg-red text-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-red-hover transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(200,16,46,0.35)]"
                >
                  {isPending ? "Generating..." : "Generate Pass & QR Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Luxury Digital Pass Card Preview & Print ───────────────── */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0a0a0a] border border-white/[0.2] shadow-[0_0_50px_rgba(200,16,46,0.25)] p-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-red/15 blur-3xl pointer-events-none" />

            <button
              onClick={() => {
                setSelectedPass(null);
                setCopiedLink(false);
              }}
              className="absolute top-4 right-4 text-g5 hover:text-white p-1 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Pass Design Header */}
            <div className="relative text-center border-b border-white/[0.1] pb-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-red mb-1">
                Official VELVT Pass Permit
              </div>
              <h3 className="font-heading text-xl uppercase tracking-widest text-white">
                {selectedPass.event.name}
              </h3>
              <div className="text-xs text-g4 font-mono mt-0.5">
                {new Date(selectedPass.event.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Pass Body */}
            <div className="py-6 text-center space-y-4">
              {/* Pass Tier Badge */}
              <div>
                <span className="inline-block px-4 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-widest bg-red-dim border border-red-glow text-white shadow-[0_0_15px_rgba(200,16,46,0.4)]">
                  {selectedPass.tierName}
                </span>
              </div>

              {/* Attendee Name */}
              <div>
                <div className="text-[10px] font-mono uppercase text-g5 tracking-wider">Pass Holder</div>
                <div className="font-heading text-2xl text-white tracking-wider uppercase mt-0.5">
                  {selectedPass.attendeeName}
                </div>
                <div className="text-xs text-g4 font-mono">{selectedPass.attendeeEmail}</div>
                {selectedPass.attendeePhone && (
                  <div className="text-xs text-g5 font-mono">{selectedPass.attendeePhone}</div>
                )}
              </div>

              {/* Scannable QR Code */}
              <div className="flex flex-col items-center justify-center my-2">
                <div className="p-3 bg-white rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                  {selectedPass.qrCodeDataUrl ? (
                    <img
                      src={selectedPass.qrCodeDataUrl}
                      alt={`QR Code for ${selectedPass.ticketNumber}`}
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-black font-mono text-xs">
                      QR Generated
                    </div>
                  )}
                </div>
                <div className="mt-2.5 font-mono text-xs text-g4 tracking-wider">
                  Scan with any camera at the door
                </div>
              </div>

              {/* Serial & Security Token */}
              <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-center">
                <div className="text-[10px] text-g5 uppercase tracking-widest">Ticket Serial Number</div>
                <div className="text-base font-bold text-white tracking-widest mt-0.5">
                  {selectedPass.ticketNumber}
                </div>
                <div className="text-[10px] text-g6 truncate mt-1">
                  Hash: {selectedPass.securityToken.slice(0, 18)}...
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-xs font-mono">
                {selectedPass.isCheckedIn ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Admitted at {selectedPass.checkedInAt ? new Date(selectedPass.checkedInAt).toLocaleTimeString("en-IN") : "Door"}
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Valid &bull; Ready for Gate Scan
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-white/[0.1] pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getVerificationUrl(selectedPass));
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 3000);
                  }}
                  className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={`/verify/ticket/${selectedPass.securityToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Test Scan</span>
                </a>
              </div>

              {selectedPass.qrCodeDataUrl && (
                <a
                  href={selectedPass.qrCodeDataUrl}
                  download={`VELVT_PASS_${selectedPass.ticketNumber}.png`}
                  className="w-full block text-center px-4 py-2.5 rounded-lg bg-red text-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-red-hover transition-all shadow-[0_0_15px_rgba(200,16,46,0.35)]"
                >
                  Download QR Pass Image (PNG)
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
