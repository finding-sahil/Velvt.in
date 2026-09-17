"use client";

import { useState } from "react";
import { trackVolunteerApplicationStatus } from "@/app/actions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export function VolunteerApplicationTracker() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setSearched(true);

    const res = await trackVolunteerApplicationStatus(query.trim());
    setLoading(false);
    if (res.found && res.volunteer) {
      setResult(res.volunteer);
    } else {
      setResult(null);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-10 space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
          <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">
            Application Status Tracker
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-g5 leading-relaxed">
          Check the real-time status of your volunteer application. Enter your registered email address or official Volunteer ID (e.g., VEL-2026-00047).
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="tracker-query" className="sr-only">
          Registered email or Volunteer ID
        </label>
        <input
          id="tracker-query"
          name="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter registered email or Volunteer ID..."
          aria-label="Enter registered email or Volunteer ID"
          className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm font-mono focus:border-red focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-xl bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_var(--red-glow)] min-h-[44px]"
        >
          {loading ? "Searching..." : "Track Status →"}
        </button>
      </form>

      {searched && (
        <div role="status" aria-live="polite" className="pt-2">
          {result ? (
            <div className="p-6 rounded-2xl border border-white/15 bg-black/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <h4 className="font-display font-black text-xl uppercase tracking-tight text-white">
                    {result.fullName}
                  </h4>
                  <p className="text-xs font-mono text-g5">
                    Applied For: {result.event?.name || "Upcoming Event"}
                  </p>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-bold ${
                      result.status === "approved" || result.status === "verified"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                        : result.status === "rejected" || result.status === "revoked"
                        ? "bg-red/15 text-red border border-red/40"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    Status: {result.status}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-g5 block">Volunteer ID:</span>
                  <span className="text-white font-bold">{result.volunteerId || "Pending Issuance"}</span>
                </div>
                <div>
                  <span className="text-g5 block">Assigned Specialization:</span>
                  <span className="text-red font-bold">{result.assignedRole || result.preferredRole}</span>
                </div>
                <div>
                  <span className="text-g5 block">Submission Date:</span>
                  <span className="text-g5">{formatDate(result.appliedAt)}</span>
                </div>
              </div>

              {result.volunteerId && (
                <div className="pt-2">
                  <Link
                    href={`/verify/${result.volunteerId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-red hover:underline"
                  >
                    <span>View Official Public Credential Badge</span>
                    <span>↗</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono text-g5 text-center">
              No registration record found for &quot;{query}&quot;. Please check the spelling or submit a new volunteer application.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
