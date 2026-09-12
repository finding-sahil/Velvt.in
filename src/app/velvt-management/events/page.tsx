import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EventManager } from "./EventManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminEventsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }
  if (session.user.role === "gateman") {
    redirect("/velvt-management/gate");
  }

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      venue: true,
      ticketTypes: {
        orderBy: { displayOrder: "asc" },
      },
      scheduleItems: {
        orderBy: { displayOrder: "asc" },
      },
      faqs: {
        orderBy: { displayOrder: "asc" },
      },
      _count: {
        select: {
          volunteers: true,
          ticketTypes: true,
          scheduleItems: true,
          announcements: true,
          faqs: true,
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
