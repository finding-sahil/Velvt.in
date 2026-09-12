import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TicketManager } from "./TicketManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminTicketsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }
  if (session.user.role === "gateman") {
    redirect("/velvt-management/gate");
  }

  // Fetch all issued tickets
  const tickets = await prisma.issuedTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          date: true,
          time: true,
          status: true,
        },
      },
      ticketType: {
        select: {
          id: true,
          name: true,
          priceInPaise: true,
        },
      },
    },
  });

  // Fetch all events for the generator dropdown
  const events = await prisma.event.findMany({
    orderBy: [{ isFeatured: "desc" }, { date: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      date: true,
      status: true,
      isFeatured: true,
      ticketTypes: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          name: true,
          priceInPaise: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <TicketManager initialTickets={tickets} events={events} />
    </div>
  );
}
