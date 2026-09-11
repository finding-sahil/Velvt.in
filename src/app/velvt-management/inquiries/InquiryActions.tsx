"use client";

import { useState } from "react";
import { updateInquiryStatus } from "@/app/actions";
import { useRouter } from "next/navigation";

interface InquiryActionsProps {
  id: string;
  currentStatus: string;
}

export function InquiryActions({ id, currentStatus }: InquiryActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    await updateInquiryStatus(id, newStatus);
    setStatus(newStatus);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={loading}
        className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-black/50 border border-white/[0.1] text-muted-foreground hover:border-white/[0.2] focus:outline-none focus:border-crimson/50 cursor-pointer disabled:opacity-50"
      >
        <option value="new">Status: New</option>
        <option value="read">Status: Read</option>
        <option value="resolved">Status: Resolved</option>
      </select>
    </div>
  );
}
