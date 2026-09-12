"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { checkInIssuedTicket } from "@/app/actions";

interface TicketData {
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
  checkedInAt: string | null;
  checkedInBy: string | null;
  notes: string | null;
  createdAt: string;
  event: {
    id: string;
    name: string;
    date: string;
    time: string | null;
    status: string;
  };
}

interface TicketVerifierProps {
  initialTicket: TicketData | null;
  identifier: string;
  isAuthorizedStaff?: boolean;
  staffName?: string;
}

export function TicketVerifier({
  initialTicket,
  identifier,
  isAuthorizedStaff = false,
  staffName = "Gate Staff",
}: TicketVerifierProps) {
  const [ticket, setTicket] = useState<TicketData | null>(initialTicket);
  const [isPending, startTransition] = useTransition();
  const [gatekeeperName, setGatekeeperName] = useState(staffName);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [customLookup, setCustomLookup] = useState("");

  const handleAdmit = () => {
    if (!ticket) return;

    startTransition(async () => {
      const res = await checkInIssuedTicket(ticket.securityToken || ticket.ticketNumber, gatekeeperName);
      if (res.success && res.ticket) {
        setTicket({
          ...ticket,
          isCheckedIn: true,
          checkedInAt: new Date().toISOString(),
          checkedInBy: gatekeeperName,
          status: "used",
        });
        setFeedbackMessage("ACCESS GRANTED &bull; Attendee admitted successfully");
      } else {
        setFeedbackMessage(res.message || "Failed to admit attendee");
      }
    });
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLookup.trim()) return;
    window.location.href = `/verify/ticket/${encodeURIComponent(customLookup.trim())}`;
  };

  // State 1: Invalid / Not Found
  if (!ticket) {
    return (
      <div className="rounded-2xl bg-[#0d0d0d] border border-red/40 p-6 md:p-8 text-center shadow-[0_0_50px_rgba(200,16,46,0.3)] animate-fade-in">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red/20 border-2 border-red flex items-center justify-center mx-auto mb-5 text-red shadow-[0_0_20px_rgba(200,16,46,0.4)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-red/20 text-red border border-red/30 mb-3">
          Verification Failed
        </div>

        <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white">
          Invalid Ticket Pass
        </h1>

        <p className="text-sm text-g4 mt-3 max-w-xs mx-auto">
          No active ticket matches code <span className="font-mono text-white font-bold">{identifier}</span>. Deny entry or verify physical receipt with event management.
        </p>

        {/* Manual Lookup Input */}
        <form onSubmit={handleLookupSubmit} className="mt-6 pt-6 border-t border-white/[0.08]">
          <div className="text-[11px] font-mono text-g5 uppercase tracking-wider mb-2 text-left">
            Lookup Another Pass
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter VLT-2026-..."
              value={customLookup}
              onChange={(e) => setCustomLookup(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.15] text-xs font-mono text-white placeholder-g6 focus:outline-none focus:border-red"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono font-bold uppercase tracking-wider"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    );
  }

  // State 2: Cancelled or Revoked
  if (ticket.status === "cancelled" || ticket.status === "revoked") {
    return (
      <div className="rounded-2xl bg-[#0d0d0d] border border-red/40 p-6 md:p-8 text-center shadow-[0_0_50px_rgba(200,16,46,0.3)] animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red/20 border-2 border-red flex items-center justify-center mx-auto mb-5 text-red shadow-[0_0_20px_rgba(200,16,46,0.4)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-red/20 text-red border border-red/30 mb-3">
          Pass Revoked
        </div>

        <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white">
          Entry Denied &bull; Pass Cancelled
        </h1>

        <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/[0.1] text-left space-y-1.5 font-mono text-xs">
          <div><span className="text-g5">Attendee:</span> <strong className="text-white">{ticket.attendeeName}</strong></div>
          <div><span className="text-g5">Serial:</span> <span className="text-white">{ticket.ticketNumber}</span></div>
          <div><span className="text-g5">Tier:</span> <span className="text-red font-bold">{ticket.tierName}</span></div>
        </div>

        <p className="text-xs text-g5 mt-4">
          This ticket has been revoked by VELVET management. Do not admit holder.
        </p>
      </div>
    );
  }

  // State 3: Already Checked In (Duplicate Scan / Re-entry)
  const isAlreadyCheckedIn = ticket.isCheckedIn;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Verification Card */}
      <div
        className={`rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 shadow-2xl ${
          isAlreadyCheckedIn
            ? "bg-[#0f0e08] border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)]"
            : "bg-[#080d09] border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)]"
        }`}
      >
        {/* Glow ambient */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl pointer-events-none ${
            isAlreadyCheckedIn ? "bg-amber-500/20" : "bg-emerald-500/20"
          }`}
        />

        {/* Status Badge & Icon */}
        <div className="text-center mb-5">
          {isAlreadyCheckedIn ? (
            <div>
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Already Admitted &bull; Pass Used
              </span>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-white mt-2">
                Duplicate Scan Warning
              </h2>
              <p className="text-xs text-amber-200/80 font-mono mt-1">
                Checked in at{" "}
                <strong className="text-white">
                  {ticket.checkedInAt
                    ? new Date(ticket.checkedInAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                    : "earlier today"}
                </strong>
                {ticket.checkedInBy ? ` by ${ticket.checkedInBy}` : ""}
              </p>
            </div>
          ) : (
            <div>
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                Valid Ticket &bull; Access Granted
              </span>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-white mt-2">
                Admit Pass Holder
              </h2>
            </div>
          )}
        </div>

        {/* Attendee Details Box */}
        <div className="p-4 rounded-xl bg-black/60 border border-white/[0.1] space-y-3 font-mono text-xs">
          {/* Tier Banner */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
            <span className="text-g5 uppercase tracking-wider">Pass Category</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-dim border border-red-glow text-white shadow-[0_0_10px_rgba(200,16,46,0.3)]">
              {ticket.tierName}
            </span>
          </div>

          {/* Attendee Name */}
          <div className="py-1">
            <span className="text-[10px] text-g5 uppercase tracking-widest block">Attendee Name</span>
            <span className="font-heading text-xl text-white tracking-wider uppercase block mt-0.5 font-bold">
              {ticket.attendeeName}
            </span>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/[0.06]">
            <div>
              <span className="text-g5 text-[10px] uppercase block">Email</span>
              <span className="text-g3 truncate block">{ticket.attendeeEmail}</span>
            </div>
            <div>
              <span className="text-g5 text-[10px] uppercase block">Phone</span>
              <span className="text-g3 block">{ticket.attendeePhone || "Not provided"}</span>
            </div>
          </div>

          {/* Event & Date */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/[0.06]">
            <div>
              <span className="text-g5 text-[10px] uppercase block">Event</span>
              <span className="text-white font-medium block truncate">{ticket.event.name}</span>
            </div>
            <div>
              <span className="text-g5 text-[10px] uppercase block">Serial #</span>
              <span className="text-white font-bold block">{ticket.ticketNumber}</span>
            </div>
          </div>

          {ticket.notes && (
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] text-g5 uppercase block">Gate / VIP Notes</span>
              <span className="text-amber-300 font-medium italic block">{ticket.notes}</span>
            </div>
          )}
        </div>

        {/* Primary Action Area */}
        <div className="mt-6 space-y-3">
          {isAuthorizedStaff ? (
            <>
              {!isAlreadyCheckedIn ? (
                <button
                  onClick={handleAdmit}
                  disabled={isPending}
                  className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-heading text-lg uppercase tracking-wider font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isPending ? "Checking in..." : "Admit & Check In"}</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-xs font-mono text-amber-300 font-semibold">
                    Pass is already verified and checked into system.
                  </div>
                  <div className="text-[11px] text-g5 font-mono mt-1">
                    If the attendee is re-entering, confirm wristband / hand stamp.
                  </div>
                </div>
              )}

              <Link
                href="/velvt-management/gate"
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-g3 hover:text-white font-mono text-xs uppercase tracking-wider font-semibold border border-white/[0.1] transition-all flex items-center justify-center gap-2"
              >
                <span>📷 Open Live Gate Scanner</span>
              </Link>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-center space-y-2">
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Official VELVET Digital Pass</span>
              </div>
              <p className="text-[11px] text-g4 font-mono leading-relaxed">
                Present this pass at the gate. Admission must be scanned and authorized by official VELVET Gate Staff.
              </p>
              <div className="pt-2 border-t border-white/[0.06]">
                <Link
                  href="/velvt-management/login"
                  className="text-[11px] font-mono text-g5 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Gatekeeper Sign In</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          )}

          {feedbackMessage && (
            <div className="text-center text-xs font-mono text-emerald-400 font-bold p-2 bg-emerald-500/10 rounded-lg">
              {feedbackMessage}
            </div>
          )}
        </div>

        {/* Gatekeeper selector (Staff Only) */}
        {isAuthorizedStaff && (
          <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-g5">
            <span>Gate Station:</span>
            <input
              type="text"
              value={gatekeeperName}
              onChange={(e) => setGatekeeperName(e.target.value)}
              className="w-36 px-2 py-1 rounded bg-black/60 border border-white/[0.1] text-g3 text-right text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Manual lookup footer */}
      <form onSubmit={handleLookupSubmit} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
        <div className="text-[10px] font-mono text-g5 uppercase tracking-wider mb-1.5">
          Scan Next or Type Serial Number
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. VLT-2026-X8K9P2"
            value={customLookup}
            onChange={(e) => setCustomLookup(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/[0.1] text-xs font-mono text-white placeholder-g6 focus:outline-none focus:border-red"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono font-bold uppercase tracking-wider shrink-0"
          >
            Verify
          </button>
        </div>
      </form>
    </div>
  );
}
