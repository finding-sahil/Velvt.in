import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({
    where: { id },
  });

  if (!member) {
    return { title: "Team Member Not Found — VELVT" };
  }

  return {
    title: `${member.name} — ${member.role} | VELVT Core Team`,
    description:
      member.bio ||
      `Explore the creative portfolio and profile of ${member.name}, ${member.role} at VELVT.`,
  };
}

export default async function TeamMemberPortfolioPage({ params }: PageProps) {
  const { id } = await params;

  const member = await prisma.teamMember.findUnique({
    where: { id },
  });

  if (!member || !member.isPublished) {
    notFound();
  }

  // Fetch other team members for the bottom explore section
  const otherMembers = await prisma.teamMember.findMany({
    where: {
      isPublished: true,
      id: { not: member.id },
    },
    take: 3,
    orderBy: { displayOrder: "asc" },
  });

  // Parse social links
  let socials: Record<string, string> = {};
  try {
    if (member.socialLinks) socials = JSON.parse(member.socialLinks);
  } catch {
    socials = {};
  }

  const instagramUrl = socials.instagram
    ? socials.instagram.startsWith("http")
      ? socials.instagram
      : `https://instagram.com/${socials.instagram.replace("@", "")}`
    : "https://instagram.com/velvt.in";

  const isFounder =
    member.category?.toLowerCase().includes("founder") ||
    member.role.toLowerCase().includes("founder") ||
    member.name.toLowerCase().includes("sahil");

  // Parse highlights
  let highlightItems: string[] = [];
  if (member.highlights) {
    try {
      const parsed = JSON.parse(member.highlights);
      if (Array.isArray(parsed)) highlightItems = parsed;
    } catch {
      highlightItems = member.highlights
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="container-velvt space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-g5">
          <Link
            href="/team"
            className="hover:text-red transition-colors flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Core Team</span>
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">{member.name}</span>
        </div>

        {/* Hero Portfolio Profile Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Portrait & Quick Credentials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black/60 backdrop-blur-xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.8)] group">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black">
                {member.portrait ? (
                  <img
                    src={member.portrait}
                    alt={member.name}
                    className="w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-rich-charcoal via-black to-black">
                    <div className="w-24 h-24 rounded-full border border-red/40 bg-red/10 flex items-center justify-center shadow-[0_0_25px_var(--red-glow)]">
                      <span className="font-display font-black text-4xl text-white">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Status Badges Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  {isFounder ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-red/80 text-[10px] font-mono font-bold uppercase tracking-widest text-red shadow-[0_0_15px_var(--red-glow)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                      FOUNDER &amp; VISIONARY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-widest text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-red" />
                      {member.category}
                    </span>
                  )}

                  {member.joinedYear && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-g5 bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
                      {member.joinedYear}
                    </span>
                  )}
                </div>
              </div>

              {/* Social Channels Bar */}
              <div className="p-4 pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-red/20 border border-white/10 hover:border-red/50 text-xs font-mono text-white transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5 text-red" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram</span>
                  </a>

                  {socials.linkedin && (
                    <a
                      href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/50 text-xs font-mono text-white transition-all duration-200"
                    >
                      <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>

                {member.portfolioUrl && (
                  <a
                    href={member.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-red hover:text-white uppercase tracking-wider underline underline-offset-4"
                  >
                    <span>Portfolio</span>
                    <span>&nearr;</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Philosophy, Mission & Highlights */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red">
                <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                <span>{member.role}</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight leading-none">
                {member.name}
              </h1>

              <p className="text-sm font-mono tracking-widest uppercase text-g5">
                VELVT — {member.category}
              </p>
            </div>

            {/* Philosophy / Personal Quote */}
            {member.quote ? (
              <div className="p-6 rounded-2xl border border-red/30 bg-red/[0.04] relative">
                <span className="absolute -top-3 left-6 px-2 py-0.5 rounded bg-black border border-red/40 text-[10px] font-mono text-red uppercase tracking-wider">
                  Vision &amp; Philosophy
                </span>
                <p className="font-display text-xl sm:text-2xl text-white italic tracking-wide leading-snug">
                  &ldquo;{member.quote}&rdquo;
                </p>
              </div>
            ) : member.bio ? (
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <p className="font-display text-xl text-white italic tracking-wide">
                  &ldquo;{member.bio}&rdquo;
                </p>
              </div>
            ) : null}

            {/* Biography / Narrative */}
            <div className="space-y-4 text-g6 text-sm sm:text-base leading-relaxed">
              <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
                <span className="w-2 h-[2px] bg-red" />
                <span>About &amp; Responsibilities</span>
              </h2>
              <p>
                As {member.role} at VELVT, {member.name} plays a defining role in shaping
                the sensory experiences, production standards, and community atmosphere that define
                our events in Silchar and beyond.
              </p>
              {member.bio && (
                <p className="text-g6 leading-relaxed">
                  {member.bio}
                </p>
              )}
            </div>

            {/* Specialties & Domains */}
            {highlightItems.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-[2px] bg-red" />
                  <span>Specialties &amp; Domains</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {highlightItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white/90"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_25px_var(--red-glow)] transition-all flex items-center gap-2"
              >
                <span>Connect On Instagram</span>
                <span>&rarr;</span>
              </a>

              <Link
                href="/volunteers"
                className="px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-all"
              >
                Work With Our Crew
              </Link>
            </div>
          </div>
        </div>

        {/* Explore Other Core Team Members */}
        {otherMembers.length > 0 && (
          <div className="pt-16 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-red">
                  Collective Talent
                </p>
                <h3 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                  Meet Other Core Members
                </h3>
              </div>
              <Link
                href="/team"
                className="text-xs font-mono uppercase tracking-wider text-g5 hover:text-white transition-colors"
              >
                View Full Team &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {otherMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/team/${m.id}`}
                  className="group rounded-2xl border border-white/10 bg-black/40 hover:bg-black/70 hover:border-red/40 p-4 transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 group-hover:border-red flex-shrink-0 bg-black">
                    {m.portrait ? (
                      <img
                        src={m.portrait}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-white text-lg font-bold">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-white uppercase text-base group-hover:text-red transition-colors truncate">
                      {m.name}
                    </p>
                    <p className="text-[11px] font-mono text-g5 uppercase truncate">
                      {m.role}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
