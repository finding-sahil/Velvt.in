import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export const revalidate = 300;

export default async function FounderVanityPage() {
  const founder = await prisma.teamMember.findFirst({
    where: {
      OR: [
        { category: { contains: "Founder", mode: "insensitive" } },
        { role: { contains: "Founder", mode: "insensitive" } },
      ],
      isPublished: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  if (!founder) {
    redirect("/team");
  }

  redirect(`/team/${founder.id}`);
}
