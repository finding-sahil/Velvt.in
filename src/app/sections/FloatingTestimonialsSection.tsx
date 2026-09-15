import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Testimonial } from "@prisma/client";

interface FloatingTestimonialsSectionProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_TESTIMONIALS = [
  {
    id: "def-1",
    quote: "VELVT has redefined nocturnal live culture in Assam. The acoustic depth and gothic discipline were unlike anything the region has ever seen.",
    authorName: "Ananya Roy",
    authorRole: "VIP Attendee & Culture Writer",
    company: "Nocturne Chronicles",
    category: "attendee",
    rating: 5,
    avatarUrl: null,
  },
  {
    id: "def-2",
    quote: "Partnering as a hospitality sponsor gave our brand unmatched cultural prestige among high-value creative audiences. Flawless gate execution.",
    authorName: "Vikram Sengupta",
    authorRole: "Managing Director",
    company: "Elysian Hospitality",
    category: "sponsor",
    rating: 5,
    avatarUrl: null,
  },
  {
    id: "def-3",
    quote: "Operating the lighting and stage arrays behind CURSE was an adrenaline rush. The cryptographic crew credentials and production discipline are top tier.",
    authorName: "Debojit Paul",
    authorRole: "Stage Operations Crew Lead",
    company: "VELVT Production",
    category: "volunteer",
    rating: 5,
    avatarUrl: null,
  },
  {
    id: "def-4",
    quote: "A masterclass in spatial curation, dark elegance, and crowd control. When the crimson lights dropped, the room turned into pure theater.",
    authorName: "Meenakshi Das",
    authorRole: "Creative Director",
    company: "Prism Collective",
    category: "attendee",
    rating: 5,
    avatarUrl: null,
  },
  {
    id: "def-5",
    quote: "As official beverage partners, our integration was executed with unmatched aesthetic subtlety. Every detail feels strictly intentional.",
    authorName: "Rohit Bhattacharjee",
    authorRole: "Brand Partnerships Head",
    company: "Velvet Spirit Co.",
    category: "sponsor",
    rating: 5,
    avatarUrl: null,
  },
  {
    id: "def-6",
    quote: "Being part of the gate and wristband verification crew taught me more about real-time production logistics than any classroom ever could.",
    authorName: "Sneha Choudhury",
    authorRole: "Operations Volunteer",
    company: "VELVT Crew '25",
    category: "volunteer",
    rating: 5,
    avatarUrl: null,
  },
];

export function FloatingTestimonialsSection({
  testimonials,
  title = "Voices of the Underground.",
  subtitle = "What partners, production crew, and attendees whisper after the crimson lights fade.",
}: FloatingTestimonialsSectionProps) {
  const allItems =
    testimonials && testimonials.length > 0
      ? testimonials
      : DEFAULT_TESTIMONIALS;

  // Split into two alternating streams for multi-directional floating effect
  const row1 = allItems.slice(0, Math.ceil(allItems.length / 2));
  const row2 = allItems.slice(Math.ceil(allItems.length / 2));

  const duplicatedRow1 = [...row1, ...row1, ...row1];
  const duplicatedRow2 = [...row2, ...row2, ...row2];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Ambient background velvet glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="container-velvt mb-10 md:mb-14">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            <span>Echoes &amp; Testimonials</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-g5 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Row 1: Floating Left */}
      <div className="relative w-full overflow-hidden mask-fade-edges py-2">
        <div className="animate-float-marquee-left gap-5 px-4">
          {duplicatedRow1.map((item, idx) => (
            <TestimonialCard key={`row1-${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row 2: Floating Right */}
      <div className="relative w-full overflow-hidden mask-fade-edges py-3">
        <div className="animate-float-marquee-right gap-5 px-4">
          {duplicatedRow2.map((item, idx) => (
            <TestimonialCard key={`row2-${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: any }) {
  const badgeColor =
    item.category === "sponsor"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
      : item.category === "volunteer"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : "bg-red/10 text-red border-red/30";

  const categoryLabel =
    item.category === "sponsor"
      ? "VIP SPONSOR"
      : item.category === "volunteer"
      ? "PRODUCTION CREW"
      : "VERIFIED ATTENDEE";

  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[380px] rounded-2xl bg-black/40 border border-white/10 hover:border-red/40 hover:bg-black/60 transition-all duration-300 p-6 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl group">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex text-amber-400 text-xs tracking-widest">
            {Array.from({ length: item.rating || 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase border ${badgeColor}`}>
            {categoryLabel}
          </span>
        </div>

        <p className="text-sm text-g4 font-sans leading-relaxed italic group-hover:text-white transition-colors">
          &ldquo;{item.quote}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/[0.08]">
        <div className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-display font-bold text-sm">
          {item.avatarUrl ? (
            <img
              src={item.avatarUrl}
              alt={item.authorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{item.authorName.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-display font-bold text-white text-xs sm:text-sm uppercase tracking-wider truncate">
            {item.authorName}
          </h4>
          <p className="text-[10px] sm:text-[11px] font-mono text-g5 truncate">
            {item.company ? `${item.authorRole} • ${item.company}` : item.authorRole}
          </p>
        </div>
      </div>
    </div>
  );
}
