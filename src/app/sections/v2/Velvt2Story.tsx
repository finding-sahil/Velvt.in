import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Velvt2StoryProps {
  event: any;
  storyTitle?: string;
  storySubtitle?: string;
}

export function Velvt2Story({
  event,
  storyTitle = "The Chronicle",
  storySubtitle = "Concept, acoustics, and cultural impact behind our flagship production.",
}: Velvt2StoryProps) {
  if (!event) return null;

  const chapters = [
    {
      num: "01",
      title: "The Genesis & Lore",
      text: "A gothic nocturnal narrative where every participant becomes an active part of the atmosphere.",
    },
    {
      num: "02",
      title: "Audio-Visual Architecture",
      text: "Subterranean acoustics, arterial lighting washes, and synchronized dark wave frequencies.",
    },
    {
      num: "03",
      title: "The Collective Dress",
      text: event.dressCode
        ? `Strict aesthetic curation: "${event.dressCode}", transforming the room into an opulent masquerade.`
        : "Uniting nocturnal creators, artists, and music lovers under an elegant dark aesthetic.",
    },
  ];

  return (
    <section className="py-20 md:py-28 relative">
      <div className="container-velvt">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2 font-medium">
              Production Chronicle
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
              {storyTitle}
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-sans mt-3 leading-relaxed">
              {storySubtitle}
            </p>
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-white transition-colors"
          >
            <span>Complete Dossier</span>
            <span>→</span>
          </Link>
        </div>

        {/* 2-Column Story Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Poster */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl">
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6 bg-neutral-900 text-center">
                  <span className="font-display font-black text-2xl uppercase text-white">
                    {event.name}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-red">
                  {formatDate(event.date)}
                </span>
                <p className="font-display font-black text-xl text-white uppercase">
                  {event.name}
                </p>
              </div>
            </div>
          </div>

          {/* Right: 3 Compact Chapters */}
          <div className="lg:col-span-7 space-y-6">
            {chapters.map((chapter) => (
              <div
                key={chapter.num}
                className="p-6 rounded-lg bg-[#0e0e0e] border border-white/[0.08] hover:border-white/20 transition-all duration-300 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red font-mono text-xs font-bold tracking-wider">
                    {chapter.num}
                  </span>
                  <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wide">
                    {chapter.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                  {chapter.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
