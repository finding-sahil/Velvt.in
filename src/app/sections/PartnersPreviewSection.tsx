import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Partner } from "@prisma/client";

interface PartnersPreviewSectionProps {
  partners: Partner[];
}

export function PartnersPreviewSection({ partners }: PartnersPreviewSectionProps) {
  return (
    <section className="py-12 md:py-16 relative">
      <div className="container-velvt space-y-8">
        <SectionHeading
          title="Partners &amp; Collaborators."
          subtitle="Creative partners, sponsors, and institutions collaborating on VELVT events."
          align="center"
        />

        <div className="flex flex-wrap items-center justify-center gap-4">
          {partners.map((partner) => {
            const content = (
              <>
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-6 w-auto object-contain grayscale group-hover:grayscale-0 transition-all"
                  />
                ) : (
                  <span className="font-display font-bold text-xs uppercase tracking-widest text-g5 group-hover:text-white transition-colors">
                    {partner.name}
                  </span>
                )}
              </>
            );

            if (partner.website) {
              return (
                <a
                  key={partner.id}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit partner ${partner.name}`}
                  className="group glass-card px-6 py-3 flex items-center justify-center opacity-70 hover:opacity-100 hover:border-red/40 transition-all duration-200 cursor-pointer min-h-[44px]"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={partner.id}
                className="group glass-card px-6 py-3 flex items-center justify-center opacity-70 transition-all duration-200 min-h-[44px]"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
