"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  actorEmail?: string | null;
  actorId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  createdAt: Date | string;
}

interface AuditLogViewerProps {
  initialLogs: AuditLog[];
  isRootAdmin?: boolean;
}

export function AuditLogViewer({ initialLogs, isRootAdmin = false }: AuditLogViewerProps) {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<"master" | "founder">("master");

  const filtered = logs.filter((l) => {
    const isRootAction =
      l.actorEmail?.toLowerCase() === "admin@velvt.in" ||
      l.actorEmail?.toLowerCase().startsWith("admin@") ||
      l.action.startsWith("admin.");

    // If viewer is NOT root admin, or root admin switched to founder preview mode:
    if ((!isRootAdmin || viewScope === "founder") && isRootAction) {
      return false;
    }

    if (filterAction !== "all" && !l.action.startsWith(filterAction)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        (l.actorEmail && l.actorEmail.toLowerCase().includes(q)) ||
        (l.targetType && l.targetType.toLowerCase().includes(q)) ||
        (l.targetId && l.targetId.toLowerCase().includes(q)) ||
        (l.ipAddress && l.ipAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Root Admin Scope Switcher & Banner */}
      {isRootAdmin && (
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400 text-base">⚡</span>
            <div>
              <span className="text-white font-bold uppercase">Root Master Viewport</span>
              <p className="text-[11px] text-g5">
                Root admin operations are strictly quarantined and invisible in Founder &amp; Core Team sessions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewScope("master")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                viewScope === "master"
                  ? "bg-amber-500 text-black font-bold shadow-md"
                  : "text-g5 hover:text-white"
              }`}
            >
              Master Trail ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setViewScope("founder")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                viewScope === "founder"
                  ? "bg-amber-500 text-black font-bold shadow-md"
                  : "text-g5 hover:text-white"
              }`}
            >
              Founder View ({logs.filter((l) => l.actorEmail !== "admin@velvt.in" && !l.actorEmail?.startsWith("admin@") && !l.action.startsWith("admin.")).length})
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono uppercase">
          {[
            { id: "all", label: "All Logs" },
            { id: "admin", label: "Auth / Login" },
            { id: "ticket", label: "Tickets" },
            { id: "volunteer", label: "Volunteers" },
            { id: "sponsor", label: "Sponsors" },
            { id: "team", label: "Team & Portfolio" },
            { id: "event", label: "Events" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterAction(cat.id)}
              className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                filterAction === cat.id
                  ? "bg-red text-white font-bold"
                  : "bg-white/[0.04] text-g5 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, IP, ID, action..."
            className="px-4 py-1.5 rounded-full bg-black border border-white/15 text-white text-xs font-mono focus:border-red focus:outline-none w-full sm:w-64"
          />
        </div>
      </div>

      {/* Logs Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/[0.02] text-g5 font-mono text-xs">
          No audit log entries found matching criteria.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-white/[0.03] text-g5 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const isRootEntry =
                    log.actorEmail?.toLowerCase() === "admin@velvt.in" ||
                    log.actorEmail?.toLowerCase().startsWith("admin@") ||
                    log.action.startsWith("admin.");

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-g5 whitespace-nowrap">
                        {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-red font-semibold uppercase text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-white">
                        <div className="flex items-center gap-2">
                          <span>{log.actorEmail || "System / Public"}</span>
                          {isRootAdmin && isRootEntry && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] uppercase tracking-wider font-bold">
                              Root (Hidden)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-g5">
                        {log.targetType ? `${log.targetType} (${log.targetId ? log.targetId.slice(0, 8) + "..." : ""})` : "—"}
                      </td>
                      <td className="p-4 text-g5 text-[11px]">
                        {log.ipAddress || "internal"}
                      </td>
                      <td className="p-4 text-right">
                        {log.metadata ? (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            className="text-[10px] text-red hover:underline uppercase tracking-wider cursor-pointer"
                          >
                            {isExpanded ? "Hide" : "View JSON"}
                          </button>
                        ) : (
                          <span className="text-g5">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail JSON Viewer if expanded */}
      {expandedId && (
        <div className="p-4 rounded-2xl border border-red/30 bg-red/[0.02] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-red font-bold uppercase">Log Metadata Payload</span>
            <button onClick={() => setExpandedId(null)} className="text-g5 hover:text-white">✕ Close</button>
          </div>
          <pre className="p-3 rounded-xl bg-black border border-white/10 text-[11px] font-mono text-emerald-400 overflow-x-auto">
            {logs.find((l) => l.id === expandedId)?.metadata}
          </pre>
        </div>
      )}
    </div>
  );
}
