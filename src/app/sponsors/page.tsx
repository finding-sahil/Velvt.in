import { prisma } from "@/lib/db";
import { SponsorInquiryForm } from "./SponsorInquiryForm";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sponsors & Brand Partnerships — VELVT",
  description:
    "Partner with VELVT. Elevate your brand through bespoke nocturnal activations, demographic exposure, and immersive stage integrations in Silchar and Northeast India.",
};

export default async function SponsorsPage() {
  const [partners, testimonials, deckSetting] = await Promise.all([
    prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }).catch(() => []),
    prisma.testimonial.findMany({
      where: { category: "sponsor", isApproved: true },
      orderBy: { displayOrder: "asc" },
    }).catch(() => []),
    prisma.siteSetting.findUnique({
      where: { key: "sponsorship_deck_url" },
    }).catch(() => null),
  ]);

  const deckUrl = deckSetting?.value || null;

  const opportunities = [
    {
      icon: "⚡",
      title: "Mainstage & Naming Rights",
      description:
        "Co-brand our flagship stages, audio structures, and entrance portals with prominent arterial lighting and custom architectural signages.",
    },
    {
      icon: "🎭",
      title: "Experiential Activations",
      description:
        "Engage hundreds of attendees directly through bespoke sampling lounges, interactive photo chambers, dark gothic installations, and live experiential booths.",
    },
    {
      icon: "🎯",
      title: "High-Value Demographic Exposure",
      description:
        "Direct physical and emotional connection with Gen Z, creators, students, young professionals, and trendsetters across Silchar, Assam, and Northeast India.",
    },
    {
      icon: "📱",
      title: "Digital & Social Amplification",
      description:
        "Integrated promotion across Instagram campaigns, high-production teaser films, scannable digital passes, and post-event cinematic recaps.",
    },
    {
      icon: "🎟️",
      title: "VIP Hospitality & Passes",
      description:
        "Dedicated VIP access, reserved lounges, executive guest badges, and complimentary passes for your stakeholders and leadership team.",
    },
    {
      icon: "🔮",
      title: "Custom Curated Collaborations",
      description:
        "Co-develop themed menu items, limited merchandise, branded wristbands, or specialized production gear seamlessly integrated into the event lore.",
    },
  ];

  return (
    <div className="py-12 md:py-20 relative overflow-hidden min-h-screen">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-20 relative z-10">
        {/* Header Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            <span>Brand Partnerships &amp; Activations</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase text-white tracking-tight leading-[0.95]">
            Command The Night.
          </h1>

          <div className="w-16 h-0.5 bg-primary shadow-[0_0_14px_#c8102e]" />

          <p className="text-base sm:text-lg text-g5 leading-relaxed">
            VELVT creates sensory worlds that captivate audiences. By partnering with us, your brand integrates into unforgettable nocturnal narratives, culture-defining productions, and an active regional community.
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="#inquiry"
              className="px-6 py-3 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_25px_var(--red-glow)] transition-all"
            >
              Submit Sponsor Inquiry &rarr;
            </a>

            {deckUrl ? (
              <a
                href={deckUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <span>Download Sponsorship Deck (PDF)</span>
                <span>↓</span>
              </a>
            ) : (
              <a
                href="#inquiry"
                className="px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-all"
              >
                Request Official 2026 Deck
              </a>
            )}
          </div>
        </div>

        {/* Sponsorship Opportunities Grid */}
        <div className="space-y-10">
          <div className="max-w-xl">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Sponsorship Opportunities
            </h2>
            <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] my-3" />
            <p className="text-xs sm:text-sm text-g5 leading-relaxed">
              We design non-intrusive, immersive activations that leave attendees talking about your brand long after the music fades.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md hover:border-red/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.15)] transition-all duration-300 space-y-3 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-dim border border-red/40 flex items-center justify-center text-lg">
                    {opp.icon}
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-red transition-colors">
                    {opp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-g5 leading-relaxed">
                    {opp.description}
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-red uppercase tracking-widest">
                  Customizable Tier Available
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Partners / Brand Showcase */}
        {partners.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  Brand Showcase &amp; Past Partners
                </h2>
                <p className="text-xs text-g5 mt-1 font-mono uppercase tracking-wider">
                  Confirmed &amp; Authorized Collaborators
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-white/10 bg-black/40 hover:border-red/40 transition-all flex flex-col items-center justify-center text-center space-y-2 min-h-[100px] group"
                >
                  {p.logo ? (
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="max-h-12 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <span className="font-display font-bold text-sm uppercase text-white/90 group-hover:text-red transition-colors">
                      {p.name}
                    </span>
                  )}
                  {p.type && (
                    <span className="text-[9px] font-mono uppercase text-g5 tracking-wider">
                      {p.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sponsor Testimonials (if present) */}
        {testimonials.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-white/10">
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                What Partners Say
              </h2>
              <p className="text-xs text-g5 mt-1 font-mono uppercase tracking-wider">
                Feedback from brand directors &amp; collaborating sponsors
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-7 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4 relative"
                >
                  <p className="font-display text-lg sm:text-xl text-white italic leading-snug">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/[0.08]">
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
                      <p className="text-[11px] font-mono text-g5">
                        {t.authorRole} {t.company ? `• ${t.company}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sponsor Inquiry Form Section */}
        <div id="inquiry" className="pt-8 border-t border-white/10 space-y-8 scroll-mt-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red mb-2">
              <span>●</span>
              <span>Direct Production Desk</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Initiate Brand Partnership
            </h2>
            <p className="text-xs sm:text-sm text-g5 mt-1 leading-relaxed">
              Complete the inquiry form below. Our executive sponsorship team will connect with your brand representative directly.
            </p>
          </div>

          <div className="max-w-3xl">
            <SponsorInquiryForm deckUrl={deckUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
