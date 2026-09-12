import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TeamManager } from "./TeamManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminTeamPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }
  if (session.user.role === "gateman") {
    redirect("/velvt-management/gate");
  }

  const [members, adminUsers] = await Promise.all([
    prisma.teamMember.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        teamMemberId: true,
        isActive: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <TeamManager
        members={members}
        adminUsers={adminUsers}
        currentUserRole={session.user.role}
      />
    </div>
  );
}
