import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GalleryManager } from "./GalleryManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminGalleryPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }
  if (session.user.role === "gateman") {
    redirect("/velvt-management/gate");
  }

  const [items, events] = await Promise.all([
    prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
      include: { event: { select: { id: true, name: true, date: true, status: true } } },
    }),
    prisma.event.findMany({
      select: { id: true, name: true, date: true, status: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <GalleryManager items={items} events={events} />
    </div>
  );
}
