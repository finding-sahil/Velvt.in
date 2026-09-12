import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminLoginPath, adminPath } from "@/lib/admin-path";
import { listGatemen } from "@/app/actions";
import { GatemanManager } from "./GatemanManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GatemenAdminPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminLoginPath());
  }
  if (session.user.role !== "admin") {
    redirect(adminPath("/gate"));
  }

  const [gatemen, events, totalCheckedIn] = await Promise.all([
    listGatemen(),
    prisma.event.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        date: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.issuedTicket.count({
      where: { isCheckedIn: true },
    }),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <GatemanManager
        initialGatemen={gatemen}
        events={events.map((e) => ({
          ...e,
          date: e.date.toISOString(),
        }))}
        totalCheckedIn={totalCheckedIn}
      />
    </div>
  );
}
