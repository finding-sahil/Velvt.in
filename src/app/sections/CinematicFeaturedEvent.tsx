import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Event, Venue, TicketType } from "@prisma/client";

interface CinematicFeaturedEventProps {
  event: Event & { venue: Venue | null; ticketTypes: TicketType[] };
}

export function CinematicFeaturedEvent({ event }: CinematicFeaturedEventProps) {
  const isUpcoming = event.status === "upcoming";

  return (
    <section className="cin-section relative overflow-hidden" style={{ padding: "clamp(4rem, 8vh, 7rem) 0" }}>
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8">
        {/* Large cinematic poster — visual first */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-sm overflow-hidden mb-10 group">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.name}
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.03]"
              style={{ filter: "contrast(1.05) brightness(0.9)" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#12080c] via-[#0a0a0d] to-[#08080a] flex items-center justify-center">
              <span className="cin-display-title text-[var(--cin-text,#e8e4df)] text-4xl sm:text-6xl">
                {event.name}
              </span>
            </div>
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />
          
          {/* Event info overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <h2
              className="cin-display-title text-[var(--cin-text,#e8e4df)] mb-2"
              style={{
                fontSize: "clamp(2rem, 6vw, 4rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {event.name}
            </h2>
            <div className="flex items-center gap-3 text-[var(--cin-text-dim,#5c5955)] text-xs uppercase tracking-[0.15em] cin-body">
              <span>{formatDate(event.date)}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{event.venue?.city || "Silchar"}, Assam</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Doors {event.time || "7:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* Minimal content block */}
        <div className="max-w-2xl">
          {/* One hook line — short, evocative */}
          <p className="cin-body text-[var(--cin-text-muted,#8a8680)] text-base sm:text-lg leading-relaxed mb-8" style={{ maxWidth: "40ch" }}>
            {event.description
              ? event.description.length > 120
                ? event.description.slice(0, 120).trim() + "…"
                : event.description
              : "One night. One room. No ordinary crowd."}
          </p>

          {/* Two clean CTAs — no glow, no borders, no decoration */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={isUpcoming ? "/tickets" : `/events/${event.slug}`}
              className="cin-cta-primary inline-flex items-center gap-2.5 px-7 py-3 bg-[var(--red,#a31526)] text-[var(--cin-text,#e8e4df)] text-sm font-medium tracking-wide transition-all duration-300 hover:bg-[#8a1020]"
              style={{ borderRadius: "2px" }}
            >
              <span>{isUpcoming ? "Get Passes" : "Explore Archive"}</span>
              <span className="opacity-60">→</span>
            </Link>
            <Link
              href={`/events/${event.slug}`}
              className="cin-cta-secondary inline-flex items-center gap-2.5 px-7 py-3 border border-white/[0.08] text-[var(--cin-text-muted,#8a8680)] text-sm font-medium tracking-wide transition-all duration-300 hover:text-[var(--cin-text,#e8e4df)] hover:border-white/[0.15]"
              style={{ borderRadius: "2px" }}
            >
              <span>The Experience</span>
              <span className="opacity-60">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
