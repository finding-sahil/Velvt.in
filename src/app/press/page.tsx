import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateShort } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Press & Sponsors",
  description:
    "Official press resources, media assets, coverage, and inquiries for VELVT experiences and productions.",
};

export default async function PressPage() {
  const { status, customTitle, customSubtitle } = await getPageStatus("press");

  const dbMentions = await prisma.pressMention
    .findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
    })
    .catch(() => []);

  return (
    <PageStatusGate
      pageKey="press"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <main className="py-12 md:py-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvt space-y-20">
        <SectionHeading
          title="Press & Editorial."
          subtitle="Official stories, media kits, press releases, and editorial resources for journalists and creators."
        />

        {/* Media Kit Download Banner */}
        <div className="border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-12 rounded-[20px] relative overflow-hidden shadow-[0_0_40px_rgba(200,16,46,0.18)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-red-glow bg-red-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-white font-medium">
                Official Media Kit • 2026 Edition
              </span>
            </div>
            <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Brand Guidelines & Production Imagery
            </h3>
            <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e]" />
            <p className="text-sm text-muted leading-relaxed">
              Includes vector logos (SVG/PNG), typography documentation, color palette tokens, executive bios, and approved nocturnal event press imagery for editorial publication.
            </p>
            <div className="pt-3 flex flex-wrap gap-4">
              <Button href="/contact" variant="primary" size="md">
                Request Media Kit
              </Button>
              <Button href="/contact" variant="secondary" size="md">
                Request Press Pass
              </Button>
            </div>
          </div>
        </div>

        {/* Press Coverage Articles */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
            <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-white">
              Featured Coverage
            </h3>
          </div>

          {dbMentions.length === 0 ? (
            <EmptyState
              title="No press features yet"
              description="Official coverage and media mentions will appear here once published."
            />
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {dbMentions.map((mention) => (
                <article
                  key={mention.id}
                  className="border border-white/10 bg-white/[0.04] backdrop-blur-[14px] p-8 rounded-[20px] flex flex-col justify-between hover:border-primary/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.18)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-primary uppercase tracking-widest font-semibold">
                        {mention.publication}
                      </span>
                      {mention.publishDate ? (
                        <span className="text-muted/60">
                          {formatDateShort(mention.publishDate)}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="font-display font-bold text-xl text-white uppercase tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {mention.title}
                    </h4>
                    {mention.excerpt && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-4">
                        {mention.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10">
                    <a
                      href={mention.url || "#"}
                      target={mention.url?.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-primary group-hover:text-white uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
                    >
                      Read Feature &rarr;
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Media Inquiries Card */}
        <div className="border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-10 rounded-[20px] grid sm:grid-cols-2 gap-8 items-center shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <div className="space-y-2">
            <h4 className="font-display font-bold text-2xl text-white uppercase tracking-tight">
              Editorial & Interview Requests
            </h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              For interview inquiries with the founders, backstage credential access, or exclusive nocturnal coverage permissions, connect with our press relations desk.
            </p>
          </div>
          <div className="sm:text-right space-y-1">
            <p className="text-xs font-mono text-muted uppercase tracking-wider">
              Press Relations
            </p>
            <a
              href="mailto:press@velvt.in"
              className="font-mono text-lg text-primary hover:text-white transition-colors block"
            >
              press@velvt.in
            </a>
          </div>
        </div>
      </div>
    </main>
    </PageStatusGate>
  );
}
