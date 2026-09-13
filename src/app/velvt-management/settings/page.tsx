import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsManager } from "./SettingsManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }
  if (session.user.role === "gateman") {
    redirect("/velvt-management/gate");
  }

  const [settingsList, events, adminUsers] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.event.findMany({
      select: { id: true, name: true, status: true },
      orderBy: { date: "desc" },
    }),
    prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ]);

  const settingsMap = settingsList.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">
      <SettingsManager settings={settingsMap} events={events} adminUsers={adminUsers} />
    </div>
  );
}
