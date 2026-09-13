import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AuditLogViewer } from "./AuditLogViewer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit & Security Logs — VELVT Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red mb-1">
          <span>●</span>
          <span>Security &amp; Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
          Audit &amp; Activity Logs
        </h1>
        <p className="text-xs sm:text-sm text-g5 mt-1">
          Immutable trail of administrative mutations, staff logins, ticket status changes, and sensitive operations.
        </p>
      </div>

      <AuditLogViewer initialLogs={logs} />
    </div>
  );
}
