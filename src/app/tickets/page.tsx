import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status-server";
import { getCachedSiteSettings } from "@/lib/settings-cache";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { isSectionEnabled } from "@/lib/section-switchboard";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tickets & Passes | VELVT",
  description:
    "Direct entry and passes for upcoming VELVT events and experiences in Silchar, Assam, India.",
};

export default async function TicketsPage() {
  const [{ status, customTitle, customSubtitle }, upcomingEvent, settings] = await Promise.all([
    getPageStatus("tickets"),
    prisma.event
      .findFirst({
        where: {
          status: { in: ["upcoming", "ongoing"] },
          ticketTypes: { some: { isActive: true } },
        },
        include: {
          venue: true,
          ticketTypes: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { date: "asc" },
      })
      .catch(() => null),
    getCachedSiteSettings(),
  ]);

  return (
    <PageStatusGate
      pageKey="tickets"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <div className="py-12 md:py-20 relative min-h-[70vh]">
        <div className="container-velvt space-y-12">
          <SectionHeading
            as="h1"
            title="Tickets & Passes."
            subtitle={
              upcomingEvent
                ? `Official admission passes for ${upcomingEvent.name}`
                : "Direct entry and passes for upcoming VELVT experiences."
            }
          />

          {isSectionEnabled(settings, "tickets_section_tiers") && (
            upcomingEvent && upcomingEvent.ticketTypes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvent.ticketTypes.map((ticket) => {
                  const isSoldOut =
                    ticket.totalQuantity > 0 &&
                    ticket.soldCount >= ticket.totalQuantity;
                  return (
                    <div
                      key={ticket.id}
                      className={`p-6 sm:p-7 rounded-[20px] border transition-all duration-300 backdrop-blur-[14px] ${
                        isSoldOut
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
            ) : (
              <div className="max-w-3xl rounded-[20px] border border-white/10 bg-white/[0.04] backdrop-blur-[20px] p-8 sm:p-10 space-y-5 shadow-[0_0_40px_rgba(200,16,46,0.12)] text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono uppercase tracking-widest text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Pass Release Notice</span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                  No Active Passes Available Right Now
                </h2>
                <div className="w-16 h-0.5 bg-primary shadow-[0_0_14px_#c8102e]" />
                <p className="text-sm sm:text-base text-g5 leading-relaxed max-w-xl">
                  Ticket tiers are currently closed for immediate online booking. Pass drops and door allocations are released sequentially. Check upcoming event listings for scheduled sale dates.
                </p>
                <div className="pt-2">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_var(--red-glow)] transition-all min-h-[44px]"
                  >
                    Explore Production Schedule &rarr;
                  </Link>
                </div>
              </div>
            )
          )}

          {/* Admission & Entry Protocol Box */}
          {isSectionEnabled(settings, "tickets_section_admission_info") && (
            <div className="p-6 sm:p-8 rounded-[20px] bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red" />
                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
                  Admission & Entry Protocol
                </h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono text-g5">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-white font-bold block">1. Cryptographic QR</span>
                  <span>Every pass includes a unique verifiable single-scan QR code issued directly to your email.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-white font-bold block">2. Strict Dress Code</span>
                  <span>Nocturnal black, crimson, or theme-appropriate attire enforced at the gate.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-white font-bold block">3. Zero Tolerance</span>
                  <span>Safe space policy strictly enforced. Security staff reserve right of admission.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageStatusGate>
  );
}
