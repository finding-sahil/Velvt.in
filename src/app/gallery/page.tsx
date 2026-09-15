import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status-server";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { InteractiveGallery } from "./InteractiveGallery";
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
      <main className="py-12 md:py-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-16">
        <SectionHeading
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
        <div className="border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-12 rounded-[20px] text-center max-w-3xl mx-auto space-y-5 shadow-[0_0_30px_rgba(200,16,46,0.1)]">
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Were you behind the lens?
          </h3>
          <p className="text-sm text-muted max-w-lg mx-auto leading-relaxed">
            We collaborate with visual artists, videographers, and editorial photographers. Submit your nocturnal coverage for inclusion in the official VELVT archive.
          </p>
          <div className="pt-2">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-dim border border-red-glow text-xs font-mono uppercase tracking-widest text-white hover:bg-primary hover:border-primary transition-all duration-300"
            >
              Submit Media Coverage &rarr;
            </a>
          </div>
        </div>
      </div>
    </main>
    </PageStatusGate>
  );
}
