import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, eventStatusLabels } from "@/lib/utils";
import type { Event, Venue, TicketType } from "@prisma/client";

interface FeaturedEventSectionProps {
  event: Event & { venue: Venue | null; ticketTypes: TicketType[] };
}

export function FeaturedEventSection({ event }: FeaturedEventSectionProps) {
  const isUpcoming = event.status === "upcoming";
  const displayTheme = event.theme && event.theme.length <= 40 ? event.theme : "Halloween Edition 2.O";

  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      {/* Subtle Ambient Red Glow */}
      <div className="absolute top-1/2 -right-20 w-[380px] h-[380px] rounded-full bg-red filter blur-[120px] opacity-[0.12] pointer-events-none" />

      <div className="container-velvt relative">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="section-title">
            Featured Production.
          </h2>
          <div className="red-rule" />
        </div>

        {/* UNTOLDSURI Glassmorphic Showcase Card */}
        <div className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: Poster with Clean Theatrical Frame (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-[16px] overflow-hidden border border-white/10 group shadow-2xl bg-black">
                {event.coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={event.coverImage}
                    alt={event.name}
                    loading="eager"
                    fetchPriority="high"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#18090C] via-black to-black flex flex-col items-center justify-between p-7 text-center">
                    <div className="w-full flex items-center justify-between text-[10px] font-mono text-g5 uppercase tracking-widest border-b border-white/[0.08] pb-3">
                      <span>VELVT Productions</span>
                      <span className="text-red">31 Oct 2026</span>
                    </div>

                    <div className="space-y-2 my-auto">
                      <div className="w-12 h-12 mx-auto rounded-full border border-red/40 flex items-center justify-center shadow-[0_0_16px_rgba(200,16,46,0.25)]">
                        <span className="font-display font-black text-xl text-white">2.O</span>
                      </div>
                      <p className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider">
                        VELVT CURSE
                      </p>
                      <p className="text-[11px] font-mono tracking-[0.25em] text-red uppercase">
                        Halloween Edition
                      </p>
                    </div>

                    <div className="w-full flex items-center justify-between text-[10px] font-mono text-g5 uppercase tracking-wider border-t border-white/[0.08] pt-3">
                      <span>Silchar, Assam, India</span>
                      <span>Doors 7:00 PM</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right: Info & Countdown (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge
                  status={event.status}
                  label={eventStatusLabels[event.status] || event.status}
                  size="sm"
                />
                <span className="text-[10px] font-mono text-red uppercase tracking-widest bg-red-dim px-3 py-1 rounded-full border border-red-glow font-medium">
                  {displayTheme}
                </span>
              </div>

              <div>
                <h3 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-2">
                  {event.name}
                </h3>
                <p className="text-xs sm:text-sm text-g6 leading-relaxed max-w-xl">
                  {event.description}
                </p>
              </div>

              {/* Bento Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-white/10 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-g5 uppercase">Date</span>
                  <p className="font-semibold text-white">{formatDate(event.date)}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-g5 uppercase">Doors</span>
                  <p className="font-semibold text-red">{event.time || "7:00 PM"}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-g5 uppercase">City / State</span>
                  <p className="font-semibold text-white">{event.venue?.city ? `${event.venue.city}, Assam` : "Silchar, Assam"}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-g5 uppercase">Dress Code</span>
                  <p className="font-semibold text-red">{event.dressCode || "Gothic Masquerade"}</p>
                </div>
              </div>

              {/* Countdown in UNTOLDSURI Glass Pill Box */}
              {isUpcoming && (
                <div className="p-4 rounded-[16px] border border-white/10 bg-white/[0.03] backdrop-blur-md space-y-2 overflow-hidden w-full">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-red uppercase tracking-widest flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                      Countdown to the Witching Hour
                    </span>
                    <span className="text-g5">Doors at Dusk</span>
                  </div>
                  <Countdown targetDate={event.date} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button href={`/events/${event.slug}`} variant="primary" size="md">
                  Event Details &rarr;
                </Button>
                <Button href="/tickets" variant="secondary" size="md">
                  Secure Passes
                </Button>
                <Button href="/volunteers/register" variant="outline" size="md">
                  Join The Crew
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

