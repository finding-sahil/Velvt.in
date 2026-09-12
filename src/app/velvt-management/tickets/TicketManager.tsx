"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  generateIssuedTicket,
  toggleTicketCheckIn,
  deleteIssuedTicket,
  checkInIssuedTicket,
  refreshLegacyTicketQRCodes,
  bulkGenerateIssuedTickets,
  updateTicketStatusDirect,
} from "@/app/actions";
import { downloadRealTicketPass } from "@/lib/real-ticket-generator";
import { adminPath } from "@/lib/admin-path";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

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
    venue?: {
      name?: string | null;
      city?: string | null;
      address?: string | null;
    } | null;
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

  // Local synced ticket list for instant optimistic updates
  const [ticketList, setTicketList] = useState<IssuedTicketItem[]>(initialTickets);
  useEffect(() => {
    setTicketList(initialTickets);
  }, [initialTickets]);

  // Toast & Modal Confirmation State (eliminates all browser native popups)
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmRevokeTicket, setConfirmRevokeTicket] = useState<IssuedTicketItem | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "checked_in" | "pending">("all");
  const [eventFilter, setEventFilter] = useState<string>("all");

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isMassTicketModalOpen, setIsMassTicketModalOpen] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [massSuccessMessage, setMassSuccessMessage] = useState<string | null>(null);
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

  // Mass Ticket Generator Form & Sheet State
  const [massMode, setMassMode] = useState<"sheet" | "quick">("sheet");
  const [massFormData, setMassFormData] = useState({
    eventId: defaultEventId,
    tierName: "VIP Pass",
    priceInRupees: "0",
    quantity: "10",
    prefix: "VIP Guest",
    notes: "Mass batch ticket generation",
  });

  // Google Sheet-like tabular input rows
  const [sheetRows, setSheetRows] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
    price: string;
    notes: string;
  }>>([
    { id: "row-1", name: "", email: "", phone: "", tier: "VIP Pass", price: "0", notes: "" },
    { id: "row-2", name: "", email: "", phone: "", tier: "VIP Pass", price: "0", notes: "" },
    { id: "row-3", name: "", email: "", phone: "", tier: "VIP Pass", price: "0", notes: "" },
  ]);
  const [isPasteBoxOpen, setIsPasteBoxOpen] = useState(false);
  const [pasteRawText, setPasteRawText] = useState("");

  const handleAddRow = () => {
    setSheetRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: "",
        email: "",
        phone: "",
        tier: massFormData.tierName || "VIP Pass",
        price: massFormData.priceInRupees || "0",
        notes: "",
      },
    ]);
  };

  const handleAddMultipleRows = (count: number) => {
    const newRows = Array.from({ length: count }, (_, i) => ({
      id: `row-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name: "",
      email: "",
      phone: "",
      tier: massFormData.tierName || "VIP Pass",
      price: massFormData.priceInRupees || "0",
      notes: "",
    }));
    setSheetRows((prev) => [...prev, ...newRows]);
  };

  const handleRemoveRow = (id: string) => {
    setSheetRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleRowChange = (id: string, field: string, val: string) => {
    setSheetRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleImportPastedText = () => {
    if (!pasteRawText.trim()) return;
    const lines = pasteRawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedRows = lines.map((line, idx) => {
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      const name = (parts[0] || "").trim();
      const email = (parts[1] || "").trim();
      const phone = (parts[2] || "").trim();
      const tier = (parts[3] || "").trim() || massFormData.tierName || "VIP Pass";
      const price = (parts[4] || "").trim() || massFormData.priceInRupees || "0";
      const notes = (parts[5] || "").trim();
      return {
        id: `row-${Date.now()}-${idx}`,
        name,
        email,
        phone,
        tier,
        price,
        notes,
      };
    });

    if (parsedRows.length > 0) {
      setSheetRows(parsedRows);
      setIsPasteBoxOpen(false);
      setPasteRawText("");
      setToast({ message: `Imported ${parsedRows.length} rows from clipboard!`, type: "success" });
    }
  };

  // Calculate Metrics
  const totalCount = ticketList.length;
  const checkedInCount = ticketList.filter((t) => t.isCheckedIn || t.status === "used").length;
  const pendingCount = Math.max(0, totalCount - checkedInCount);
  const checkInRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  // Filtered Tickets
  const filteredTickets = ticketList.filter((ticket) => {
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
      (statusFilter === "checked_in" && (ticket.isCheckedIn || ticket.status === "used")) ||
      (statusFilter === "pending" && !ticket.isCheckedIn && ticket.status !== "used");

    const matchesEvent = eventFilter === "all" || ticket.event.id === eventFilter;

    return matchesQuery && matchesStatus && matchesEvent;
  });

  // Handle Mass Generation Submission
  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBulkGenerating(true);
    setActionError(null);
    setMassSuccessMessage(null);

    try {
      if (massMode === "sheet") {
        const validRows = sheetRows
          .map((r) => ({
            attendeeName: r.name.trim(),
            attendeeEmail: r.email.trim(),
            attendeePhone: r.phone.trim(),
            tierName: r.tier.trim() || massFormData.tierName || "VIP Pass",
            priceInRupees: parseFloat(r.price) || 0,
            notes: r.notes.trim() || massFormData.notes,
          }))
          .filter((r) => r.attendeeName.length > 0);

        if (validRows.length === 0) {
          setActionError("Please enter at least one Attendee Name in the spreadsheet table.");
          setIsBulkGenerating(false);
          return;
        }

        const res = await bulkGenerateIssuedTickets({
          eventId: massFormData.eventId,
          tierName: massFormData.tierName,
          priceInRupees: parseFloat(massFormData.priceInRupees) || 0,
          notes: massFormData.notes,
          records: validRows,
        });

        if (res.success && res.tickets) {
          setTicketList((prev) => [...(res.tickets as any), ...prev]);
          setMassSuccessMessage(`Successfully generated ${res.count} custom passes!`);
          setTimeout(() => {
            setIsMassTicketModalOpen(false);
            setMassSuccessMessage(null);
          }, 1200);
          router.refresh();
        } else {
          setActionError(res.error || "Failed to generate tickets.");
        }
      } else {
        const qty = parseInt(massFormData.quantity, 10) || 10;
        const res = await bulkGenerateIssuedTickets({
          eventId: massFormData.eventId,
          tierName: massFormData.tierName,
          priceInRupees: parseFloat(massFormData.priceInRupees) || 0,
          quantity: qty,
          prefix: massFormData.prefix,
          notes: massFormData.notes,
        });

        if (res.success && res.tickets) {
          setTicketList((prev) => [...(res.tickets as any), ...prev]);
          setMassSuccessMessage(`Successfully generated ${res.count} passes!`);
          setTimeout(() => {
            setIsMassTicketModalOpen(false);
            setMassSuccessMessage(null);
          }, 1200);
          router.refresh();
        } else {
          setActionError(res.error || "Failed to mass generate tickets.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsBulkGenerating(false);
    }
  };

  // Direct Ticket Status Change via Dropdown
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    const isUsed = newStatus === "used";
    setTicketList((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              isCheckedIn: isUsed,
              checkedInAt: isUsed ? (t.checkedInAt || new Date().toISOString()) : null,
            }
          : t
      )
    );

    try {
      await updateTicketStatusDirect(ticketId, newStatus);
      setToast({ message: `Ticket status set to ${newStatus.toUpperCase()}`, type: "success" });
      router.refresh();
    } catch (err) {
      console.error("Status update error:", err);
      setTicketList(initialTickets);
    }
  };

  // Download Real Vintage Ticket PNG (Canvas Graphic + Scannable QR)
  const handleDownloadRealTicket = async (ticket: IssuedTicketItem) => {
    try {
      await downloadRealTicketPass({
        ticketNumber: ticket.ticketNumber,
        securityToken: ticket.securityToken,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        tierName: ticket.tierName,
        qrCodeDataUrl: ticket.qrCodeDataUrl,
        event: {
          name: ticket.event.name,
          date: ticket.event.date,
          time: ticket.event.time,
          venueName: ticket.event.venue?.name,
          venueCity: ticket.event.venue?.city,
        },
      });
      setToast({ message: `Downloaded pass for ${ticket.attendeeName}!`, type: "success" });
    } catch (err) {
      console.error("Real ticket download error:", err);
      setToast({ message: "Failed to render real ticket pass.", type: "error" });
    }
  };

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

  // Delete / Revoke Pass with custom in-app confirmation
  const requestRevokePass = (ticket: IssuedTicketItem) => {
    setConfirmRevokeTicket(ticket);
  };

  const executeRevokePass = async (ticket: IssuedTicketItem) => {
    const prevList = ticketList;
    setTicketList((prev) => prev.filter((t) => t.id !== ticket.id));
    setToast({
      message: `Pass ${ticket.ticketNumber} revoked for ${ticket.attendeeName}`,
      type: "info",
      actionLabel: "Undo",
      onAction: () => setTicketList(prevList),
    });

    try {
      await deleteIssuedTicket(ticket.id);
      if (selectedPass?.id === ticket.id) {
        setSelectedPass(null);
      }
      router.refresh();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed to revoke pass", type: "error" });
      setTicketList(prevList);
    }
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
      setToast({ message: "Please allow browser popups to open the printable sheet.", type: "info" });
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
              <th>Door Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTickets
              .map(
                (t) => `
              <tr>
                <td style="text-align: center;"><div class="box ${t.isCheckedIn ? "checked" : ""}"></div></td>
                <td><code style="font-weight: bold;">${t.ticketNumber}</code></td>
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
    return `https://velvt-in.vercel.app/verify/ticket/${pass.securityToken}`;
  };

  const handleRefreshQRCodes = async () => {
    startTransition(async () => {
      const res = await refreshLegacyTicketQRCodes();
      if (res.success) {
        setToast({ message: `Successfully re-rendered ${res.count} QR codes to production!`, type: "success" });
        router.refresh();
      } else {
        setToast({ message: "Failed to refresh QR codes", type: "error" });
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
            onClick={() => {
              setIsMassTicketModalOpen(true);
              setActionError(null);
            }}
            className="px-4 py-2.5 rounded-lg bg-red/15 hover:bg-red/25 border border-red/40 text-red text-xs font-mono uppercase tracking-wider font-semibold shadow-[0_0_15px_rgba(200,16,46,0.2)] transition-all flex items-center gap-2"
          >
            <span>⚡ Mass Generator (Sheet)</span>
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

                    {/* Door Status with Direct Interactive Dropdown */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="space-y-1">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className={`text-[10px] font-mono font-bold uppercase rounded-lg px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none ${
                            ticket.status === "used" || ticket.isCheckedIn
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                              : ticket.status === "cancelled"
                              ? "bg-red-950/80 text-red-400 border-red-500/40"
                              : ticket.status === "refunded"
                              ? "bg-purple-950/80 text-purple-300 border-purple-500/40"
                              : "bg-amber-950/70 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          <option value="valid">Valid / Pending Entry</option>
                          <option value="used">Admitted / Used</option>
                          <option value="cancelled">Cancelled / Revoked</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <div className="text-[10px] text-g5">
                          {ticket.isCheckedIn && ticket.checkedInAt
                            ? `${new Date(ticket.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}${ticket.checkedInBy ? ` • ${ticket.checkedInBy}` : ""}`
                            : "Not scanned"}
                        </div>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-g4 text-[11px] italic max-w-[150px] truncate">
                      {ticket.notes || <span className="text-g6 not-italic font-mono">—</span>}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadRealTicket(ticket)}
                          className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Download Real Vintage Ticket Pass (PNG + QR)"
                        >
                          <span>🎟️</span>
                          <span className="hidden xl:inline">Pass</span>
                        </button>

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
                          onClick={() => requestRevokePass(ticket)}
                          disabled={isPending}
                          className="p-1.5 rounded bg-white/[0.04] hover:bg-red/20 text-g5 hover:text-red transition-colors cursor-pointer"
                          title="Revoke / Invalidate Pass"
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

              {/* Download Real Vintage Ticket Pass (Canvas Graphics + Scannable QR) */}
              <button
                type="button"
                onClick={() => handleDownloadRealTicket(selectedPass)}
                className="w-full block text-center px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono uppercase font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)]"
              >
                🎟️ Download Real Vintage Ticket (Graphic + QR PNG)
              </button>

              {selectedPass.qrCodeDataUrl && (
                <a
                  href={selectedPass.qrCodeDataUrl}
                  download={`VELVT_PASS_${selectedPass.ticketNumber}.png`}
                  className="w-full block text-center px-4 py-2.5 rounded-lg bg-white/[0.08] text-white text-xs font-mono uppercase font-semibold tracking-wider hover:bg-white/[0.15] transition-all border border-white/10"
                >
                  Download Raw QR Code Only (PNG)
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal / Sheet: Mass Ticket Generator (Spreadsheet & Bulk) ─────────────────────── */}
      {isMassTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full ${
              massMode === "sheet" ? "max-w-5xl" : "max-w-xl"
            } rounded-2xl bg-[#0c0c0e] border border-red/30 shadow-[0_16px_50px_rgba(0,0,0,0.9)] p-5 md:p-7 relative max-h-[92vh] overflow-y-auto transition-all duration-300`}
          >
            <button
              onClick={() => setIsMassTicketModalOpen(false)}
              className="absolute top-4 right-4 text-g5 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-red uppercase">
                  Batch Generator &bull; Auto Serial &amp; Scannable QR
                </span>
              </div>
              <h2 className="font-heading text-xl md:text-2xl uppercase tracking-wider text-white mt-1">
                Mass Ticket Generator
              </h2>
              <p className="text-xs text-g4 mt-1">
                Enter ticket owners directly using the Google Sheet table or import from clipboard. Each ticket gets a unique serial number, security token, and real vintage pass PNG download.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-4 w-fit">
              <button
                type="button"
                onClick={() => setMassMode("sheet")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  massMode === "sheet"
                    ? "bg-red text-white shadow-[0_0_12px_rgba(200,16,46,0.4)]"
                    : "text-g5 hover:text-white"
                }`}
              >
                <span>📊</span>
                <span>Google Sheet Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setMassMode("quick")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  massMode === "quick"
                    ? "bg-red text-white shadow-[0_0_12px_rgba(200,16,46,0.4)]"
                    : "text-g5 hover:text-white"
                }`}
              >
                <span>⚡</span>
                <span>Numbered Anonymous Batch</span>
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-red/10 border border-red/30 text-red text-xs font-mono">
                ✕ {actionError}
              </div>
            )}

            {massSuccessMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
                <span>✓</span>
                <span>{massSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleBulkGenerate} className="space-y-4">
              {/* Event Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                  Associated Event <span className="text-red">*</span>
                </label>
                <select
                  value={massFormData.eventId}
                  onChange={(e) => setMassFormData({ ...massFormData, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red font-sans"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({new Date(ev.date).toLocaleDateString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              {massMode === "sheet" ? (
                /* ── TAB 1: Google Sheet Table Mode ─────────────────────── */
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-white tracking-wide">
                        Attendee Spreadsheet
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-amber-400 border border-amber-500/20">
                        {sheetRows.filter((r) => r.name.trim()).length} of {sheetRows.length} valid
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="px-2.5 py-1 text-xs font-mono rounded bg-white/[0.06] text-white hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
                      >
                        + Add Row
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddMultipleRows(5)}
                        className="px-2.5 py-1 text-xs font-mono rounded bg-white/[0.06] text-white hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
                      >
                        + 5 Rows
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPasteBoxOpen(!isPasteBoxOpen)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                          isPasteBoxOpen
                            ? "bg-purple-600 text-white border-purple-500"
                            : "bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-950/70"
                        }`}
                      >
                        <span>📋</span>
                        <span>{isPasteBoxOpen ? "Close Paste Box" : "Paste from Sheets / Excel"}</span>
                      </button>
                      {sheetRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSheetRows([
                              { id: "row-1", name: "", email: "", phone: "", tier: "VIP Pass", price: "0", notes: "" },
                            ]);
                          }}
                          className="px-2 py-1 text-xs font-mono text-g5 hover:text-red transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Paste Box Drawer */}
                  {isPasteBoxOpen && (
                    <div className="p-3.5 rounded-xl bg-[#141418] border border-purple-500/40 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                          Paste Data from Google Sheets or Excel
                        </span>
                        <span className="text-[10px] text-g5">Tab or Comma separated</span>
                      </div>
                      <textarea
                        rows={4}
                        value={pasteRawText}
                        onChange={(e) => setPasteRawText(e.target.value)}
                        placeholder={`Name\tEmail\tPhone\tTier\tPrice\tNotes\nSahil Mazumder\tsahil@velvt.in\t9876543210\tVIP Pass\t0\tVIP Table 1\nJane Doe\tjane@example.com\t9876543211\tGeneral Entry\t499\tGuest`}
                        className="w-full bg-black/60 border border-white/15 rounded-lg p-2 text-xs font-mono text-white placeholder:text-g6 focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPasteBoxOpen(false);
                            setPasteRawText("");
                          }}
                          className="px-3 py-1 text-xs font-mono text-g5 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleImportPastedText}
                          className="px-4 py-1 text-xs font-mono font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                        >
                          ⚡ Import Rows into Spreadsheet
                        </button>
                      </div>
                    </div>
                  )}

                  {/* The Spreadsheet Grid */}
                  <div className="rounded-xl border border-white/15 bg-black/40 overflow-x-auto max-h-[42vh] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse min-w-[760px]">
                      <thead>
                        <tr className="bg-white/[0.04] text-[10px] text-g5 uppercase tracking-wider border-b border-white/10 sticky top-0 z-10">
                          <th className="p-2 text-center w-10">#</th>
                          <th className="p-2 min-w-[170px]">Attendee Name *</th>
                          <th className="p-2 min-w-[170px]">Email Address</th>
                          <th className="p-2 min-w-[130px]">Phone Number</th>
                          <th className="p-2 min-w-[130px]">Pass Tier</th>
                          <th className="p-2 min-w-[90px]">Price (₹)</th>
                          <th className="p-2 min-w-[130px]">Notes</th>
                          <th className="p-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {sheetRows.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-white/[0.02]">
                            <td className="p-2 text-center text-g5 text-[11px] select-none">{idx + 1}</td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) => handleRowChange(row.id, "name", e.target.value)}
                                placeholder="Attendee Full Name"
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="email"
                                value={row.email}
                                onChange={(e) => handleRowChange(row.id, "email", e.target.value)}
                                placeholder="Auto-generated if empty"
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red placeholder:text-g6"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="tel"
                                value={row.phone}
                                onChange={(e) => handleRowChange(row.id, "phone", e.target.value)}
                                placeholder="+91..."
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.tier}
                                onChange={(e) => handleRowChange(row.id, "tier", e.target.value)}
                                placeholder="VIP Pass"
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="number"
                                min="0"
                                value={row.price}
                                onChange={(e) => handleRowChange(row.id, "price", e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red text-right"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.notes}
                                onChange={(e) => handleRowChange(row.id, "notes", e.target.value)}
                                placeholder="Optional note"
                                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                disabled={sheetRows.length <= 1}
                                className="text-g5 hover:text-red transition-colors p-1 cursor-pointer disabled:opacity-20"
                                title="Remove row"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ── TAB 2: Numbered Anonymous Batch ─────────────────────── */
                <div className="space-y-4">
                  {/* Tier Name & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                        Ticket Tier Name <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={massFormData.tierName}
                        onChange={(e) => setMassFormData({ ...massFormData, tierName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                        placeholder="e.g. VIP Pass, Early Bird"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                        Price (INR ₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={massFormData.priceInRupees}
                        onChange={(e) => setMassFormData({ ...massFormData, priceInRupees: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red font-mono"
                      />
                    </div>
                  </div>

                  {/* Quantity with quick chips */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                      Quantity to Generate <span className="text-red">*</span>
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      {["5", "10", "25", "50", "100"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMassFormData({ ...massFormData, quantity: num })}
                          className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                            massFormData.quantity === num
                              ? "bg-red text-white border-red"
                              : "bg-white/[0.05] text-g4 border-white/10 hover:border-white/30"
                          }`}
                        >
                          +{num}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="250"
                      required
                      value={massFormData.quantity}
                      onChange={(e) => setMassFormData({ ...massFormData, quantity: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red font-mono"
                    />
                    <span className="text-[10px] text-g5 mt-1 block">Maximum 250 tickets per single batch.</span>
                  </div>

                  {/* Attendee Name Prefix */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                      Attendee Name Label / Prefix
                    </label>
                    <input
                      type="text"
                      value={massFormData.prefix}
                      onChange={(e) => setMassFormData({ ...massFormData, prefix: e.target.value })}
                      placeholder="e.g. VIP Guest, Sponsor, Artist Guest"
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                    />
                    <span className="text-[10px] text-g5 mt-1 block">
                      Generated tickets will be named &ldquo;{massFormData.prefix || "Guest"} #001&rdquo;, &ldquo;{massFormData.prefix || "Guest"} #002&rdquo;, etc.
                    </span>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-g4 mb-1">
                      Batch Notes / Reference
                    </label>
                    <input
                      type="text"
                      value={massFormData.notes}
                      onChange={(e) => setMassFormData({ ...massFormData, notes: e.target.value })}
                      placeholder="e.g. Offline box office distribution batch A"
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-sm text-white focus:outline-none focus:border-red"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMassTicketModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg bg-white/[0.05] text-g4 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isBulkGenerating ||
                    (massMode === "sheet" && sheetRows.filter((r) => r.name.trim()).length === 0)
                  }
                  className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider font-bold rounded-lg bg-red hover:bg-red-hover text-white shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {isBulkGenerating ? (
                    <span>Generating Passes...</span>
                  ) : massMode === "sheet" ? (
                    <span>
                      🎟️ Generate {sheetRows.filter((r) => r.name.trim()).length || 0} Named Passes
                    </span>
                  ) : (
                    <span>⚡ Generate {massFormData.quantity || "0"} Passes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Custom In-App Modal: Confirm Revocation (No Browser Alert) ──── */}
      {confirmRevokeTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e0e11] border border-red/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red/50 flex items-center justify-center text-lg shrink-0">
                ⚠️
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-red font-bold">
                  Confirm Invalidation
                </span>
                <h3 className="font-display font-bold text-lg uppercase text-white tracking-wide">
                  Revoke Admission Pass
                </h3>
              </div>
            </div>
            <p className="text-xs font-mono text-g4 leading-relaxed">
              Are you sure you want to revoke pass{" "}
              <span className="text-white font-bold">{confirmRevokeTicket.ticketNumber}</span> for{" "}
              <span className="text-red-400 font-bold">{confirmRevokeTicket.attendeeName}</span>?
              <br />
              <span className="text-g5 text-[11px] mt-1 block">
                This pass will immediately be invalidated and rejected upon scanning at any gate.
              </span>
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmRevokeTicket(null)}
                className="px-4 py-2 text-xs font-mono rounded-lg bg-white/[0.06] text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = confirmRevokeTicket;
                  setConfirmRevokeTicket(null);
                  executeRevokePass(t);
                }}
                className="px-5 py-2 text-xs font-mono font-bold rounded-lg bg-red text-white hover:bg-red-700 cursor-pointer transition-all shadow-[0_0_15px_rgba(200,16,46,0.4)]"
              >
                Yes, Revoke Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification Overlay ─────────────────────────────────── */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
