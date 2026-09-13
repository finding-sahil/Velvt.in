import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { isSectionEnabled } from "@/lib/section-switchboard";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Volunteers & Production Crew — VELVT",
  description:
    "Join the VELVT production crew. Gain hands-on experience in event management, sensory architecture, and stage operations in Silchar, Assam.",
};

export default async function VolunteersPage() {
  const { status, customTitle, customSubtitle } = await getPageStatus("volunteers");

  const [volunteers, testimonials, siteSettings] = await Promise.all([
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
    prisma.siteSetting.findMany().catch(() => []),
  ]);

  const settings: Record<string, string> = {};
  for (const s of siteSettings) {
    settings[s.key] = s.value;
  }

  const rolesSetting = siteSettings.find((s) => s.key === "volunteer_roles");
  const roleList: string[] = rolesSetting ? JSON.parse(rolesSetting.value) : [
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
      description: "Assist production leads with stage geometry, artist run-of-show timing, and equipment changeovers.",
      requirements: "High stamina, punctuality, and ability to stay calm in high-energy environments.",
      availability: "Active / Recieving Applications",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Guest Relations & VIP Hospitality",
      department: "Hospitality",
      description: "Welcome attendees, manage VIP lounge coordination, and deliver premium attendee hospitality.",
      requirements: "Warm interpersonal demeanor, active communication, and courteous etiquette.",
      availability: "Filling Fast",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    {
      title: "Gate Control & Digital QR Verification",
      department: "Security & Operations",
      description: "Operate high-speed live ticket scanners, authenticate encrypted tokens, and issue security wristbands.",
      requirements: "Tech-savvy, detail-oriented, and reliable under high arrival influx.",
      availability: "Active / Open",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Visuals, Lighting & Technical Rigging",
      department: "Technical",
      description: "Assist lighting technicians and projection engineers in executing synchronized crimson and ambient lighting cues.",
      requirements: "Interest or background in live sound, DMX lighting, or electrical setups.",
      availability: "Limited Spots",
      badgeColor: "bg-red/10 text-red border-red/30",
    },
    {
      title: "Media, Film & Photography Crew",
      department: "Media & PR",
      description: "Capture low-light nocturnal photography, short-form video reels, and behind-the-scenes moments.",
      requirements: "Own camera/rig (or phone gimbal) with an eye for dark, cinematic aesthetics.",
      availability: "Active / Open",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Thematic Decor & Set Construction",
      department: "Creative",
      description: "Bring the gothic lore to life by installing stage props, floral styling, atmospheric drapes, and interactive photo zones.",
      requirements: "Hands-on crafting enthusiasm, visual sense, and pre-event setup availability.",
      availability: "Active / Open",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  const gains = [
    {
      icon: "🗣️",
      title: "Communication",
      detail: "Master real-time crowd and guest hospitality, cross-team radio briefing, and VIP interactions.",
    },
    {
      icon: "🤝",
      title: "Teamwork",
      detail: "Sync seamlessly with multidisciplinary crew members in high-stakes, fast-paced event scenarios.",
    },
    {
      icon: "⚡",
      title: "Leadership",
      detail: "Step up to lead specialized zones, guide volunteer squads, and take ownership of operational bottlenecks.",
    },
    {
      icon: "📋",
      title: "Event Management",
      detail: "Gain first-hand mastery of crowd flow, scheduling, gate operations, emergency protocols, and run-of-show.",
    },
    {
      icon: "🌐",
      title: "Networking",
      detail: "Connect directly with prominent founders, artists, performers, sound engineers, and corporate partners.",
    },
    {
      icon: "🎛️",
      title: "Production Experience",
      detail: "Real-world experience in acoustic arrays, architectural lighting rigs, and underground stagecraft.",
    },
  ];

  return (
    <PageStatusGate
      pageKey="volunteers"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <div className="py-12 md:py-20 relative overflow-hidden space-y-24">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

        {/* Hero / Apply Section */}
        {isSectionEnabled(settings, "volunteers_section_apply_cta") && (
          <section className="container-velvt space-y-10">
            <SectionHeading
              title="Production Crew & Volunteers."
              subtitle="The heartbeat of every VELVT nocturnal production. Join our verified crew, gain hands-on production mastery, and shape culture."
            />

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              <div className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red">
                    <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                    <span>Official Recruitment 2026</span>
                  </div>

                  <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-white tracking-tight leading-tight">
                    Be the Architect Behind the Atmosphere.
                  </h2>

                  <p className="text-sm sm:text-base text-muted leading-relaxed">
                    VELVT is seeking dedicated, creative, and operationally minded individuals to join the production backbone of CURSE 2.O and upcoming experiential productions in Silchar.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-xs font-mono uppercase tracking-wider text-g5">
                    Roles Open For Application:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roleList.slice(0, 7).map((role) => (
                      <span
                        key={role}
                        className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-g4 font-mono"
                      >
                        {role}
                      </span>
                    ))}
                    {roleList.length > 7 && (
                      <span className="px-3 py-1 rounded-full bg-red-dim border border-red-glow text-xs text-red font-mono">
                        +{roleList.length - 7} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply / Criteria Card */}
              <div className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-white">
                    Recruitment Protocol
                  </h3>
                  <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e]" />

                  <ul className="space-y-3 text-sm text-g5">
                    <li className="flex items-start gap-3">
                      <span className="text-red font-mono font-bold mt-0.5">01</span>
                      <span>Must be available for pre-event orientation and technical rehearsals.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red font-mono font-bold mt-0.5">02</span>
                      <span>No prior experience required — passion, punctuality, and composure are paramount.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red font-mono font-bold mt-0.5">03</span>
                      <span>Selected crew receive official credentials, access, and verified certificates.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Button href="/volunteers/register" variant="primary" size="lg" className="w-full justify-center">
                    Apply for Crew Accreditation &rarr;
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-g5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Verified volunteers receive tamper-proof cryptographic badges and official experience certificates.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 2: What You'll Gain */}
        {isSectionEnabled(settings, "volunteers_section_skills") && (
          <section className="container-velvt space-y-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red mb-3">
                <span>●</span>
                <span>Professional Growth</span>
              </div>
              <h2 className="section-title">
                What You&apos;ll Gain.
              </h2>
              <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] my-3" />
              <p className="text-sm sm:text-base text-g5 leading-relaxed">
                Volunteering at VELVT is not simple labor — it is an intensive, high-reward incubator for leadership, event production, and creative collaboration.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gains.map((gain, idx) => (
                <div
                  key={idx}
                  className="p-7 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md hover:border-red/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.15)] transition-all space-y-3 group"
                >
                  <div className="text-3xl mb-2">{gain.icon}</div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-red transition-colors">
                    {gain.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-g5 leading-relaxed">
                    {gain.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Volunteer Opportunities (CMS-Managed Roles) */}
        {isSectionEnabled(settings, "volunteers_section_positions") && (
          <section className="container-velvt space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red mb-3">
                  <span>●</span>
                  <span>Active Roles</span>
                </div>
                <h2 className="section-title">
                  Volunteer Opportunities.
                </h2>
                <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] my-3" />
                <p className="text-sm sm:text-base text-g5 leading-relaxed">
                  Review available positions for our upcoming productions in Silchar. Apply early to secure your preferred specialization.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-7 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-white/20 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-g5 uppercase tracking-wider">{opp.department}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${opp.badgeColor}`}>
                        {opp.availability}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white">
                      {opp.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-g5 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <p className="text-[10px] font-mono text-g5 uppercase tracking-wider">Requirements:</p>
                    <p className="text-xs text-g6 italic">{opp.requirements}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Volunteer Testimonials (if present) */}
        {testimonials.length > 0 && (
          <section className="container-velvt space-y-10">
            <div className="max-w-xl">
              <h2 className="section-title">
                Crew Testimonials.
              </h2>
              <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] my-3" />
              <p className="text-xs sm:text-sm text-g5 leading-relaxed">
                Voices from past volunteers and operational crew leaders who powered our flagship productions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-7 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4 flex flex-col justify-between"
                >
                  <p className="font-display text-lg text-white italic leading-snug">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-3 border-t border-white/[0.08]">
                    {t.avatarUrl && (
                      <img
                        src={t.avatarUrl}
                        alt={t.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-white/15"
                      />
                    )}
                    <div>
                      <h4 className="font-display font-bold text-sm uppercase text-white">
                        {t.authorName}
                      </h4>
                      <p className="text-[11px] font-mono text-red">
                        {t.authorRole}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Verified Volunteer Registry Preview */}
        {isSectionEnabled(settings, "volunteers_section_registry") && volunteers.length > 0 && (
          <section className="container-velvt space-y-8 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-white">
                  Verified Volunteer Registry ({volunteers.length})
                </h3>
                <p className="text-xs text-g5 mt-1 font-mono uppercase tracking-wider">
                  Active accredited staff with verified cryptographic IDs
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {volunteers.map((v) => (
                <div
                  key={v.id}
                  className="p-5 rounded-2xl border border-white/10 bg-black/40 hover:border-red/40 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-black flex-shrink-0 flex items-center justify-center">
                    {v.photo ? (
                      <img src={v.photo} alt={v.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-bold text-white text-base">
                        {v.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-white uppercase text-sm truncate">
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
              ))}
            </div>
          </section>
        )}
      </div>
    </PageStatusGate>
  );
}
