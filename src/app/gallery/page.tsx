import { prisma } from "@/lib/db";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery & Visual Archive",
  description:
    "Immerse yourself in the visual archive of VELVT experiences. Atmospheric photography, stage craft, and crowd energy.",
};

export const revalidate = 0;

const curatedAtmosphere = [
  {
    id: "cur-1",
    url: "/gallery/velvt.in_0a1a5f8e120e4995bd181e9fe32fa75d.jpg",
    caption: "The Obsidian Stage • Light Sculptures",
    tag: "Atmosphere",
  },
  {
    id: "cur-2",
    url: "/gallery/bhumicoree_d771374cdb47419ca9c5b4a04c851761.jpg",
    caption: "Midnight Descent • Crowd Cadence",
    tag: "Crowd",
  },
  {
    id: "cur-3",
    url: "/gallery/velvt.in_6737fe3cefc340b6b19188090e18877f.jpg",
    caption: "Curse 2.O Teaser Set • Crimson Wash",
    tag: "Production",
  },
  {
    id: "cur-4",
    url: "/gallery/bhumicoree_6a1cce4fd02f45389436de63f664d219.jpg",
    caption: "Behind The Scenes • Crew Moments",
    tag: "Backstage",
  },
  {
    id: "cur-5",
    url: "/gallery/velvt.in_5af6dea848094553ac360dcf9ceca279.jpg",
    caption: "Gilded Corridor • Interactive Installations",
    tag: "Design",
  },
  {
    id: "cur-6",
    url: "/gallery/Dia de los Muertos vibes. (2).jpg",
    caption: "Dia de los Muertos • Face Art",
    tag: "Highlights",
  },
  {
    id: "cur-7",
    url: "/gallery/bhumicoree_0fd7e50029d24a0db163db145ed07934.jpg",
    caption: "The Finale • Ephemeral Moments",
    tag: "Live Performance",
  },
  {
    id: "cur-8",
    url: "/gallery/velvt.in_93c7e8ba417a41ad9e961368c44e35ff.jpg",
    caption: "Velvet Nights • Atmosphere & Energy",
    tag: "Atmosphere",
  },
  {
    id: "cur-9",
    url: "/gallery/Dia de los Muertos vibes. (4).jpg",
    caption: "Día de los Muertos • Painted Souls",
    tag: "Portraits",
  },
  {
    id: "cur-10",
    url: "/gallery/velvt.in_c4f41c336855400aabf478d5ae6578f9.jpg",
    caption: "Stage Presence • Raw Energy",
    tag: "Production",
  },
  {
    id: "cur-11",
    url: "/gallery/bhumicoree_be3599f762544bbd809ef204ec1c5a46.jpg",
    caption: "Velvet Crew • Faces of the Night",
    tag: "Crew",
  },
  {
    id: "cur-12",
    url: "/gallery/velvt.in_a1d189f03cf2447995657a0ff3f3cf43.jpg",
    caption: "Nocturnal Archives • The Collection",
    tag: "Archive",
  },
];

export default async function GalleryPage() {
  const dbItems = await prisma.galleryItem
    .findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
      include: { event: { select: { name: true } } },
    })
    .catch(() => []);

  return (
    <main className="py-12 md:py-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="container-velvet space-y-16">
        <SectionHeading
          title="The Visual Archive."
          subtitle="Glimpses into our immersive productions — the light sculptures, crowd cadence, and unrepeatable nocturnal atmosphere."
        />

        {/* Atmosphere gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedAtmosphere.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.05] backdrop-blur-[14px] aspect-[4/5] transition-all duration-700 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.2)] hover:-translate-y-1"
            >
              {/* Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.url})` }}
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Crimson corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/30 to-transparent pointer-events-none" />

              {/* Caption & Tag Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block self-start text-[10px] font-mono tracking-widest uppercase text-white px-3 py-1 rounded-full border border-red-glow bg-red-dim mb-2 font-medium">
                  {item.tag}
                </span>
                <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight leading-tight">
                  {item.caption}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Database Items (if any additional uploaded) */}
        {dbItems.length > 0 && (
          <div className="space-y-8 pt-16 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
              <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-white">Event Captures</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.05] backdrop-blur-[14px] aspect-[4/5] hover:border-primary/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.2)]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${item.url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    {item.event?.name && (
                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest block mb-1">
                        {item.event.name}
                      </span>
                    )}
                    {item.caption && (
                      <p className="font-display font-bold text-lg text-white uppercase">{item.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photography Submissions / Inquiries CTA */}
        <div className="border border-white/10 bg-white/[0.05] backdrop-blur-[14px] p-8 sm:p-12 rounded-[20px] text-center max-w-3xl mx-auto space-y-5 shadow-[0_0_30px_rgba(200,16,46,0.1)]">
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">Were you behind the lens?</h3>
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
  );
}
