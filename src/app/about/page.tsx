import type { Metadata } from "next";
import { getPageStatus } from "@/lib/page-status";
import { PageStatusGate } from "@/components/ui/PageStatusGate";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "VELVT is an event organization focused on creating immersive experiences, bringing communities together, and turning creative ideas into memorable events.",
};

export default async function AboutPage() {
  const { status, customTitle, customSubtitle } = await getPageStatus("about");

  return (
    <PageStatusGate
      pageKey="about"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <div className="py-12 md:py-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      {/* Hero */}
      <section className="container-velvt mb-16">
        <div className="max-w-3xl space-y-6">
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase text-white tracking-tight leading-[0.95]">
            An Idea, A Feeling, An Experience.
          </h1>

          <div className="w-16 h-0.5 bg-primary shadow-[0_0_14px_#c8102e]" />

          <p className="font-mono text-base sm:text-lg text-primary tracking-wide uppercase">
            It starts as a thought, ends as a memory.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="container-velvt mb-16">
        <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(0,0,0,0.3)] space-y-6 max-w-4xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
            <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-white">
              What Is VELVT?
            </h2>
          </div>
          <p className="text-base text-muted leading-relaxed">
            VELVT is an event organization focused on creating immersive experiences, bringing communities together, and turning creative ideas into memorable events. We don&apos;t just plan gatherings — we craft moments that linger long after the lights go down.
          </p>
          <p className="text-base text-muted leading-relaxed">
            From concept development to execution, from volunteer coordination to brand partnerships, VELVT operates as a full-service creative event studio. Every event we produce is designed with intention, attention to detail, and a commitment to creating something worth remembering.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container-velvt mb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 space-y-4 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.18)] transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
              <h3 className="font-display font-bold text-lg uppercase tracking-widest text-white">
                Our Mission
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              To create events and experiences that bring communities together, inspire creativity, and leave lasting impressions — not through scale, but through craft, atmosphere, and genuine connection.
            </p>
          </div>

          <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 space-y-4 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(200,16,46,0.18)] transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
              <h3 className="font-display font-bold text-lg uppercase tracking-widest text-white">
                Our Vision
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              To establish VELVT as a recognized name in experiential event production — known for cinematic quality, community spirit, and an unmistakable identity.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="container-velvt">
        <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(0,0,0,0.3)] space-y-6 max-w-4xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e]" />
            <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-white">
              The Experience Philosophy
            </h2>
          </div>
          <p className="text-base text-muted leading-relaxed">
            Every VELVT event is built around a simple principle: the experience should feel intentional. From the moment you hear about the event to the moment you leave, every touchpoint — the visual language, the atmosphere, the interactions, the pacing — is considered and designed.
          </p>
          <p className="text-base text-muted leading-relaxed">
            We believe events are not just gatherings. They are stories waiting to be told, communities waiting to form, and memories waiting to be made. That&apos;s the VELVT way.
          </p>
        </div>
      </section>
    </div>
    </PageStatusGate>
  );
}
