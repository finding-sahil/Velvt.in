"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { checkInSponsor } from "@/app/actions";
import DownloadQrButton from "@/components/ui/DownloadQrButton";

interface SponsorData {
  found: boolean;
  ticketNumber: string;
  securityToken: string;
  attendeeName: string;
  tierName: string;
  status: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  event: any;
}

interface SponsorPassClientProps {
  sponsorData: SponsorData;
  identifier: string;
  qrSvg: string;
  passUrl: string;
  isStaff: boolean;
  staffName: string;
}

export function SponsorPassClient({
  sponsorData: initialData,
  identifier,
  qrSvg,
  passUrl,
  isStaff,
  staffName,
}: SponsorPassClientProps) {
  const [data, setData] = useState<SponsorData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleStaffCheckIn() {
    startTransition(async () => {
      const res = await checkInSponsor(data.ticketNumber || identifier, staffName);
      if (res.success && res.sponsor) {
        setData((prev) => ({
          ...prev,
          isCheckedIn: true,
          checkedInAt: new Date().toISOString(),
          checkedInBy: staffName,
        }));
        setFeedback("ACCESS GRANTED • VIP Sponsor Admitted Successfully");
      } else {
        setFeedback(res.error || (res as any).message || "Admit failed");
      }
    });
  }

  function handlePrint() {
    window.print();
  }

  const isAdmitted = data.isCheckedIn;

  return (
    <div className="rounded-3xl bg-black/60 border border-amber-500/30 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden space-y-6">
      {/* Top Gold Accent Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b]" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
            VIP Sponsor Credential
          </span>
        </div>
        <p className="font-display font-black text-lg tracking-wider text-white">
          VELVT<span className="text-red">.in</span>
        </p>
      </div>

      {/* Status Badge */}
      <div className="text-center space-y-1">
        {isAdmitted ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Admitted • Venue Entry Granted</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Valid Pass • Gate Ready</span>
          </div>
        )}

        {isAdmitted && data.checkedInAt && (
          <p className="text-[11px] font-mono text-g5">
            Admitted at {new Date(data.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            {data.checkedInBy && ` by ${data.checkedInBy}`}
          </p>
        )}
      </div>

      {/* Sponsor Details */}
      <div className="space-y-4 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-g5 block">
            Authorized Partner / Sponsor
          </span>
          <h2 className="font-display font-black text-xl uppercase tracking-tight text-white mt-0.5">
            {data.attendeeName}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-g5 block">
              Pass ID
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {data.ticketNumber}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-g5 block">
              Access Tier
            </span>
            <span className="text-xs font-mono font-bold text-white truncate block">
              {data.tierName}
            </span>
          </div>
        </div>

        {data.event && (
          <div className="pt-3 border-t border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-g5 block">
              Production Access
            </span>
            <span className="text-xs font-medium text-white">
              {data.event.name}
            </span>
            {data.event.venue?.name && (
              <span className="text-[11px] text-g5 block">
                {data.event.venue.name}, {data.event.venue.city}
              </span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-g5">
          <span>Security Protocol</span>
          <span className="text-emerald-400">Cryptographically Sealed</span>
        </div>
      </div>

      {/* QR Code Scannable by Gatemen */}
      {qrSvg && (
        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="p-4 bg-white rounded-2xl border-4 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div
              className="w-48 h-48 sm:w-56 sm:h-56"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
          <p className="text-[11px] font-mono text-g5 tracking-wider uppercase text-center">
            Scan at Entrance Gate for VIP Admittance
          </p>
        </div>
      )}

      {/* Staff Direct Admit Action */}
      {isStaff && !isAdmitted && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-300 font-bold uppercase">
              Staff Portal • Gate Scanner
            </span>
            <span className="text-[10px] font-mono text-g5">{staffName}</span>
          </div>
          <button
            type="button"
            onClick={handleStaffCheckIn}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            {isPending ? "Admitting..." : "Admit VIP Sponsor Now →"}
          </button>
        </div>
      )}

      {feedback && (
        <p className="text-xs font-mono text-center text-amber-300 bg-amber-500/10 border border-amber-500/20 py-2 px-3 rounded-lg">
          {feedback}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
        <DownloadQrButton
          data={passUrl}
          filename={`${data.ticketNumber || "VELVT-VIP-SPONSOR"}-Pass.png`}
          title={data.attendeeName}
          subtitle={`PASS ID: ${data.ticketNumber} • ${data.tierName}`}
          badgeText="VIP SPONSOR PASS"
          label="Download Pass QR"
          className="flex-1 justify-center py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider"
        />
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Print Pass
        </button>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-[11px] font-mono text-g5 hover:text-white uppercase tracking-wider transition-colors"
        >
          &larr; VELVT.in Nocturnal Experience
        </Link>
      </div>
    </div>
  );
}
