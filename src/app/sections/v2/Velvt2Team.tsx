import Link from "next/link";
import type { TeamMember } from "@prisma/client";

interface Velvt2TeamProps {
  members: TeamMember[];
}

export function Velvt2Team({ members }: Velvt2TeamProps) {
  if (!members || members.length === 0) return null;

  return (
    <section className="py-20 md:py-28 relative">
      <div className="container-velvt">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2 font-medium">
              Leadership
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
              Core Team
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-sans mt-3 leading-relaxed">
              The curators, producers, and operational leads crafting every experience.
            </p>
          </div>

          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-white transition-colors"
          >
            <span>View Full Team</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.slice(0, 8).map((member) => (
            <div
              key={member.id}
              className="group rounded-lg overflow-hidden bg-[#0e0e0e] border border-white/[0.08] hover:border-white/25 transition-all duration-300 flex flex-col"
            >
              {/* Portrait */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                {member.portrait ? (
                  <img
                    src={member.portrait}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover filter contrast-[1.03] transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                    <span className="font-display font-bold text-3xl text-neutral-600">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Info */}
              <div className="p-5 space-y-1.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                    {member.name}
                  </h3>
                  <p className="text-[11px] font-mono text-red uppercase tracking-wider">
                    {member.role}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <Link
                    href={`/team/${member.id}`}
                    className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                  >
                    Profile →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
