import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Partner } from "@prisma/client";

interface PartnersPreviewSectionProps {
  partners: Partner[];
}

export function PartnersPreviewSection({ partners }: PartnersPreviewSectionProps) {
  return (
    <section className="py-12 md:py-16 relative">
      <div className="container-velvet space-y-8">
        <SectionHeading
          title="Partners &amp; Collaborators."
          subtitle="Creative partners, sponsors, and institutions collaborating on VELVT events."
          align="center"
        />

        <div className="flex flex-wrap items-center justify-center gap-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="glass-card px-6 py-3 flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-200 cursor-pointer"
            >
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-6 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                />
              ) : (
                <span className="font-display font-bold text-xs uppercase tracking-widest text-g5 hover:text-white">
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
