import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SponsorInquiryManager } from "./SponsorInquiryManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor Inquiries & Partnerships — VELVT Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  await requireAdmin();

  const [inquiries, deckSetting] = await Promise.all([
    prisma.sponsorInquiry.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "sponsorship_deck_url" },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red mb-1">
          <span>●</span>
          <span>Brand Relations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
          Sponsor Inquiries &amp; Deck Management
        </h1>
        <p className="text-xs sm:text-sm text-g5 mt-1">
          Review inbound corporate partnership proposals, update negotiation statuses, and manage the downloadable sponsorship deck.
        </p>
      </div>

      <SponsorInquiryManager
        initialInquiries={inquiries}
        initialDeckUrl={deckSetting?.value || ""}
      />
    </div>
  );
}
