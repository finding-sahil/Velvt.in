import { SectionHeading } from "@/components/ui/SectionHeading";

const services = [
  {
    title: "Event Planning",
    description: "End-to-end planning, stage logistics, and crowd orchestration.",
    icon: "✦",
  },
  {
    title: "Experience Design",
    description: "Thematic environments, lighting architecture, and spatial art.",
    icon: "◈",
  },
  {
    title: "Community Gatherings",
    description: "Curated underground nightlife, cultural showcases, and meetups.",
    icon: "◇",
  },
  {
    title: "Creative Production",
    description: "Stage art direction, visual identity, and theatrical concepts.",
    icon: "⬡",
  },
  {
    title: "Volunteer Coordination",
    description: "Verified credential registry, specialized roles, and crew safety.",
    icon: "◎",
  },
  {
    title: "Brand Collaborations",
    description: "Curated partner integrations and experiential sponsor activations.",
    icon: "⊕",
  },
];

interface ServicesSectionProps {
  title?: string;
  subtitle?: string;
}

export function ServicesSection({
  title = "What We Do.",
  subtitle = "The planning, design, and production craft behind every VELVT experience.",
}: ServicesSectionProps = {}) {
  return (
    <section className="py-10 md:py-14 relative">
      <div className="container-velvet space-y-6">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          align="center"
        />

        {/* UNTOLDSURI Platform Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="glass-card p-5 flex flex-col justify-between group hover:border-red/30 transition-all duration-300"
            >
              <div className="space-y-2.5">
                <span className="text-xl text-red group-hover:scale-110 inline-block transition-transform duration-200">
                  {service.icon}
                </span>
                <h3 className="font-display font-bold text-base text-white uppercase tracking-wide group-hover:text-red transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-g5 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

