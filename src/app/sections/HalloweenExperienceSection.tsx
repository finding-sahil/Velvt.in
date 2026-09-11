import Link from "next/link";

export interface ExperienceHighlightItem {
  icon: string;
  tag: string;
  title: string;
  description: string;
  href?: string;
}

export const defaultPillars: ExperienceHighlightItem[] = [
  {
    icon: "🕯️",
    tag: "Atmosphere",
    title: "The Cursed Chamber",
    description: "Sub-zero fog, lighting monoliths, and surreal gothic installations.",
  },
  {
    icon: "🎭",
    tag: "Dress Code",
    title: "Gothic Masquerade",
    description: "Dark tailoring, crushed velvt, and Venetian masquerade masks.",
  },
  {
    icon: "🔮",
    tag: "Music & Sound",
    title: "Midnight Soundscapes",
    description: "Darkwave, industrial rhythm, and driving underground beats.",
  },
  {
    icon: "🍸",
    tag: "Cocktails & Bar",
    title: "Themed Mixology",
    description: "Dry-ice botanical mixology and curated sensory refreshments.",
  },
];

interface HalloweenExperienceSectionProps {
  title?: string;
  dossierHref?: string;
  dossierLabel?: string;
  highlights?: ExperienceHighlightItem[];
}

export function HalloweenExperienceSection({
  title = "Experience Highlights.",
  dossierHref = "/events/velvt-curse-2-o",
  dossierLabel = "Production Dossier",
  highlights,
}: HalloweenExperienceSectionProps) {
  const items = highlights && highlights.length > 0 ? highlights : defaultPillars;

  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      <div className="container-velvt relative space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="section-title">
              {title}
            </h2>
            <div className="red-rule" />
          </div>
          {dossierHref && (
            <Link
              href={dossierHref}
              className="text-xs font-mono text-red hover:underline uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <span>{dossierLabel}</span>
              <span>&rarr;</span>
            </Link>
          )}
        </div>

        {/* UNTOLDSURI Glass Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((p, i) => {
            const itemHref = p.href || dossierHref || "/events";
            return (
              <Link
                key={i}
                href={itemHref}
                className="glass-card p-5 flex flex-col justify-between group cursor-pointer hover:border-red/30 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                      {p.icon || "✦"}
                    </span>
                    {p.tag && (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-red bg-red-dim px-2 py-0.5 rounded-full border border-red-glow">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base text-white group-hover:text-red transition-colors tracking-wide uppercase">
                    {p.title}
                  </h3>
                  <p className="text-xs text-g5 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
