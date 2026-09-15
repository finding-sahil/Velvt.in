import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { TeamMember } from "@prisma/client";

interface TeamPreviewSectionProps {
  members: TeamMember[];
}

export function TeamPreviewSection({ members }: TeamPreviewSectionProps) {
  return (
    <section className="py-12 md:py-20 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-10 relative z-10">
        <SectionHeading
          title="Core Team."
          subtitle="The founders, curators, and production leads crafting every experience."
        />

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            members.length === 5
              ? "md:grid-cols-3 lg:grid-cols-5"
              : "md:grid-cols-2 lg:grid-cols-4"
          } gap-5 sm:gap-6`}
        >
          {members.map((member, index) => {
            let socials: {
              instagram?: string;
              linkedin?: string;
              twitter?: string;
              phone?: string;
              email?: string;
            } | null = null;
            if (member.socialLinks) {
              try {
                socials = JSON.parse(member.socialLinks);
              } catch {}
            }

            const isFounder =
              member.role.toLowerCase().includes("founder") ||
              member.category?.toLowerCase() === "founders";
            const instagramUrl =
              socials?.instagram && socials.instagram.trim() !== ""
                ? socials.instagram.startsWith("http")
                  ? socials.instagram
                  : `https://instagram.com/${socials.instagram.replace("@", "")}`
                : "https://www.instagram.com/velvt.in";

            return (
              <div
                key={member.id}
                className={`group relative rounded-2xl overflow-hidden bg-[#0a0a0d] border transition-all duration-500 flex flex-col justify-between p-5 min-h-[440px] sm:min-h-[460px] ${
                  isFounder
                    ? "border-red/40 shadow-[0_8px_30px_rgba(200,16,46,0.2)] hover:border-red hover:shadow-[0_16px_45px_rgba(200,16,46,0.4)]"
                    : "border-white/[0.08] hover:border-white/30 hover:shadow-[0_12px_35px_rgba(0,0,0,0.8)]"
                }`}
              >
                {/* Top specular hairline accent */}
                <div
                  className={`absolute top-0 inset-x-0 h-[1px] transition-all duration-500 z-20 ${
                    isFounder
                      ? "bg-gradient-to-r from-transparent via-red to-transparent"
                      : "bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-red/60"
                  }`}
                />

                {/* ─── Background Portrait Layer ─── */}
                {member.portrait ? (
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={member.portrait}
                      alt={member.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-[1.05] brightness-[0.9] group-hover:brightness-100"
                    />
                    {/* Multi-stage cinema vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 via-45% to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#12080a] via-black to-black flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-red/30 bg-black/60 flex items-center justify-center">
                      <span className="font-display font-bold text-3xl text-white">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* ─── Top Header Bar: Pill & Order Index ─── */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  {isFounder ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-red/60 text-[9px] font-mono font-bold uppercase tracking-widest text-red shadow-[0_0_12px_rgba(200,16,46,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                      <span>FOUNDER</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-red/60" />
                      <span>CORE TEAM</span>
                    </div>
                  )}

                  <span className="font-mono text-[11px] text-white/50 tracking-widest font-semibold bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* ─── Bottom Content: Name, Role, Social Toolbar ─── */}
                <div className="relative z-10 flex flex-col justify-end space-y-3.5 w-full">
                  <div className="space-y-1.5">
                    {/* Prominent Name: Kept on the exact same horizontal line across all cards */}
                    <h3 className="font-display font-black text-2xl sm:text-[1.65rem] text-white uppercase tracking-[0.04em] leading-none group-hover:text-red transition-colors duration-300">
                      {member.name}
                    </h3>

                    {/* Clean, Unclipped Role Designation: standardized height aligns names across cards */}
                    <div className="min-h-[46px] sm:min-h-[52px] flex items-start">
                      <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-red font-semibold leading-snug pt-0.5">
                        {member.role}
                      </p>
                    </div>

                    {/* Optional Bio / Motto: standardized height ensures perfectly aligned baseline */}
                    <div className="min-h-[18px] flex items-center">
                      {member.bio ? (
                        <p className="text-[11px] text-g5 italic font-sans leading-tight line-clamp-1">
                          &ldquo;{member.bio}&rdquo;
                        </p>
                      ) : (
                        <span className="invisible text-[11px] select-none pointer-events-none">&nbsp;</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Bar: Consistent Across All Cards */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Instagram Button */}
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 px-2.5 rounded-full bg-white/[0.06] hover:bg-red/20 border border-white/10 hover:border-red/40 flex items-center gap-1.5 text-[10px] font-mono text-white/80 hover:text-white transition-all duration-200"
                        title={`${member.name} on Instagram`}
                      >
                        <svg className="w-3 h-3 fill-current text-red" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>Instagram</span>
                      </a>

                      {/* Additional Links if present */}
                      {socials?.linkedin && (
                        <a
                          href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/40 flex items-center justify-center text-g5 hover:text-sky-400 transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </div>

                    <Link
                      href={`/team/${member.id}`}
                      className="h-7 px-3 rounded-full bg-red/15 hover:bg-red text-red hover:text-white border border-red/40 hover:border-red flex items-center gap-1.5 text-[10px] font-mono tracking-wider font-semibold uppercase transition-all duration-200 shadow-[0_0_10px_var(--red-glow)]"
                    >
                      <span>Profile</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 text-center">
          <Button href="/team" variant="secondary" size="md">
            <span>Explore Core Team</span>
            <span>&rarr;</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
