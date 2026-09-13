import { prisma } from "@/lib/db";
import { requireAdmin, isRootAdmin, ROOT_ADMIN_EMAIL } from "@/lib/auth";
import { AuditLogViewer } from "./AuditLogViewer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit & Security Logs — VELVT",
};

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const session = await requireAdmin();
  const isRoot = isRootAdmin(session.user);

  // If user is a founder or core team member, root admin actions are completely invisible.
  // The query strictly filters out any logs where actorEmail matches root admin.
  const logs = await prisma.auditLog.findMany({
    where: isRoot
      ? undefined
      : {
          NOT: [
            { actorEmail: ROOT_ADMIN_EMAIL },
            { actorEmail: { startsWith: "admin@" } },
            { action: { startsWith: "admin." } },
          ],
        },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red mb-1">
          <span>●</span>
          <span>{isRoot ? "Root Security & Master Audit" : "Team Security & Activity"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
          {isRoot ? "Master System Audit Trail" : "Founder & Team Activity Logs"}
        </h1>
        <p className="text-xs sm:text-sm text-g5 mt-1">
          {isRoot
            ? "Comprehensive immutable audit of all system activity, administrative operations, and user changes."
            : "Activity trail of team operations, event updates, ticket management, and staff interactions."}
        </p>
      </div>

      <AuditLogViewer initialLogs={logs} isRootAdmin={isRoot} />
    </div>
  );
}

