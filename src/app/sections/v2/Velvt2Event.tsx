import Link from "next/link";
import { Countdown } from "@/components/ui/Countdown";
import { formatDate } from "@/lib/utils";
import type { Event, Venue, TicketType } from "@prisma/client";

interface Velvt2EventProps {
  event: Event & { venue: Venue | null; ticketTypes: TicketType[] };
}

export function Velvt2Event({ event }: Velvt2EventProps) {
  if (!event) return null;

  const isUpcoming = event.status === "upcoming" || event.status === "ongoing";
  const venueDisplay = event.venue
    ? `${event.venue.name} · ${event.venue.city}`
    : "Borail View Regency · Silchar";
  const timeDisplay = event.time ? `${event.time.toUpperCase()} ONWARDS` : "7 PM ONWARDS";
  const dressCodeDisplay = event.dressCode || "Gothic Masquerade";

  return (
    <section id="featured-event" className="py-20 md:py-28 relative">
      <div className="container-velvt">
        {/* Section Category Header */}
        <div className="mb-10 sm:mb-14">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2 font-medium">
            Flagship Production
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
            Curse 2.O
          </h2>
        </div>

        {/* 2-Column Minimal Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left: Theatrical Poster */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl group">
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-neutral-900 to-black">
                  <span className="font-display font-black text-3xl text-white uppercase tracking-wider">
                    {event.name}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-red mt-2">
                    Halloween Edition
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Compressed Scannable Details & Action */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            {/* Level 1 & 2: Title & One Short Statement */}
            <div className="space-y-3">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-red font-semibold bg-red/10 border border-red/20 px-3 py-1 rounded-sm">
                Halloween Night
              </span>
              <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight uppercase">
                {event.name}
              </h3>
              <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed max-w-lg">
                An immersive Halloween experience.
              </p>
            </div>

            {/* Level 3: Scannable Event Metadata Table */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-6 py-6 border-y border-white/10 text-xs font-mono">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                  Location
                </span>
                <span className="text-white font-medium text-sm sm:text-base">
                  {venueDisplay}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                  Date &amp; Time
                </span>
                <span className="text-white font-medium text-sm sm:text-base">
                  {formatDate(event.date)} · {timeDisplay}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                  Dress Code
                </span>
                <span className="text-red font-medium text-sm sm:text-base">
                  {dressCodeDisplay}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                  Access Status
                </span>
                <span className="text-emerald-400 font-medium text-sm sm:text-base uppercase">
                  {event.status === "sold-out" ? "Sold Out" : "Passes Active"}
                </span>
              </div>
            </div>

            {/* Countdown Box (Subtle, Clean) */}
            {isUpcoming && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                  Doors Open In
                </span>
                <Countdown targetDate={event.date} />
              </div>
            )}

            {/* Level 4: One Clear Primary Action + Secondary Link */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/tickets"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-red text-white text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-300 hover:bg-[#a31526] hover:shadow-[0_8px_24px_rgba(200,16,46,0.35)] min-h-[48px]"
              >
                Book Passes
              </Link>

              <Link
                href={`/events/${event.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-neutral-400 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors min-h-[48px]"
              >
                <span>Event Details</span>
                <span className="ml-1.5">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
