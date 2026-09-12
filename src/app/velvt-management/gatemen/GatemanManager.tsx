"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createGatemanUser,
  toggleGatemanStatus,
  deleteGatemanUser,
  resetGatemanPassword,
} from "@/app/actions";
import { adminPath } from "@/lib/admin-path";

interface GatemanItem {
  id: string;
  email: string;
  name: string;
  role: string;
  assignedEventId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  eventName: string;
  checkInCount: number;
}

interface EventOption {
  id: string;
  name: string;
  status: string;
  date: string;
}

interface GatemanManagerProps {
  initialGatemen: GatemanItem[];
  events: EventOption[];
  totalCheckedIn: number;
}

export function GatemanManager({
  initialGatemen,
  events,
  totalCheckedIn,
}: GatemanManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [gatemen, setGatemen] = useState<GatemanItem[]>(initialGatemen);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedGateman, setSelectedGateman] = useState<GatemanItem | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    assignedEventId: "",
  });

  const [resetPasswordValue, setResetPasswordValue] = useState("");

  const activeCount = gatemen.filter((g) => g.isActive).length;

  const filteredGatemen = gatemen.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.eventName.toLowerCase().includes(q)
    );
  });

  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddForm((prev) => ({ ...prev, password: pass }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const fd = new FormData();
    fd.set("name", addForm.name);
    fd.set("email", addForm.email);
    fd.set("password", addForm.password);
    fd.set("assignedEventId", addForm.assignedEventId);

    startTransition(async () => {
      const res = await createGatemanUser(fd);
      if (res.success && res.user) {
        setIsAddModalOpen(false);
        setAddForm({ name: "", email: "", password: "", assignedEventId: "" });
        router.refresh();
      } else {
        setFormError(res.error || "Failed to create gateman account.");
      }
    });
  };

  const handleToggleStatus = (gateman: GatemanItem) => {
    startTransition(async () => {
      const res = await toggleGatemanStatus(gateman.id, gateman.isActive);
      if (res.success) {
        setGatemen((prev) =>
          prev.map((g) =>
            g.id === gateman.id ? { ...g, isActive: !g.isActive } : g
          )
        );
        router.refresh();
      }
    });
  };

  const handleDelete = (gateman: GatemanItem) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete gatekeeper "${gateman.name}" (${gateman.email})?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteGatemanUser(gateman.id);
      if (res.success) {
        setGatemen((prev) => prev.filter((g) => g.id !== gateman.id));
        router.refresh();
      }
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateman) return;
    setFormError(null);
    setFormSuccess(null);

    const fd = new FormData();
    fd.set("id", selectedGateman.id);
    fd.set("newPassword", resetPasswordValue);

    startTransition(async () => {
      const res = await resetGatemanPassword(fd);
      if (res.success) {
        setFormSuccess(`Password successfully updated for ${selectedGateman.name}!`);
        setResetPasswordValue("");
        setTimeout(() => {
          setIsResetModalOpen(false);
          setFormSuccess(null);
        }, 1500);
      } else {
        setFormError(res.error || "Failed to reset password.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Header & Action Controls ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
              Access Control & Gate Staff
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl tracking-wider uppercase text-white">
            Gatemen & Security Terminal Management
          </h1>
          <p className="text-sm text-g5 mt-1 max-w-2xl">
            Create and assign gate staff accounts. Gatemen only have access to the mobile QR camera scanner and manual attendee check-in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={adminPath("/gate")}
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Launch Live Scanner</span>
          </Link>

          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-red text-white text-xs font-mono uppercase tracking-wider font-semibold shadow-[0_0_20px_rgba(200,16,46,0.35)] hover:bg-red-hover transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Add Gateman</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
          <div className="text-[11px] font-mono text-g5 uppercase tracking-wider">
            Total Gate Staff Accounts
          </div>
          <div className="font-heading text-3xl text-white mt-1 font-bold">
            {gatemen.length}
          </div>
          <div className="text-[11px] font-mono text-g4 mt-1">
            {activeCount} active terminals right now
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
          <div className="text-[11px] font-mono text-g5 uppercase tracking-wider">
            Active Scanning Staff
          </div>
          <div className="font-heading text-3xl text-emerald-400 mt-1 font-bold flex items-center gap-2">
            <span>{activeCount}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-[11px] font-mono text-emerald-300/80 mt-1">
            Authorized to verify & grant venue entry
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
          <div className="text-[11px] font-mono text-g5 uppercase tracking-wider">
            Total Venue Admissions
          </div>
          <div className="font-heading text-3xl text-white mt-1 font-bold">
            {totalCheckedIn}
          </div>
          <div className="text-[11px] font-mono text-g4 mt-1">
            Passes checked in across all gates
          </div>
        </div>
      </div>

      {/* ── Search Bar & Filter ──────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-g5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/60 border border-white/[0.1] rounded-lg text-xs font-mono text-white placeholder-g6 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-xs font-mono text-g5 self-end sm:self-center">
            Showing <strong className="text-white">{filteredGatemen.length}</strong> gate staff
          </div>
        </div>
      </div>

      {/* ── Gatemen Table ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-g5 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Staff Name & Station</th>
                <th className="py-3.5 px-4 font-semibold">Login Email</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Event</th>
                <th className="py-3.5 px-4 font-semibold">Admissions</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredGatemen.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-g5 font-mono">
                    {gatemen.length === 0
                      ? "No Gateman accounts created yet. Click '+ Add Gateman' to assign your first gate staff."
                      : "No Gatemen match your search query."}
                  </td>
                </tr>
              ) : (
                filteredGatemen.map((gateman) => (
                  <tr
                    key={gateman.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{gateman.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase">
                          Gatekeeper
                        </span>
                      </div>
                      <div className="text-[10px] text-g5 mt-0.5">
                        Created {new Date(gateman.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-g3 font-mono">
                      {gateman.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-white font-medium">
                        {gateman.eventName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/[0.06] text-white">
                        {gateman.checkInCount} scanned
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(gateman)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                          gateman.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-red/20 text-red border-red/30 hover:bg-red/30"
                        }`}
                        title="Click to toggle active status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            gateman.isActive ? "bg-emerald-400 animate-pulse" : "bg-red"
                          }`}
                        />
                        <span>{gateman.isActive ? "Active" : "Deactivated"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedGateman(gateman);
                            setResetPasswordValue("");
                            setFormError(null);
                            setFormSuccess(null);
                            setIsResetModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-g4 hover:text-white text-[11px] font-mono border border-white/[0.08] transition-all cursor-pointer"
                          title="Reset Password"
                        >
                          Password
                        </button>

                        <button
                          onClick={() => handleDelete(gateman)}
                          disabled={isPending}
                          className="px-2 py-1 rounded bg-red/10 hover:bg-red/20 text-red text-[11px] font-mono border border-red/20 transition-all cursor-pointer disabled:opacity-50"
                          title="Delete Gateman Account"
                        >
                          Delete
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

      {/* ── Modal: Add Gateman Account ─────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d0d0d] border border-white/[0.12] rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  New Access Account
                </span>
                <h2 className="font-heading text-xl uppercase tracking-wider text-white mt-0.5">
                  Create Gateman Login
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-g5 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red/10 border border-red/30 text-red text-xs font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-g4 uppercase tracking-wider block mb-1.5">
                  Gatekeeper Name or Station Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Gate 1 - Rahul or VIP Lounge Security"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.12] text-white placeholder-g6 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-g4 uppercase tracking-wider block mb-1.5">
                  Login Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. gate1@velvt.in"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.12] text-white placeholder-g6 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-g4 uppercase tracking-wider">
                    Password (min 6 characters) *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Auto-Generate Password
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter strong password or click auto-generate"
                  value={addForm.password}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.12] text-white placeholder-g6 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-g4 uppercase tracking-wider block mb-1.5">
                  Assigned Event Scope
                </label>
                <select
                  value={addForm.assignedEventId}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, assignedEventId: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.12] text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">All Events (Universal Gate Access)</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.status})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-g5 mt-1">
                  If restricted to a specific event, the gateman can only admit passes for that event.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-g4 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  {isPending ? "Creating..." : "Create Gateman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Reset Password ─────────────────────────────────────── */}
      {isResetModalOpen && selectedGateman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.12] rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  Security Update
                </span>
                <h2 className="font-heading text-lg uppercase tracking-wider text-white mt-0.5">
                  Reset Password for {selectedGateman.name}
                </h2>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-g5 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red/10 border border-red/30 text-red text-xs font-mono">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-g4 uppercase tracking-wider block mb-1.5">
                  New Password (min 6 characters) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.12] text-white placeholder-g6 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-g4 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
