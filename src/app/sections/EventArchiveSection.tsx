import { EventCard } from "@/components/ui/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import type { Event, Venue } from "@prisma/client";

interface EventArchiveSectionProps {
  events: (Event & { venue: Venue | null })[];
}

export function EventArchiveSection({ events }: EventArchiveSectionProps) {
  if (!events || events.length === 0) return null;
  return (
    <section className="py-12 md:py-16 relative">
      <div className="container-velvt space-y-8">
        <SectionHeading
          title="Past Events &amp; Archive."
          subtitle="A curated historical archive of past events and memorable experiences."
        />

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {events.map((event) => (
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

        <div className="pt-4 text-center">
          <Button href="/events" variant="secondary" size="md">
            <span>Explore All Events</span>
            <span>&rarr;</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
