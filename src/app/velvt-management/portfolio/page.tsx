import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PortfolioManager } from "./PortfolioManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Portfolio CMS — VELVT Admin",
};

export const dynamic = "force-dynamic";

export default async function PortfolioAdminPage() {
  await requireAdmin();

  const members = await prisma.teamMember.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red mb-1">
          <span>●</span>
          <span>Core Team &amp; Founder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
          Personal Portfolio CMS
        </h1>
        <p className="text-xs sm:text-sm text-g5 mt-1">
          Curate the executive bio, roles, achievements, skills, and production timeline for the founder and core directors in polished first-person voice.
        </p>
      </div>

      <PortfolioManager members={members} />
    </div>
  );
}
