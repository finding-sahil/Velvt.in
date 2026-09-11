import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsManager } from "./SettingsManager";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvet-management/login");
  }

  const [settingsList, events] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.event.findMany({
      select: { id: true, name: true, status: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const settingsMap = settingsList.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">
      <SettingsManager settings={settingsMap} events={events} />
    </div>
  );
}
