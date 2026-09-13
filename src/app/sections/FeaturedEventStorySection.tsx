import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface FeaturedEventStorySectionProps {
  event: any;
  storyTitle?: string;
  storySubtitle?: string;
}

export function FeaturedEventStorySection({
  event,
  storyTitle = "The Chronicle.",
  storySubtitle = "Behind the scenes of our flagship production — concept, sound engineering, and cultural impact.",
}: FeaturedEventStorySectionProps) {
  if (!event) return null;

  const isCompleted = event.status === "completed" || event.status === "archived";

  const storyChapters = [
    {
      label: "Chapter I",
      title: "The Genesis & Lore",
      text:
        event.theme ||
        "Conceived in the shadows of Silchar, VELVT CURSE was designed to disrupt ordinary parties by introducing an overarching gothic narrative where every participant becomes part of the atmosphere.",
    },
    {
      label: "Chapter II",
      title: "Audio-Visual Architecture",
      text:
        "Engineered with subterranean acoustics, arterial red lighting washes, and synchronized strobe sequences designed to elevate electronic and dark wave frequencies to physical sensations.",
    },
    {
      label: "Chapter III",
      title: "The Collective Atmosphere",
      text:
        event.dressCode
          ? `Adhering to strict aesthetic curation: "${event.dressCode}", transforming the room into an opulent masquerade of shadow and elegance.`
          : "Uniting hundreds of nocturnal creators, artists, and music lovers under a shared dress code and cinematic mood.",
    },
  ];

  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      <div className="container-velvt space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow text-[11px] font-mono uppercase tracking-widest text-red mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
              <span>Flagship Event Story</span>
            </div>
            <h2 className="section-title">
              {storyTitle}
            </h2>
            <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] my-3" />
            <p className="text-sm sm:text-base text-g5 leading-relaxed">
              {storySubtitle}
            </p>
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-red/40 bg-red/10 hover:bg-red/20 text-red hover:text-white text-xs font-mono uppercase tracking-widest transition-all self-start md:self-auto"
          >
            <span>Read Complete Dossier</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 2-Column Story Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Atmospheric Poster / Visual Presentation */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black/60 backdrop-blur-xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-black">
                {event.coverImage ? (
                  <img
                    src={event.coverImage}
                    alt={event.name}
                    className="w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-rich-charcoal via-black to-black p-6 text-center">
                    <span className="font-display font-black text-3xl uppercase text-white tracking-wider">
                      {event.name}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-6 left-6 right-6 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red bg-black/80 px-2.5 py-1 rounded-full border border-red/40 inline-block">
                    {formatDate(event.date)}
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                    {event.name}
                  </h3>
                  {event.venue && (
                    <p className="text-xs font-mono text-g5 uppercase tracking-wider">
                      📍 {event.venue.name} • {event.venue.city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: The 3 Story Chapters */}
          <div className="lg:col-span-7 space-y-6">
            {storyChapters.map((ch, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md hover:border-red/40 transition-colors space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-red font-bold uppercase tracking-wider">
                    {ch.label}
                  </span>
                  <span className="w-8 h-[1px] bg-white/20" />
                  <h4 className="font-display font-bold text-lg uppercase tracking-tight text-white">
                    {ch.title}
                  </h4>
                </div>
                <p className="text-sm text-g5 leading-relaxed pl-4 border-l border-red/30">
                  {ch.text}
                </p>
              </div>
            ))}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={`/events/${event.slug}`}
                className="px-6 py-3 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_25px_var(--red-glow)] transition-all flex items-center gap-2"
              >
                <span>{isCompleted ? "Explore Event Archive" : "Secure Event Passes"}</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/gallery"
                className="px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-all"
              >
                View Full Photo Archive
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
