import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status-server";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events",
  description:
    "Explore the VELVT event archive. Upcoming, ongoing, and past events — every experience leaves a trace.",
};

export default async function EventsPage() {
  const [{ status, customTitle, customSubtitle }, events] = await Promise.all([
    getPageStatus("events"),
    prisma.event
      .findMany({
        where: { status: { not: "draft" } },
        include: { venue: true },
        orderBy: { date: "desc" },
      })
      .catch(() => []),
  ]);

  const upcoming = events.filter(
    (e) =>
      e.status === "published" ||
      e.status === "upcoming" ||
      e.status === "ongoing" ||
      e.status === "sold-out"
  );
  const past = events.filter(
    (e) => e.status === "completed" || e.status === "archived"
  );


  return (
    <PageStatusGate
      pageKey="events"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <div className="py-section-sm md:py-section">
      <div className="container-velvt">
        <SectionHeading
          title="Every Event Leaves A Trace."
          subtitle="A curated archive of the experiences we've brought to life — and the ones yet to come."
        />

        {events.length === 0 ? (
          <EmptyState
            title="No events yet"
            description="Events will appear here once they are published. Check back soon."
          />
        ) : (
          <div className="space-y-20">
            {/* Upcoming / Ongoing */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
                  <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
                    Upcoming & Current Productions
                  </h3>
                </div>
                <div className="space-y-8">
                  {upcoming.map((event) => (
                    <EventCard
                      key={event.id}
                      name={event.name}
                      slug={event.slug}
                      date={event.date}
                      status={event.status}
                      description={event.description}
                      coverImage={event.coverImage}
                      venue={event.venue}
                      variant="featured"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {past.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 rounded-full bg-white/30" />
                  <h3 className="font-display font-bold text-lg uppercase tracking-wider text-muted">
                    Past Production Archive
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((event) => (
                    <EventCard
                      key={event.id}
                      name={event.name}
                      slug={event.slug}
                      date={event.date}
                      status={event.status}
                      description={event.description}
                      coverImage={event.coverImage}
                      venue={event.venue}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PageStatusGate>
  );
}
