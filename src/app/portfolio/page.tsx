import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const revalidate = 300;

export default async function PortfolioVanityPage() {
  const sahil = await prisma.teamMember.findFirst({
    where: {
      name: { contains: "Sahil", mode: "insensitive" },
      isPublished: true,
    },
  });

  if (!sahil) {
    redirect("/team");
  }

  redirect(`/team/${sahil.id}`);
}
