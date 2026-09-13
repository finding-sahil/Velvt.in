import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { TestimonialsManager } from "./TestimonialsManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials CMS — VELVT Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await requireAdmin();

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red mb-1">
          <span>●</span>
          <span>Social Proof &amp; Advocacy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
          Testimonials CMS
        </h1>
        <p className="text-xs sm:text-sm text-g5 mt-1">
          Manage, curate, approve, and order testimonials from corporate sponsors, brand partners, and production crew volunteers.
        </p>
      </div>

      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  );
}
