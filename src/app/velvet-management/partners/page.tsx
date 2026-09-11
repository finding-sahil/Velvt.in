import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PartnersManager } from "./PartnersManager";

export default async function AdminPartnersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvet-management/login");
  }

  const [partners, pressMentions, events] = await Promise.all([
    prisma.partner.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.pressMention.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.event.findMany({
      select: { id: true, name: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <PartnersManager partners={partners} pressMentions={pressMentions} events={events} />
    </div>
  );
}
