import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminLoginPath } from "@/lib/admin-path";
import { GateScanner } from "./GateScanner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GateControlPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminLoginPath());
  }

  // Both admin and gateman are allowed
  if (session.user.role !== "admin" && session.user.role !== "gateman") {
    redirect(adminLoginPath());
  }

  // Fetch events
  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      date: true,
      status: true,
      isFeatured: true,
    },
    orderBy: { date: "desc" },
  });

  // Calculate live stats for default/featured event
  const assignedEventId = session.user.role === "gateman" ? session.user.assignedEventId : null;
  const defaultEvent = assignedEventId
    ? events.find((e) => e.id === assignedEventId) || events[0]
    : events.find((e) => e.isFeatured) || events[0];

  const [totalTickets, admittedTickets] = await Promise.all([
    prisma.issuedTicket.count({
      where: defaultEvent ? { eventId: defaultEvent.id } : {},
    }),
    prisma.issuedTicket.count({
      where: {
        ...(defaultEvent ? { eventId: defaultEvent.id } : {}),
        isCheckedIn: true,
      },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <GateScanner
        currentUser={{
          id: session.userId,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role || "admin",
          assignedEventId: session.user.assignedEventId || null,
        }}
        events={events.map((e) => ({
          ...e,
          date: e.date.toISOString(),
        }))}
        initialStats={{
          total: totalTickets,
          admitted: admittedTickets,
          pending: totalTickets - admittedTickets,
        }}
      />
    </div>
  );
}
