import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCachedSiteSettings } from "@/lib/settings-cache";
import { getCachedDashboardMetrics } from "@/lib/dashboard-cache";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";
import { adminPath, adminLoginPath } from "@/lib/admin-path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminLoginPath());
  }
  if (session.user.role === "gateman") {
    redirect(adminPath("/gate"));
  }

  // Fetch cached aggregate metrics (sub-10ms response) and site settings
  const [metrics, siteSettings] = await Promise.all([
    getCachedDashboardMetrics(),
    getCachedSiteSettings(),
  ]);

  const {
    eventCount,
    pendingVolunteersCount,
    verifiedVolunteersCount,
    newInquiriesCount,
    issuedTicketsCount,
    checkedInTicketsCount,
    subscribersCount,
    recentVolunteers,
    recentInquiries,
  } = metrics;

  const activeTheme = siteSettings.site_theme || "legacy";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-red font-bold">
              Executive Terminal
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[11px] font-mono text-g5 uppercase tracking-wider">
              {session.user.name} ({session.user.role.toUpperCase()})
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase mt-1">
            VELVT Operations Center
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={adminPath("/settings")}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border border-red-glow bg-red-dim text-white hover:bg-red/20 transition-all inline-flex items-center gap-2"
          >
            <span>🎨 Theme:</span>
            <span className="font-bold text-red capitalize">{activeTheme.replace("_", " ")}</span>
          </Link>
          <Link
            href={adminPath("/gate")}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30 transition-all inline-flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Events */}
        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>Total Events</span>
            <span className="w-2 h-2 rounded-full bg-red" />
          </div>
          <p className="font-display font-black text-4xl text-white tracking-tight">{eventCount}</p>
          <p className="text-[11px] text-g5">Staged &amp; upcoming productions</p>
        </div>

        {/* Pending Applicants */}
        <div className="border border-amber-500/30 bg-amber-950/15 p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 uppercase tracking-wider">
            <span>Pending Crew</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="font-display font-black text-4xl text-amber-300 tracking-tight">
            {pendingVolunteersCount}
          </p>
          <p className="text-[11px] text-amber-300/70">
            Awaiting approval · {verifiedVolunteersCount} verified
          </p>
        </div>

        {/* Issued Tickets */}
        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>Passes Issued</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="font-display font-black text-4xl text-white tracking-tight">
            {issuedTicketsCount}
          </p>
          <p className="text-[11px] text-emerald-400">
            {checkedInTicketsCount} checked in at gate
          </p>
        </div>

        {/* The Velvet Loop Subscribers */}
        <Link
          href={adminPath("/subscribers")}
          className="border border-red/30 bg-red-950/15 hover:bg-red-950/25 hover:border-red/60 transition-all p-5 rounded-2xl space-y-2 relative overflow-hidden group block"
        >
          <div className="flex justify-between items-center text-[10px] font-mono text-red uppercase tracking-wider">
            <span>The Velvet Loop</span>
            <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
          </div>
          <p className="font-display font-black text-4xl text-white group-hover:text-red transition-colors tracking-tight">
            {subscribersCount}
          </p>
          <p className="text-[11px] text-g5">Subscribers &amp; dispatch list</p>
        </Link>

        {/* Inquiries */}
        <div className="border border-white/10 bg-white/[0.03] p-5 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-g5 uppercase tracking-wider">
            <span>New Messages</span>
            <span className="w-2 h-2 rounded-full bg-red" />
          </div>
          <p className="font-display font-black text-4xl text-white tracking-tight">{newInquiriesCount}</p>
          <p className="text-[11px] text-g5">Sponsors &amp; collaboration</p>
        </div>
      </div>

      {/* Quick Launchpad Hub */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
          <span className="w-2 h-[2px] bg-red" />
          <span>Quick Launchpad</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Link
            href={adminPath("/events")}
            className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-red/40 transition-all text-center flex flex-col items-center gap-1.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🎟️</span>
            <span className="text-xs font-mono text-g6 group-hover:text-white uppercase font-bold">Events</span>
          </Link>
          <Link
            href={adminPath("/tickets")}
            className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-red/40 transition-all text-center flex flex-col items-center gap-1.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🎫</span>
            <span className="text-xs font-mono text-g6 group-hover:text-white uppercase font-bold">Tickets &amp; QR</span>
          </Link>
          <Link
            href={adminPath("/subscribers")}
            className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-red/40 transition-all text-center flex flex-col items-center gap-1.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📬</span>
            <span className="text-xs font-mono text-g6 group-hover:text-white uppercase font-bold">The Loop</span>
          </Link>
          <Link
            href={adminPath("/volunteers")}
            className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-red/40 transition-all text-center flex flex-col items-center gap-1.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🤝</span>
            <span className="text-xs font-mono text-g6 group-hover:text-white uppercase font-bold">Volunteers</span>
          </Link>
          <Link
            href={adminPath("/team")}
            className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-red/40 transition-all text-center flex flex-col items-center gap-1.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
            <span className="text-xs font-mono text-g6 group-hover:text-white uppercase font-bold">Core Team</span>
          </Link>
          <Link
            href={adminPath("/gatemen")}
            className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-red/40 transition-all text-center flex flex-col items-center gap-1.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🛡️</span>
            <span className="text-xs font-mono text-g6 group-hover:text-white uppercase font-bold">Gatemen</span>
          </Link>
          <Link
            href={adminPath("/settings")}
            className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-red/40 transition-all text-center flex flex-col items-center gap-1.5 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🎨</span>
            <span className="text-xs font-mono text-g6 group-hover:text-white uppercase font-bold">Themes &amp; CMS</span>
          </Link>
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
