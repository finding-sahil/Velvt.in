import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Volunteers — Official Directory — VELVT",
  description:
    "The official VELVT volunteer registry. Verify volunteer IDs and explore the people who help bring our events to life.",
};

export default async function VolunteersPage() {
  const { status, customTitle, customSubtitle } = await getPageStatus("volunteers");
  // Only show approved/verified volunteers publicly
  const volunteers = await prisma.volunteer
    .findMany({
      where: { status: { in: ["approved", "verified"] } },
      select: {
        volunteerId: true,
        fullName: true,
        status: true,
        assignedRole: true,
        socialLink: true,
        photo: true,
        event: { select: { name: true, date: true } },
      },
      orderBy: { approvedAt: "desc" },
    })
    .catch(() => []);

  const upcomingEvents = await prisma.event
    .findMany({
      where: { status: { in: ["upcoming", "ongoing"] } },
      select: { id: true, name: true },
    })
    .catch(() => []);

  const roles = await prisma.siteSetting
    .findUnique({ where: { key: "volunteer_roles" } })
    .catch(() => null);

  const roleList: string[] = roles ? JSON.parse(roles.value) : [];

  return (
    <PageStatusGate
      pageKey="volunteers"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <div className="py-12 md:py-16">
      {/* Hero */}
      <section className="container-velvt space-y-12">
        <SectionHeading
          title="Volunteer Directory."
          subtitle="A verified directory of the volunteers and crew members who help bring our events and experiences to life."
        />

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white">
              Join Our Volunteer Crew
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              VELVT volunteers are an essential part of every production. From guest relations to stage management, our crew helps deliver events that leave a lasting impression.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/volunteers/register" variant="primary">
                Apply to Volunteer
              </Button>
              <Button href="/verify" variant="secondary">
                Verify a Volunteer
              </Button>
            </div>
          </div>

          {/* Roles */}
          {roleList.length > 0 && (
            <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white">
                  Active Crew Specializations
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {roleList.map((role) => (
                  <span
                    key={role}
                    className="px-4 py-1.5 text-xs font-mono text-white/90 bg-white/[0.04] border border-white/10 rounded-full hover:border-primary/40 hover:bg-primary/10 transition-colors"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Verified Volunteer Cards Grid */}
      <section className="py-16">
        <div className="container-velvt space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">
                Verified Volunteer Cards ({volunteers.length})
              </h3>
            </div>
          </div>

          {volunteers.length === 0 ? (
            <EmptyState
              title="No verified volunteers yet"
              description="Verified volunteers will appear here once applications are approved."
            />
          ) : (
            <div className="space-y-12">
              {/* Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {volunteers.map((v) => {
                  let soc: {
                    instagram?: string;
                    linkedin?: string;
                    twitter?: string;
                    phone?: string;
                    portfolio?: string;
                  } | null = null;
                  if (v.socialLink) {
                    try {
                      soc = JSON.parse(v.socialLink);
                    } catch {
                      if (v.socialLink.includes("instagram")) soc = { instagram: v.socialLink };
                      else if (v.socialLink.includes("linkedin")) soc = { linkedin: v.socialLink };
                      else soc = { portfolio: v.socialLink };
                    }
                  }

                  return (
                    <div
                      key={v.volunteerId}
                      className="rounded-[20px] bg-white/[0.04] border border-white/10 backdrop-blur-[14px] p-6 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.18)] transition-all flex flex-col justify-between space-y-5 group"
                    >
                      {/* Top Bar: Credential ID + Status */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary tracking-widest bg-red-dim px-2.5 py-1 rounded-full border border-red-glow">
                          {v.volunteerId}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-widest bg-white/[0.05] border border-white/10 text-white">
                          <span className={`w-1.5 h-1.5 rounded-full ${v.status === "verified" ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-primary shadow-[0_0_6px_#c8102e]"}`} />
                          {v.status === "verified" ? "Verified" : "Approved"}
                        </span>
                      </div>

                      {/* Volunteer Identity & Photo */}
                      <div className="flex items-center gap-4">
                        {v.photo ? (
                          <img
                            src={v.photo}
                            alt={v.fullName}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-[0_0_16px_rgba(200,16,46,0.3)] shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-display font-black text-2xl text-white/30 shrink-0">
                            {v.fullName.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide truncate group-hover:text-primary transition-colors">
                            {v.fullName}
                          </h4>
                          <p className="text-xs font-mono text-primary uppercase tracking-wider font-medium truncate">
                            {v.assignedRole || "Event Operations"}
                          </p>
                          {v.event?.name && (
                            <p className="text-[11px] font-mono text-muted/80 truncate">
                              📍 {v.event.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Social & Contact Links */}
                      {soc && (soc.instagram || soc.linkedin || soc.twitter || soc.phone || soc.portfolio) && (
                        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                          {soc.instagram && (
                            <a
                              href={soc.instagram.startsWith("http") ? soc.instagram : `https://instagram.com/${soc.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-muted hover:border-primary hover:text-white hover:bg-red-dim transition-all"
                              title="Instagram Profile"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          )}
                          {soc.linkedin && (
                            <a
                              href={soc.linkedin.startsWith("http") ? soc.linkedin : `https://linkedin.com/in/${soc.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-muted hover:border-blue-400 hover:text-white hover:bg-blue-600/20 transition-all"
                              title="LinkedIn Profile"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                            </a>
                          )}
                          {soc.phone && (
                            <a
                              href={`https://wa.me/${soc.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-400 hover:border-emerald-400 hover:text-white hover:bg-emerald-600/20 transition-all"
                              title={`WhatsApp: ${soc.phone}`}
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                              </svg>
                            </a>
                          )}
                          {soc.portfolio && (
                            <a
                              href={soc.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-all text-xs"
                              title="Portfolio"
                            >
                              🔗
                            </a>
                          )}
                        </div>
                      )}

                      {/* Bottom Link to Verification */}
                      <div className="pt-2">
                        <a
                          href={`/verify/${v.volunteerId}`}
                          className="w-full py-2 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:border-primary/40"
                        >
                          <span>Verify Credential</span>
                          <span className="text-primary">→</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Collapsible / Supplementary Table Registry */}
              <div className="rounded-[20px] bg-white/[0.04] border border-white/10 backdrop-blur-[14px] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted">
                    Full Registry Index
                  </span>
                  <span className="text-xs font-mono text-primary font-semibold">
                    {volunteers.length} Active Records
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="py-4 px-6 text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted">
                          Volunteer ID
                        </th>
                        <th className="py-4 px-6 text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted">
                          Name
                        </th>
                        <th className="py-4 px-6 text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted">
                          Event
                        </th>
                        <th className="py-4 px-6 text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted">
                          Role
                        </th>
                        <th className="py-4 px-6 text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {volunteers.map((v) => (
                        <tr
                          key={v.volunteerId}
                          className="hover:bg-white/[0.04] transition-colors"
                        >
                          <td className="py-4 px-6">
                            <a
                              href={`/verify/${v.volunteerId}`}
                              className="font-mono text-sm font-semibold text-primary hover:text-white tracking-wider transition-colors inline-flex items-center gap-1.5"
                            >
                              {v.volunteerId} →
                            </a>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-white">
                            <div className="flex items-center gap-3">
                              {v.photo ? (
                                <img
                                  src={v.photo}
                                  alt={v.fullName}
                                  className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center font-bold text-xs text-g5">
                                  {v.fullName.charAt(0)}
                                </div>
                              )}
                              <span>{v.fullName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-muted">
                            {v.event?.name || "—"}
                          </td>
                          <td className="py-4 px-6 text-sm text-muted">
                            {v.assignedRole || "—"}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-widest bg-red-dim border border-red-glow text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#c8102e]" />
                              {v.status === "verified" ? "Verified" : "Approved"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
    </PageStatusGate>
  );
}
