"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus, deleteInquiry } from "@/app/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  category: string;
  message: string;
  status: string;
  createdAt: Date | string;
}

interface InquiryManagerProps {
  inquiries: InquiryItem[];
}

export function InquiryManager({ inquiries }: InquiryManagerProps) {
  const router = useRouter();
  const [inquiryList, setInquiryList] = useState<InquiryItem[]>(inquiries);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setInquiryList(inquiries);
  }, [inquiries]);

  async function handleStatusChange(id: string, newStatus: string) {
    setLoadingId(id);
    // Instant optimistic update
    setInquiryList((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );

    try {
      const res = await updateInquiryStatus(id, newStatus);
      if (!res.success) {
        alert("Failed to update inquiry status");
        setInquiryList(inquiries);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update inquiry status");
      setInquiryList(inquiries);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Permanently delete inquiry from "${name}"?`)) return;

    // Instant optimistic deletion
    const prevList = inquiryList;
    setInquiryList((prev) => prev.filter((inq) => inq.id !== id));

    try {
      const res = await deleteInquiry(id);
      if (!res.success) {
        alert(res.error || "Failed to delete inquiry");
        setInquiryList(prevList);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete inquiry");
      setInquiryList(prevList);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
            Communications Inbox
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
            Contact &amp; Partnership Inquiries
          </h1>
          <p className="text-xs text-muted mt-1">
            Review incoming collaboration pitches, sponsorship proposals, venue offers, and general messages.
          </p>
        </div>

        <div className="text-xs font-mono text-muted bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06]">
          Total Inquiries: <span className="text-white font-bold">{inquiryList.length}</span>
        </div>
      </div>

      {inquiryList.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.02] p-12 text-center rounded-2xl space-y-3 font-mono text-xs text-muted">
          <p className="font-display text-2xl uppercase tracking-wider text-white font-bold">Inbox Zero</p>
          <p className="text-xs text-muted">
            No inquiries have been received yet. Submissions from the contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/[0.08] text-muted-foreground font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-6">Message</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {inquiryList.map((inq) => {
                  const isLoading = loadingId === inq.id;

                  return (
                    <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono">
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-crimson/10 text-crimson-light border border-crimson/20">
                          {inq.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-medium text-white text-sm">{inq.name}</p>
                        <a
                          href={`mailto:${inq.email}`}
                          className="text-muted-foreground font-mono text-[11px] hover:underline block"
                        >
                          {inq.email}
                        </a>
                        {inq.phone && (
                          <p className="text-muted-foreground/70 font-mono text-[10px]">
                            {inq.phone}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 max-w-md">
                        <p className="text-bone leading-relaxed whitespace-pre-wrap text-xs">
                          {inq.message}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={inq.status} />
                      </td>

                      <td className="py-4 px-4 font-mono text-muted-foreground text-[11px]">
                        {formatDateShort(inq.createdAt)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                            disabled={isLoading}
                            className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-black/50 border border-white/[0.1] text-muted-foreground hover:border-white/[0.2] focus:outline-none focus:border-crimson/50 cursor-pointer disabled:opacity-50"
                          >
                            <option value="new">Status: New</option>
                            <option value="read">Status: Read</option>
                            <option value="resolved">Status: Resolved</option>
                          </select>

                          <button
                            onClick={() => handleDelete(inq.id, inq.name)}
                            className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors cursor-pointer"
                            title="Permanently Delete Inquiry"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
