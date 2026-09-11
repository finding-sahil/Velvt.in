import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tickets & Passes | VELVT",
  description:
    "Direct entry and passes for upcoming VELVT events and experiences in Silchar, Assam, India.",
};

export default async function TicketsPage() {
  const { status, customTitle, customSubtitle } = await getPageStatus("tickets");

  const upcomingEvent = await prisma.event
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
    .catch(() => null);

  return (
    <PageStatusGate
      pageKey="tickets"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <main className="py-12 md:py-20 relative min-h-[70vh]">
        <div className="container-velvt space-y-12">
          <SectionHeading
            title="Tickets & Passes."
            subtitle={
              upcomingEvent
                ? `Official admission passes for ${upcomingEvent.name}`
                : "Direct entry and passes for upcoming VELVT experiences."
            }
          />

          {upcomingEvent && upcomingEvent.ticketTypes.length > 0 ? (
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
            <div className="max-w-2xl mx-auto border border-white/10 bg-white/[0.04] backdrop-blur-[20px] rounded-[24px] p-10 sm:p-14 space-y-8 text-center shadow-[0_0_60px_rgba(200,16,46,0.15)]">
              <div className="w-16 h-16 rounded-full bg-red-dim border border-red-glow flex items-center justify-center mx-auto">
                <span className="text-2xl">🎫</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                No Active Passes Right Now
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto">
                Ticket tiers are not active for immediate booking. Check back or follow Instagram for announcements.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-dim border border-red-glow text-xs font-mono uppercase tracking-widest text-white hover:bg-primary transition-all"
              >
                View Events &rarr;
              </Link>
            </div>
          )}
        </div>
      </main>
    </PageStatusGate>
  );
}
