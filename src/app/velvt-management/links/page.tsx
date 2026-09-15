import { requireAdmin } from "@/lib/auth";
import { getLinkTreeData } from "@/app/actions";
import { LinkTreeManager } from "./LinkTreeManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Tree & Bio Links — VELVT Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLinkTreePage() {
  await requireAdmin();
  const config = await getLinkTreeData();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red mb-1">
          <span>●</span>
          <span>Social Conversion &amp; Bio Links</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
          Link Tree Manager
        </h1>
        <p className="text-xs sm:text-sm text-g5 mt-1">
          Curate, add, reorder, and track public bio links and pass portals for Instagram, TikTok, WhatsApp, and print collateral.
        </p>
      </div>

      <LinkTreeManager initialConfig={config} />
    </div>
  );
}
