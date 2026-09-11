import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
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

            const hasSocials = Boolean(
              socials &&
                (socials.instagram ||
                  socials.linkedin ||
                  socials.twitter ||
                  socials.phone ||
                  socials.email)
            );

            return (
              <div
                key={member.id}
                className="group relative rounded-2xl overflow-hidden bg-[#0c0c10] border border-white/[0.08] hover:border-red/50 transition-all duration-500 hover:shadow-[0_16px_40px_-10px_rgba(200,16,46,0.35)] flex flex-col justify-between p-5 min-h-[410px] sm:min-h-[430px]"
              >
                {/* Top specular hairline */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red/40 to-transparent group-hover:via-red transition-all duration-500 z-20" />

                {/* Bottom accent glow */}
                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                {/* Hover ambient spotlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-red/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                {/* ─── Background Art: Portrait or Stylized Medallion ─── */}
                {member.portrait ? (
                  <div className="absolute inset-0 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-100 group-hover:scale-105 filter contrast-[1.08] brightness-[0.85] group-hover:brightness-100"
                      style={{ backgroundImage: `url(${member.portrait})` }}
                    />
                    {/* Deep multi-stage dark vignette for 100% text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 via-50% to-black/35" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                  </div>
                ) : (
                  <div className="absolute inset-0 overflow-hidden bg-[#0a0a0e]">
                    {/* Crimson ambient aura */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red/15 rounded-full blur-3xl group-hover:bg-red/25 transition-all duration-700 pointer-events-none" />

                    {/* Fine technical matrix grid */}
                    <div
                      className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-500"
                      style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Stylized Executive Monogram Seal */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-6 pointer-events-none">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-red/30 bg-gradient-to-br from-red-950/40 via-black to-[#0d0d12] shadow-[0_0_30px_rgba(200,16,46,0.2)] group-hover:shadow-[0_0_40px_rgba(200,16,46,0.38)] group-hover:border-red/60 transition-all duration-500 flex items-center justify-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/[0.08] flex items-center justify-center bg-black/40">
                            <span className="font-display font-black text-3xl sm:text-4xl text-white/90 group-hover:text-red transition-colors duration-300">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono tracking-[0.25em] text-red-400/70 uppercase mt-3.5 group-hover:text-red transition-colors">
                        VELVT // EXEC
                      </span>
                    </div>

                    {/* Dark gradient for bottom content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 via-35% to-transparent" />
                  </div>
                )}

                {/* ─── Top Header Bar ─── */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/90 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                    <span>CORE TEAM</span>
                  </div>
                  <span className="font-mono text-[11px] text-white/40 tracking-widest font-semibold">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* ─── Bottom Content: Role, Name, Social Toolbar ─── */}
                <div className="relative z-10 flex flex-col justify-end space-y-3 w-full">
                  <div className="space-y-1.5">
                    {/* High-contrast Role Tag with red accent */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red/15 backdrop-blur-md border border-red/40 text-red-300 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase shadow-[0_2px_10px_rgba(0,0,0,0.5)] self-start max-w-full">
                      <span className="w-1 h-1 rounded-full bg-red shrink-0" />
                      <span className="line-clamp-2 leading-tight">{member.role}</span>
                    </div>

                    {/* Bold Name */}
                    <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight group-hover:text-red transition-colors duration-300 line-clamp-1">
                      {member.name}
                    </h3>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 min-h-[40px]">
                    {hasSocials && socials ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {socials.instagram && (
                          <a
                            href={
                              socials.instagram.startsWith("http")
                                ? socials.instagram
                                : `https://instagram.com/${socials.instagram.replace("@", "")}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-pink-500/15 border border-white/10 hover:border-pink-500/60 flex items-center justify-center text-g5 hover:text-pink-400 transition-all duration-200"
                            title="Instagram"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                        {socials.linkedin && (
                          <a
                            href={
                              socials.linkedin.startsWith("http")
                                ? socials.linkedin
                                : `https://linkedin.com/in/${socials.linkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-sky-500/15 border border-white/10 hover:border-sky-500/60 flex items-center justify-center text-g5 hover:text-sky-400 transition-all duration-200"
                            title="LinkedIn"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                        )}
                        {socials.phone && (
                          <a
                            href={`https://wa.me/${socials.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/60 flex items-center justify-center text-g5 hover:text-emerald-400 transition-all duration-200"
                            title={`WhatsApp: ${socials.phone}`}
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 6L0 24l6.2-1.63a11.93 11.93 0 0 0 5.86 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.43zM12.07 21.87h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.9 9.9 0 0 1-1.52-5.24c0-5.48 4.46-9.94 9.95-9.94 2.65 0 5.15 1.03 7.03 2.91a9.88 9.88 0 0 1 2.91 7.02c0 5.49-4.46 9.91-9.95 9.91zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
                            </svg>
                          </a>
                        )}
                        {socials.twitter && (
                          <a
                            href={
                              socials.twitter.startsWith("http")
                                ? socials.twitter
                                : `https://x.com/${socials.twitter.replace("@", "")}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 hover:border-white/60 flex items-center justify-center text-g5 hover:text-white transition-all duration-200 text-xs font-bold"
                            title="Twitter / X"
                          >
                            𝕏
                          </a>
                        )}
                        {socials.email && (
                          <a
                            href={`mailto:${socials.email}`}
                            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-red/15 border border-white/10 hover:border-red/60 flex items-center justify-center text-g5 hover:text-red-400 transition-all duration-200 text-xs"
                            title={`Email: ${socials.email}`}
                          >
                            ✉️
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                        <span>OFFICIAL CREDENTIAL</span>
                      </div>
                    )}

                    <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">
                      VELVT
                    </span>
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
