import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";
import { adminPath, adminLoginPath } from "@/lib/admin-path";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminLoginPath());
  }

  // Fetch real aggregate metrics
  const [
    eventCount,
    pendingVolunteersCount,
    verifiedVolunteersCount,
    newInquiriesCount,
    recentVolunteers,
    recentInquiries,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.volunteer.count({ where: { status: "pending" } }),
    prisma.volunteer.count({ where: { status: { in: ["approved", "verified"] } } }),
    prisma.contactInquiry.count({ where: { status: "new" } }),
    prisma.volunteer.findMany({
      take: 5,
      orderBy: { appliedAt: "desc" },
      include: { event: { select: { name: true } } },
    }),
    prisma.contactInquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Welcome Back, {session.user.name}
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Operational Overview
          </h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={adminPath("/volunteers")}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border border-red-glow bg-red-dim text-white hover:bg-red/20 transition-all inline-flex items-center gap-2"
          >
            <span>Manage Volunteers</span>
            {pendingVolunteersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red text-white text-[10px] flex items-center justify-center font-bold">
                {pendingVolunteersCount}
              </span>
            )}
          </Link>
          <Link
            href={adminPath("/events")}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border border-white/15 bg-white/[0.04] text-g5 hover:text-white transition-all"
          >
            Manage Events
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>Total Events</span>
            <span className="w-2 h-2 rounded-full bg-red" />
          </div>
          <p className="font-display font-black text-4xl text-white tracking-tight">{eventCount}</p>
          <p className="text-[11px] text-g5">Active and scheduled productions</p>
        </div>

        <div className="border border-amber-500/30 bg-amber-950/15 p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 uppercase tracking-wider">
            <span>Pending Applicants</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="font-display font-black text-4xl text-amber-300 tracking-tight">
            {pendingVolunteersCount}
          </p>
          <p className="text-[11px] text-amber-300/70">Awaiting credential review &amp; ID</p>
        </div>

        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>Verified Crew</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="font-display font-black text-4xl text-white tracking-tight">
            {verifiedVolunteersCount}
          </p>
          <p className="text-[11px] text-g5">Credentials active in directory</p>
        </div>

        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>New Inquiries</span>
            <span className="w-2 h-2 rounded-full bg-red" />
          </div>
          <p className="font-display font-black text-4xl text-white tracking-tight">{newInquiriesCount}</p>
          <p className="text-[11px] text-g5">Collaboration &amp; sponsorship messages</p>
        </div>
      </div>

      {/* Two Column Section: Recent Volunteers & Recent Inquiries */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applicants */}
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">Recent Volunteer Submissions</h3>
              <p className="text-xs text-g5">Latest registrations from public portal</p>
            </div>
            <Link
              href={adminPath("/volunteers")}
              className="text-xs font-mono text-red hover:underline uppercase tracking-wider"
            >
              View All &rarr;
            </Link>
          </div>

          {recentVolunteers.length === 0 ? (
            <p className="text-xs text-g5 py-6 text-center">
              No volunteer applications submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-white">{vol.fullName}</p>
                    <p className="text-g5 font-mono text-[11px]">
                      {vol.preferredRole} • {vol.city}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge status={vol.status} />
                    <p className="text-[10px] text-g5 font-mono">
                      {formatDateShort(vol.appliedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">Incoming Inquiries</h3>
              <p className="text-xs text-g5">General, sponsor, and venue requests</p>
            </div>
            <Link
              href={adminPath("/inquiries")}
              className="text-xs font-mono text-red hover:underline uppercase tracking-wider"
            >
              View Inbox &rarr;
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <p className="text-xs text-g5 py-6 text-center">
              No inquiries submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{inq.name}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red bg-red-dim px-2 py-0.5 rounded-full border border-red-glow">
                      {inq.category}
                    </span>
                  </div>
                  <p className="text-g5 text-xs line-clamp-2">{inq.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
