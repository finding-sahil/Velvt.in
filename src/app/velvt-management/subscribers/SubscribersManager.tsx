"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteNewsletterSubscriber,
  bulkDeleteNewsletterSubscribers,
  toggleNewsletterSubscriberStatus,
} from "@/app/actions";

export interface NewsletterSubscriberItem {
  id: string;
  email: string;
  source: string;
  status: string; // active, unsubscribed
  createdAt: Date | string;
}

interface SubscribersManagerProps {
  initialSubscribers: NewsletterSubscriberItem[];
}

export function SubscribersManager({ initialSubscribers }: SubscribersManagerProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberItem[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Metrics ────────────────────────────────────────────────────────────────
  const totalCount = subscribers.length;
  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = subscribers.filter(
    (s) => new Date(s.createdAt).getTime() >= thirtyDaysAgo.getTime()
  ).length;

  // ─── Filtered List ─────────────────────────────────────────────────────────
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ─── Selection ─────────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSubscribers.length && filteredSubscribers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubscribers.map((s) => s.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Copy Utilities ────────────────────────────────────────────────────────
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(label);
    showToast(`Copied ${label} to clipboard`, "info");
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const copyAllEmails = () => {
    const emails = filteredSubscribers.map((s) => s.email).join(", ");
    if (!emails) {
      showToast("No emails to copy in current filter.", "error");
      return;
    }
    navigator.clipboard.writeText(emails);
    showToast(`Copied ${filteredSubscribers.length} email addresses to clipboard!`, "success");
  };

  // ─── CSV Export ────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (filteredSubscribers.length === 0) {
      showToast("No subscribers to export.", "error");
      return;
    }

    const headers = ["Email", "Status", "Source Channel", "Subscribed At (UTC)"];
    const rows = filteredSubscribers.map((s) => [
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.status}"`,
      `"${s.source}"`,
      `"${new Date(s.createdAt).toISOString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `velvt-newsletter-subscribers-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredSubscribers.length} subscribers to CSV!`, "success");
  };

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleToggleStatus = (sub: NewsletterSubscriberItem) => {
    const newStatus = sub.status === "active" ? "unsubscribed" : "active";
    const prevList = subscribers;
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s))
    );

    startTransition(async () => {
      const res = await toggleNewsletterSubscriberStatus(sub.id, newStatus);
      if (res.success) {
        showToast(
          `Subscriber "${sub.email}" marked as ${newStatus}.`,
          newStatus === "active" ? "success" : "info"
        );
        router.refresh();
      } else {
        showToast(res.error || "Failed to update subscriber status.", "error");
        setSubscribers(prevList);
      }
    });
  };

  const handleDeleteSingle = (id: string) => {
    const target = subscribers.find((s) => s.id === id);
    const prevList = subscribers;
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    setConfirmDeleteId(null);

    startTransition(async () => {
      const res = await deleteNewsletterSubscriber(id);
      if (res.success) {
        showToast(`Subscriber "${target?.email || id}" permanently removed.`, "success");
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        router.refresh();
      } else {
        showToast(res.error || "Failed to delete subscriber.", "error");
        setSubscribers(prevList);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const idsToDelete = Array.from(selectedIds);
    const count = idsToDelete.length;
    const prevList = subscribers;

    setSubscribers((prev) => prev.filter((s) => !selectedIds.has(s.id)));
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);

    startTransition(async () => {
      const res = await bulkDeleteNewsletterSubscribers(idsToDelete);
      if (res.success) {
        showToast(`Successfully deleted ${count} subscriber(s).`, "success");
        router.refresh();
      } else {
        showToast(res.error || "Failed to delete selected subscribers.", "error");
        setSubscribers(prevList);
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border font-mono text-xs shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : toast.type === "error"
              ? "bg-red-950/90 border-red-500/50 text-red-200"
              : "bg-black/90 border-white/20 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-red font-bold">
              Dispatch Audience &amp; Growth
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[11px] font-mono text-g5 uppercase tracking-wider">
              {totalCount} Total Subscribers
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase mt-1">
            The VELVT Loop
          </h1>
          <p className="text-xs font-mono text-g5 mt-1">
            Contacts captured via the &quot;Stay in the Velvet Loop&quot; dispatch signup and secret venue drops.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={copyAllEmails}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer flex items-center gap-1.5"
            title="Copy comma-separated list of emails"
          >
            <span>📋</span>
            <span>Copy Email List</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-red-glow bg-red-dim text-white hover:bg-red/25 hover:border-red transition-all cursor-pointer flex items-center gap-2 font-bold shadow-[0_0_20px_rgba(200,16,46,0.25)]"
          >
            <span>⬇️</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-1 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>Total Contacts</span>
            <span className="w-2 h-2 rounded-full bg-red" />
          </div>
          <p className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            {totalCount}
          </p>
          <p className="text-[11px] text-g5 font-mono">Loop dispatch registry</p>
        </div>

        {/* Active Subscribers */}
        <div className="border border-emerald-500/30 bg-emerald-950/15 p-5 rounded-2xl space-y-1 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
            <span>Active Listeners</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="font-display font-black text-3xl sm:text-4xl text-emerald-300 tracking-tight">
            {activeCount}
          </p>
          <p className="text-[11px] text-emerald-400/70 font-mono">Receiving drops &amp; updates</p>
        </div>

        {/* Unsubscribed */}
        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-1 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>Unsubscribed</span>
            <span className="w-2 h-2 rounded-full bg-g5" />
          </div>
          <p className="font-display font-black text-3xl sm:text-4xl text-white/60 tracking-tight">
            {unsubscribedCount}
          </p>
          <p className="text-[11px] text-g5 font-mono">Opted out from dispatches</p>
        </div>

        {/* 30-Day Growth */}
        <div className="border border-amber-500/30 bg-amber-950/15 p-5 rounded-2xl space-y-1 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 uppercase tracking-wider">
            <span>Last 30 Days</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <p className="font-display font-black text-3xl sm:text-4xl text-amber-300 tracking-tight">
            +{recentCount}
          </p>
          <p className="text-[11px] text-amber-300/70 font-mono">New audience momentum</p>
        </div>
      </div>

      {/* Filter, Search & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.08] p-4 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email or acquisition channel..."
            className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-xs font-mono text-white placeholder-g5 focus:outline-none focus:border-red transition-all"
          />
          <span className="absolute left-3 top-2.5 text-g5 text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-g5 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Bulk Select */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-white/[0.1] text-white font-bold" : "text-g5 hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold"
                  : "text-g5 hover:text-emerald-400"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unsubscribed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === "unsubscribed"
                  ? "bg-white/[0.1] text-white font-bold"
                  : "text-g5 hover:text-white"
              }`}
            >
              Unsubscribed ({unsubscribedCount})
            </button>
          </div>

          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setConfirmBulkDelete(true)}
              className="px-3.5 py-2 rounded-xl bg-red hover:bg-red/90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(200,16,46,0.35)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>🗑️</span>
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Table of Subscribers */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#09090b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-g5 uppercase tracking-wider text-[10px]">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === filteredSubscribers.length &&
                      filteredSubscribers.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-black/60 text-primary accent-primary cursor-pointer align-middle"
                  />
                </th>
                <th className="p-4">Contact Email</th>
                <th className="p-4">Channel / Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-g5">
                    {subscribers.length === 0
                      ? "No subscribers have joined the Velvet Loop yet. Submissions through the footer and event pages will appear here."
                      : "No subscribers match your search filter."}
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const isSelected = selectedIds.has(sub.id);
                  const isCopied = copiedEmail === sub.email;

                  return (
                    <tr
                      key={sub.id}
                      className={`transition-colors ${
                        isSelected ? "bg-red-950/20 hover:bg-red-950/30" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(sub.id)}
                          className="w-4 h-4 rounded border-white/20 bg-black/60 text-primary accent-primary cursor-pointer align-middle"
                        />
                      </td>

                      <td className="p-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{sub.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(sub.email, sub.email)}
                            className="text-g5 hover:text-white text-[11px] cursor-pointer"
                            title="Copy email"
                          >
                            {isCopied ? "✓" : "📋"}
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-g5">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] text-white/80 uppercase">
                          {sub.source || "website"}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            sub.status === "active"
                              ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                              : "bg-white/[0.05] border border-white/20 text-g5 hover:bg-white/[0.1] hover:text-white"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sub.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-g5"
                            }`}
                          />
                          <span>{sub.status}</span>
                        </button>
                      </td>

                      <td className="p-4 text-g5 text-[11px]">
                        {new Date(sub.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(sub)}
                            className="px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-g5 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
                          >
                            {sub.status === "active" ? "Unsubscribe" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(sub.id)}
                            className="w-7 h-7 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm text-xs"
                            title="Delete Subscriber"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-[#0c0c0e] border border-red/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(200,16,46,0.3)] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red/20 border border-red/40 flex items-center justify-center shrink-0">
                <span className="text-red text-lg">⚠️</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                  Delete Subscriber?
                </h4>
                <p className="text-xs font-mono text-g5">
                  Permanent removal from the Velvet Loop
                </p>
              </div>
            </div>

            <p className="text-xs font-mono text-white/80 leading-relaxed">
              Are you sure you want to permanently delete this contact from the newsletter registry? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono uppercase tracking-wider text-g5 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSingle(confirmDeleteId)}
                className="px-5 py-2 rounded-xl bg-red hover:bg-red/90 text-white border border-red/50 text-xs font-mono uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(200,16,46,0.4)] transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {confirmBulkDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmBulkDelete(false)}
        >
          <div
            className="bg-[#0c0c0e] border border-red/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(200,16,46,0.3)] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red/20 border border-red/40 flex items-center justify-center shrink-0">
                <span className="text-red text-lg">⚠️</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                  Bulk Delete Subscribers?
                </h4>
                <p className="text-xs font-mono text-g5">
                  Permanent removal of {selectedIds.size} contact(s)
                </p>
              </div>
            </div>

            <p className="text-xs font-mono text-white/80 leading-relaxed">
              This will permanently delete <span className="text-white font-bold">{selectedIds.size}</span> selected subscriber record(s) from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono uppercase tracking-wider text-g5 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-5 py-2 rounded-xl bg-red hover:bg-red/90 text-white border border-red/50 text-xs font-mono uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(200,16,46,0.4)] transition-all cursor-pointer"
              >
                Delete Selected ({selectedIds.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
