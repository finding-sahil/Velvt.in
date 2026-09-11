import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";
import { InquiryActions } from "./InquiryActions";

export default async function AdminInquiriesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvet-management/login");
  }

  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

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
          Total Inquiries: <span className="text-white font-bold">{inquiries.length}</span>
        </div>
      </div>

      {inquiries.length === 0 ? (
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
                  <th className="py-3.5 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {inquiries.map((inq) => (
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
                      <InquiryActions id={inq.id} currentStatus={inq.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
