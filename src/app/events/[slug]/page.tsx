import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  formatDate,
  formatPrice,
  eventStatusLabels,
} from "@/lib/utils";
import type { Metadata } from "next";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.name,
    description: event.description.substring(0, 160),
    openGraph: {
      title: event.name,
      description: event.description.substring(0, 160),
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      ticketTypes: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
      scheduleItems: { orderBy: { displayOrder: "asc" } },
      announcements: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      },
      faqs: { orderBy: { displayOrder: "asc" } },
      galleryItems: {
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
        take: 12,
      },
      partners: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!event || event.status === "draft") {
    notFound();
  }

  const isUpcoming = event.status === "upcoming";

  return (
    <div className="relative">
      {/* ─── Event Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden">
        {/* Background */}
        {event.coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${event.coverImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

        {/* Ambient Red Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

        <div className="container-velvet relative pb-12 pt-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <StatusBadge
                status={event.status}
                label={eventStatusLabels[event.status] || event.status}
                size="sm"
              />
              {event.slug.includes("curse") && (
                <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-red-dim text-white border border-red-glow font-medium">
                  🎃 Halloween Production
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase text-white tracking-tight mb-4">
              {event.name}
            </h1>

            {/* Glowing Red Rule */}
            <div className="w-16 h-0.5 bg-primary shadow-[0_0_14px_#c8102e] mb-6" />

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted font-mono mb-8">
              <span>{formatDate(event.date)}</span>
              {event.time && (
                <>
                  <span className="text-white/20">·</span>
                  <span>{event.time}</span>
                </>
              )}
              {event.venue && (
                <>
                  <span className="text-white/20">·</span>
                  <span>
                    {event.venue.name}, {event.venue.city}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button href="#tickets" variant="primary" size="md">
                Get Tickets
              </Button>
              <Button href="#details" variant="secondary" size="md">
                Event Details
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Countdown ──────────────────────────────────────────────────────── */}
      {isUpcoming && (
        <section className="py-8 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="container-velvet text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-glow bg-red-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white">
                The Witching Hour Approaches
              </span>
            </div>
            <Countdown targetDate={event.date} />
          </div>
        </section>
      )}

      {/* ─── Event Overview ─────────────────────────────────────────────────── */}
      <section id="details" className="py-12 md:py-16">
        <div className="container-velvet">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <SectionHeading title="About This Event" subtitle="Behind the concept and execution." />
              <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-6 sm:p-8 space-y-6">
                <p className="text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>

                {event.slug.includes("curse") && (
                  <div className="p-5 rounded-[16px] border border-red-glow bg-red-dim space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">🎭</span>
                      <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                        Halloween Masquerade &amp; Dress Code
                      </h4>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      Attendees are encouraged to dress in dark formal, gothic couture, elegant noir, or Venetian masquerade masks.
                    </p>
                  </div>
                )}

                {event.theme && (
                  <div className="p-5 rounded-[16px] border border-white/10 bg-white/[0.03]">
                    <h3 className="font-display font-bold text-xs uppercase tracking-widest text-primary mb-2">
                      Theme & Concept
                    </h3>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      {event.theme}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar — Event Details */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="p-6 sm:p-8 rounded-[20px] border border-white/10 bg-white/[0.05] backdrop-blur-[14px] space-y-5 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h3 className="font-display font-bold text-sm uppercase tracking-widest text-white">
                      Event Logistics
                    </h3>
                  </div>

                  <DetailRow label="Date" value={formatDate(event.date)} />
                  {event.time && (
                    <DetailRow label="Time" value={event.time} />
                  )}
                  {event.venue && (
                    <>
                      <DetailRow label="Venue" value={event.venue.name} />
                      <DetailRow
                        label="Location"
                        value={`${event.venue.address}, ${event.venue.city}`}
                      />
                    </>
                  )}
                  {event.ageRestriction && (
                    <DetailRow
                      label="Age Restriction"
                      value={event.ageRestriction}
                    />
                  )}
                  {event.dressCode && (
                    <DetailRow label="Dress Code" value={event.dressCode} />
                  )}
                  {event.entryInfo && (
                    <DetailRow label="Entry Info" value={event.entryInfo} />
                  )}
                </div>

                {event.venue?.mapLink && (
                  <Button
                    href={event.venue.mapLink}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View on Map →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Schedule ───────────────────────────────────────────────────────── */}
      {event.scheduleItems.length > 0 && (
        <section className="py-12 md:py-16 border-t border-white/[0.08]">
          <div className="container-velvet">
            <SectionHeading
              title="Event Schedule"
              subtitle="What to expect through the evening."
            />

            <div className="max-w-2xl space-y-0">
              {event.scheduleItems.map((item, i) => (
                <div
                  key={item.id}
                  className="flex gap-6 group"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_12px_#c8102e] group-hover:scale-125 transition-transform duration-300" />
                    {i < event.scheduleItems.length - 1 && (
                      <div className="w-px flex-1 bg-white/10 min-h-[60px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <p className="text-xs font-mono font-medium text-primary uppercase tracking-wider mb-1">
                      {item.time}
                    </p>
                    <h4 className="font-display font-bold text-xl text-white mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-muted leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Tickets ────────────────────────────────────────────────────────── */}
      {event.ticketTypes.length > 0 && (
        <section
          id="tickets"
          className="py-12 md:py-16 border-t border-white/[0.08]"
        >
          <div className="container-velvet">
            <SectionHeading
              title="Tickets & Passes"
              subtitle="Secure your spot for the experience."
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.ticketTypes.map((ticket) => {
                const isSoldOut =
                  ticket.totalQuantity > 0 &&
                  ticket.soldCount >= ticket.totalQuantity;
                const now = new Date();
                const saleNotStarted =
                  ticket.saleStart && new Date(ticket.saleStart) > now;
                const saleEnded =
                  ticket.saleEnd && new Date(ticket.saleEnd) < now;

                return (
                  <div
                    key={ticket.id}
                    className={`p-6 sm:p-7 rounded-[20px] border transition-all duration-300 backdrop-blur-[14px] ${
                      isSoldOut || saleEnded
                        ? "border-white/10 bg-white/[0.02] opacity-60"
                        : "border-white/10 bg-white/[0.05] hover:border-primary/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.18)] hover:-translate-y-1"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight">
                        {ticket.name}
                      </h3>
                      {isSoldOut && (
                        <StatusBadge status="archived" label="Sold Out" />
                      )}
                    </div>

                    {ticket.description && (
                      <p className="text-sm text-muted leading-relaxed mb-6">
                        {ticket.description}
                      </p>
                    )}

                    <div className="flex items-end justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="font-display font-black text-3xl text-white tabular-nums">
                          {formatPrice(ticket.priceInPaise)}
                        </p>
                        {ticket.totalQuantity > 0 && !isSoldOut && (
                          <p className="text-xs text-muted/60 mt-1 font-mono">
                            {ticket.totalQuantity - ticket.soldCount} remaining
                          </p>
                        )}
                      </div>

                      {isSoldOut ? (
                        <span className="text-xs text-muted font-mono uppercase tracking-wider">
                          Unavailable
                        </span>
                      ) : saleNotStarted ? (
                        <span className="text-xs text-muted font-mono uppercase tracking-wider">
                          Coming Soon
                        </span>
                      ) : ticket.bookingUrl ? (
                        <Button
                          href={ticket.bookingUrl}
                          size="sm"
                          variant="primary"
                        >
                          Book Now
                        </Button>
                      ) : (
                        <span className="text-xs text-primary font-mono uppercase tracking-wider">
                          Opens Soon
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Announcements ──────────────────────────────────────────────────── */}
      {event.announcements.length > 0 && (
        <section className="py-12 md:py-16 border-t border-white/[0.08]">
          <div className="container-velvet">
            <SectionHeading title="Announcements" />

            <div className="max-w-2xl space-y-4">
              {event.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-6 rounded-[18px] border border-white/10 bg-white/[0.04] backdrop-blur-[14px]"
                >
                  <h4 className="font-display font-bold text-lg text-white mb-2 uppercase tracking-wide">
                    {ann.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {ann.content}
                  </p>
                  <p className="text-[10px] text-muted/40 font-mono mt-3">
                    {formatDate(ann.publishedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQs ───────────────────────────────────────────────────────────── */}
      {event.faqs.length > 0 && (
        <section className="py-12 md:py-16 border-t border-white/[0.08]">
          <div className="container-velvet">
            <SectionHeading title="Frequently Asked Questions" subtitle="Everything you need to know about attending." />

            <div className="max-w-2xl space-y-4">
              {event.faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group p-6 rounded-[16px] border border-white/10 bg-white/[0.04] hover:border-red-glow hover:shadow-[0_0_20px_rgba(200,16,46,0.15)] transition-all duration-300 cursor-pointer"
                >
                  <summary className="font-display font-bold text-lg text-white list-none flex items-center justify-between uppercase tracking-wide">
                    {faq.question}
                    <span className="text-primary group-open:rotate-45 transition-transform duration-300 text-xl ml-4">
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-muted leading-relaxed mt-4 pt-4 border-t border-white/10">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Partners ───────────────────────────────────────────────────────── */}
      {event.partners.length > 0 && (
        <section className="py-12 md:py-16 border-t border-white/[0.08]">
          <div className="container-velvet">
            <SectionHeading title="Partners & Sponsors" />
            <div className="flex flex-wrap items-center gap-8">
              {event.partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-center w-36 h-20 p-4 rounded-[16px] bg-white/[0.03] border border-white/10 opacity-70 hover:opacity-100 hover:border-primary/40 transition-all duration-500"
                >
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-sm font-mono text-muted">
                      {partner.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Volunteer CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-t border-white/[0.08] text-center">
        <div className="container-narrow">
          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 md:p-12 shadow-[0_0_30px_rgba(200,16,46,0.12)]">
            <div className="w-14 h-0.5 bg-primary shadow-[0_0_14px_#c8102e] mx-auto mb-6" />
            <h2 className="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight mb-4">
              Were You Part Of This Event?
            </h2>
            <p className="text-sm text-muted mb-8 max-w-md mx-auto leading-relaxed">
              Verify your volunteer ID to confirm your official contribution to this production.
            </p>
            <Button href="/verify" variant="primary" size="lg">Verify Your Volunteer ID →</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper component for detail rows
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-muted/60 mb-1">
        {label}
      </p>
      <p className="text-sm text-white font-medium leading-relaxed">{value}</p>
    </div>
  );
}

