import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VolunteerManager } from "./VolunteerManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminVolunteersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }

  const [volunteers, events] = await Promise.all([
    prisma.volunteer.findMany({
      orderBy: { appliedAt: "desc" },
      include: { event: { select: { id: true, name: true, date: true, status: true } } },
    }),
    prisma.event.findMany({
      select: { id: true, name: true, date: true, status: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return <VolunteerManager volunteers={volunteers} events={events} />;
}
