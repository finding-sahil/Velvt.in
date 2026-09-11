import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TeamManager } from "./TeamManager";

export default async function AdminTeamPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvet-management/login");
  }

  const members = await prisma.teamMember.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <TeamManager members={members} />
    </div>
  );
}
