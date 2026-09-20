import type { Testimonial } from "@prisma/client";

interface Velvt2TestimonialsProps {
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS = [
  {
    id: "v2-1",
    quote: "Redefined nocturnal live culture in Assam — acoustic depth and pure gothic discipline.",
    authorName: "Ananya Roy",
    authorRole: "VIP Attendee",
    company: "Nocturne Chronicles",
  },
  {
    id: "v2-2",
    quote: "A masterclass in spatial curation and dark elegance. Pure theater.",
    authorName: "Meenakshi Das",
    authorRole: "Creative Director",
    company: "Prism Collective",
  },
  {
    id: "v2-3",
    quote: "Unmatched cultural prestige among creative audiences. Flawless gate execution.",
    authorName: "Vikram Sengupta",
    authorRole: "Managing Director",
    company: "Elysian Hospitality",
  },
  {
    id: "v2-4",
    quote: "Top-tier crew credentials and production discipline. Pure adrenaline.",
    authorName: "Debojit Paul",
    authorRole: "Stage Crew Lead",
    company: "VELVT Production",
  },
];

export function Velvt2Testimonials({ testimonials }: Velvt2TestimonialsProps) {
  const items = testimonials && testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const displayItems = [...items, ...items, ...items];

  return (
    <section className="py-20 md:py-28 relative border-t border-white/[0.06] overflow-hidden">
      <div className="container-velvt mb-10">
        <div className="max-w-xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2 font-medium">
            Testimonials
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
            Voices of the Night
          </h2>
        </div>
      </div>

      {/* Floating Single-Stream Marquee */}
      <div className="relative w-full overflow-hidden mask-fade-edges py-2">
        <div className="animate-float-marquee-left gap-5 px-4 flex">
          {displayItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-shrink-0 w-[260px] sm:w-[300px] rounded-lg bg-[#0e0e0e] border border-white/[0.08] p-5 flex flex-col justify-between"
            >
              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed mb-4">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="pt-3 border-t border-white/[0.06]">
                <h3 className="font-display font-bold text-white text-xs sm:text-sm uppercase tracking-wide">
                  {item.authorName}
                </h3>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mt-0.5">
                  {item.authorRole}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
