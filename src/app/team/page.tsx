import { prisma } from "@/lib/db";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Core Team — VELVT",
  description: "Meet the people behind VELVT — shaping the vision and bringing every experience to life.",
};

export const revalidate = 0;

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
  }).catch(() => []);

  // Group by category
  type MemberType = (typeof members)[number];
  const categories = members.reduce<Record<string, MemberType[]>>((acc, m) => {
    const cat = m.category || "Core Team";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  return (
    <div className="py-12 md:py-20 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvet space-y-16">
        <SectionHeading
          title="Core Team."
          subtitle="The directors, creators, and operators shaping the vision and bringing each nocturnal experience to life."
        />

        {members.length === 0 ? (
          <EmptyState
            title="Core Team profiles coming soon"
            description="Core team member profiles will be added here once published."
          />
        ) : (
          <div className="space-y-16">
            {Object.entries(categories).map(([category, catMembers]) => (
              <div key={category} className="space-y-8">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
                  <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">
                    {category}
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {catMembers.map((member) => {
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

                    return (
                      <div
                        key={member.id}
                        className="group relative overflow-hidden rounded-[20px] bg-white/[0.05] border border-white/10 hover:border-red/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.18)] transition-all duration-500 flex flex-col"
                      >
                        <div className="aspect-[3/4] relative bg-black/60 overflow-hidden">
                          {member.portrait ? (
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                              style={{ backgroundImage: `url(${member.portrait})` }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-display font-black text-6xl text-white/10">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-end relative z-10">
                          <h4 className="font-display font-bold text-lg text-white uppercase tracking-tight mb-0.5">
                            {member.name}
                          </h4>
                          <p className="text-xs font-mono text-red uppercase tracking-wider mb-2 font-medium">
                            {member.role}
                          </p>
                          {member.bio && (
                            <p className="text-xs text-g6 leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity mb-3">
                              {member.bio}
                            </p>
                          )}

                          {/* Social & Contact Links on Card */}
                          {socials && (socials.instagram || socials.linkedin || socials.twitter || socials.phone || socials.email) && (
                            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08] flex-wrap">
                              {socials.instagram && (
                                <a
                                  href={socials.instagram.startsWith("http") ? socials.instagram : `https://instagram.com/${socials.instagram.replace("@", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-g5 hover:text-white hover:border-red hover:bg-red-dim transition-all text-xs"
                                  title="Instagram"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                </a>
                              )}
                              {socials.linkedin && (
                                <a
                                  href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-g5 hover:text-white hover:border-blue-400 hover:bg-blue-500/10 transition-all text-xs"
                                  title="LinkedIn"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                  </svg>
                                </a>
                              )}
                              {socials.twitter && (
                                <a
                                  href={socials.twitter.startsWith("http") ? socials.twitter : `https://x.com/${socials.twitter.replace("@", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-g5 hover:border-white hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
                                  title="Twitter / X"
                                >
                                  𝕏
                                </a>
                              )}
                              {socials.phone && (
                                <a
                                  href={`https://wa.me/${socials.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 hover:border-emerald-400 hover:bg-emerald-600/20 hover:text-white transition-all text-xs"
                                  title={`WhatsApp / Contact: ${socials.phone}`}
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                  </svg>
                                </a>
                              )}
                              {socials.email && (
                                <a
                                  href={`mailto:${socials.email}`}
                                  className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-g5 hover:text-white hover:border-red hover:bg-red-dim transition-all text-xs"
                                  title={`Email: ${socials.email}`}
                                >
                                  ✉️
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
