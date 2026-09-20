import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status-server";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { InteractiveGallery } from "./InteractiveGallery";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery & Visual Archive",
  description:
    "Immerse yourself in the visual archive of VELVT experiences. Atmospheric photography, stage craft, and crowd energy.",
};

export default async function GalleryPage() {
  const [{ status, customTitle, customSubtitle }, dbItems] = await Promise.all([
    getPageStatus("gallery"),
    prisma.galleryItem
      .findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
        include: { event: { select: { name: true } } },
      })
      .catch(() => []),
  ]);

  return (
    <PageStatusGate
      pageKey="gallery"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <div className="py-12 md:py-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-16">
        <SectionHeading
          as="h1"
          title="The Visual Archive."
          subtitle="Glimpses into our immersive productions — the light sculptures, crowd cadence, and unrepeatable nocturnal atmosphere."
        />

        {/* Dynamic Database Items with Filter & Lightbox */}
        {dbItems.length === 0 ? (
          <EmptyState
            title="Visual Archive Empty"
            description="No event captures have been published yet. Check back following our next production."
          />
        ) : (
          <InteractiveGallery items={dbItems} />
        )}

        {/* Photography Submissions / Inquiries CTA */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <div className="space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-red-dim border border-red/30 text-[10px] font-mono uppercase tracking-widest text-red">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
              <span>Media Inquiries</span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Were you behind the lens?
            </h3>
            <p className="text-xs sm:text-sm text-g5 leading-relaxed">
              We collaborate with visual artists, videographers, and editorial photographers. Submit your nocturnal coverage for inclusion in the official VELVT archive.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/contact?category=media"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red hover:bg-red-glow text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_var(--red-glow)] transition-all min-h-[44px]"
            >
              Submit Media Coverage &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
    </PageStatusGate>
  );
}
