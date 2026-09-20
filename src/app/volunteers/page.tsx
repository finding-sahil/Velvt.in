import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status-server";
import { getCachedSiteSettings } from "@/lib/settings-cache";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { Button } from "@/components/ui/Button";
import { isSectionEnabled } from "@/lib/section-switchboard";
import Link from "next/link";
import { VolunteerApplicationTracker } from "./VolunteerApplicationTracker";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Production Crew & Volunteers — VELVT",
  description:
    "Join the VELVT production crew. Gain hands-on experience in event management, sensory architecture, and stage operations in Silchar, Assam.",
};

export default async function VolunteersPage() {
  const [{ status, customTitle, customSubtitle }, volunteers, testimonials, settings] = await Promise.all([
    getPageStatus("volunteers"),
    prisma.volunteer.findMany({
      where: { status: { in: ["approved", "verified"] } },
      select: {
        id: true,
        volunteerId: true,
        fullName: true,
        status: true,
        assignedRole: true,
        socialLink: true,
        photo: true,
        event: { select: { name: true, date: true } },
      },
      orderBy: { approvedAt: "desc" },
    }).catch(() => []),
    prisma.testimonial.findMany({
      where: { category: "volunteer", isApproved: true },
      orderBy: { displayOrder: "asc" },
    }).catch(() => []),
    getCachedSiteSettings(),
  ]);

  const rolesValue = settings.volunteer_roles;
  const roleList: string[] = rolesValue ? JSON.parse(rolesValue) : [
    "Event Operations",
    "Registration Desk",
    "Crowd Management",
    "Guest Relations",
    "Media & Photography",
    "Social Media",
    "Creative Team",
    "Logistics",
    "Technical Support",
    "Hospitality",
  ];

  const opportunities = [
    {
      title: "Stage & Production Operations",
      department: "Production",
      description: "Stage geometry, artist run-of-show timing, and equipment changeovers.",
      requirements: "Punctuality, stamina, and composure under high energy.",
      availability: "Active / Open",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Lighting & Technical Rigging",
      department: "Technical",
      description: "Synchronized crimson cues, ambient lighting rigs, and projection support.",
      requirements: "Interest or background in DMX lighting, AV, or electrical setups.",
      availability: "Limited Spots",
      badgeColor: "bg-red/10 text-red border-red/20",
    },
    {
      title: "Gate Control & QR Verification",
      department: "Operations",
      description: "High-speed live ticket scanners, cryptographic token validation, and wristband issuance.",
      requirements: "Tech-savvy, reliable, and attentive under arrival influx.",
      availability: "Active / Open",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Guest Relations & VIP Hospitality",
      department: "Hospitality",
      description: "Attendee hospitality, VIP lounge coordination, and artist concierge.",
      requirements: "Courteous etiquette, warm demeanor, and active communication.",
      availability: "Filling Fast",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "Media, Film & Photography Crew",
      department: "Media",
      description: "Low-light nocturnal photography, short-form video reels, and backstage documentation.",
      requirements: "Own camera rig or gimbal with an eye for dark, cinematic aesthetics.",
      availability: "Active / Open",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Thematic Decor & Set Construction",
      department: "Creative",
      description: "Set props, atmospheric draping, floral styling, and experiential photo zones.",
      requirements: "Hands-on crafting sense and pre-event setup availability.",
      availability: "Active / Open",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  const pillars = [
    {
      num: "01",
      title: "Stagecraft & Rigging",
      detail: "Hands-on acoustic geometry, DMX lighting rigs, and run-of-show execution.",
    },
    {
      num: "02",
      title: "Live Operations & Access",
      detail: "Gate control, cryptographic QR validation, crowd flow, and real-time radio command.",
    },
    {
      num: "03",
      title: "Industry & Creative Access",
      detail: "Direct collaboration with prominent electronic artists, sound engineers, and founders.",
    },
    {
      num: "04",
      title: "Cryptographic Credentials",
      detail: "Official tamper-proof digital ID, accreditation badge, and verified experience certificate.",
    },
  ];

  return (
    <PageStatusGate
      pageKey="volunteers"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <div className="py-12 md:py-20 relative overflow-hidden space-y-20">
        {/* Ambient atmospheric lighting glow */}
        <div className="absolute top-1/4 -right-24 w-[480px] h-[480px] rounded-full bg-red filter blur-[160px] opacity-[0.14] pointer-events-none" />
        <div className="absolute top-2/3 -left-20 w-[380px] h-[380px] rounded-full bg-red filter blur-[150px] opacity-[0.09] pointer-events-none" />

        {/* ─── 1. HERO: Clean, Commanding Editorial Header (Left-Aligned) ────── */}
        {isSectionEnabled(settings, "volunteers_section_apply_cta") && (
          <section className="container-velvt">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-dim border border-red/30 text-[11px] font-mono uppercase tracking-widest text-red">
                <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                <span>Production Recruitment 2026</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase text-white tracking-tight leading-[0.95] select-none">
                Be the Architect Behind the Atmosphere.
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-g5 leading-relaxed">
                Join the verified backstage crew behind VELVT productions in Silchar. Gain hands-on mastery in stage operations, live acoustics, lighting, and guest hospitality.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button href="/volunteers/register" variant="primary" size="md" className="px-6">
                  Apply for Crew Accreditation &rarr;
                </Button>
                <Button href="/verify" variant="outline" size="md" className="px-6">
                  Verify Credential
                </Button>
              </div>

              {/* Clean roles strip */}
              <div className="pt-4 flex flex-wrap items-center gap-2">
                {roleList.slice(0, 8).map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-g4 font-mono uppercase tracking-wider"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── 2. OPEN POSITIONS: Compact Scannable Grid ──────────────────────── */}
        {isSectionEnabled(settings, "volunteers_section_positions") && (
          <section className="container-velvt space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-red font-medium mb-1">
                  Active Roles
                </p>
                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight">
                  Open Disciplines
                </h2>
              </div>
              <p className="text-xs font-mono text-g5 uppercase tracking-wider">
                Select your focus for upcoming productions
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {opportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-g5 uppercase tracking-wider">{opp.department}</span>
                      <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider border ${opp.badgeColor}`}>
                        {opp.availability}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white group-hover:text-red transition-colors">
                      {opp.title}
                    </h3>

                    <p className="text-xs text-g4 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] space-y-1 text-left">
                    <span className="font-mono text-[10px] text-g5 uppercase tracking-wider block">
                      Requirements
                    </span>
                    <p className="text-xs text-g4 leading-relaxed">
                      {opp.requirements}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 3. THE PRODUCTION CRAFT: Minimalist Numeric Pillars (No Emojis!) ─ */}
        {isSectionEnabled(settings, "volunteers_section_skills") && (
          <section className="container-velvt space-y-8">
            <div className="max-w-xl space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-red font-medium">
                Accreditation
              </p>
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight">
                The Production Craft
              </h2>
              <p className="text-xs sm:text-sm text-g5 leading-relaxed pt-1">
                Real-world mastery in high-stakes nocturnal event engineering.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pillars.map((pillar) => (
                <div
                  key={pillar.num}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-red/40 hover:bg-white/[0.04] transition-all duration-300 space-y-3 group"
                >
                  <span className="font-mono font-bold text-xs text-red block">
                    {pillar.num}
                  </span>
                  <h3 className="font-display font-bold text-base uppercase tracking-wider text-white group-hover:text-red transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-g5 leading-relaxed">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 4. RECRUITMENT PROTOCOL: Clean 3-Step Summary ──────────────────── */}
        <section className="container-velvt">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1 text-left">
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">
                Ready to Enter the Underground?
              </h3>
              <p className="text-xs text-g5">
                Applications are reviewed on a rolling basis. All selected crew undergo orientation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button href="/volunteers/register" variant="primary" size="md" className="px-6">
                Submit Application &rarr;
              </Button>
              <Button href="/verify" variant="outline" size="md" className="px-6">
                Verify Existing ID
              </Button>
            </div>
          </div>
        </section>

        {/* ─── 5. APPLICATION STATUS TRACKER ─────────────────────────────────── */}
        <section className="container-velvt">
          <VolunteerApplicationTracker />
        </section>

        {/* ─── 6. VERIFIED VOLUNTEER REGISTRY PREVIEW ─────────────────────────── */}
        {isSectionEnabled(settings, "volunteers_section_registry") && volunteers.length > 0 && (
          <section className="container-velvt space-y-6 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">
                  Accredited Crew Registry ({volunteers.length})
                </h3>
                <p className="text-[11px] text-g5 font-mono uppercase tracking-wider">
                  Verified staff with tamper-proof cryptographic IDs
                </p>
              </div>
              <Button href="/verify" variant="outline" size="sm" className="uppercase tracking-wider font-bold">
                Verify Credential &rarr;
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {volunteers.map((v) => (
                <Link
                  key={v.id}
                  href={`/verify/${v.volunteerId || v.id}`}
                  className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-red/60 hover:bg-black/60 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black flex-shrink-0 flex items-center justify-center group-hover:border-red/40 transition-colors">
                      {v.photo ? (
                        <img src={v.photo} alt={v.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-bold text-white text-sm">
                          {v.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-white uppercase text-xs truncate group-hover:text-red transition-colors">
                        {v.fullName}
                      </h4>
                      <p className="text-[10px] font-mono text-red truncate">
                        {v.volunteerId || "VERIFIED CREW"}
                      </p>
                      <p className="text-[10px] font-mono text-g5 truncate">
                        {v.assignedRole}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-g5 group-hover:text-red transition-colors">&rarr;</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageStatusGate>
  );
}
