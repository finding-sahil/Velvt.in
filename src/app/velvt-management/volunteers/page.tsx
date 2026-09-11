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

  const volunteers = await prisma.volunteer.findMany({
    orderBy: { appliedAt: "desc" },
    include: { event: { select: { name: true } } },
  });

  return <VolunteerManager volunteers={volunteers} />;
}
