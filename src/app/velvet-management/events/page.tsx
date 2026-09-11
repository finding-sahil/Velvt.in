import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EventManager } from "./EventManager";

export default async function AdminEventsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvet-management/login");
  }

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      venue: true,
      ticketTypes: {
        orderBy: { displayOrder: "asc" },
      },
      _count: {
        select: {
          volunteers: true,
          ticketTypes: true,
          announcements: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <EventManager events={events} />
    </div>
  );
}
