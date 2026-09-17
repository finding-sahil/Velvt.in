import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { adminPath, adminLoginPath } from "@/lib/admin-path";
import { prisma } from "@/lib/db";
import { SubscribersManager } from "./SubscribersManager";

export const metadata = {
  title: "The Velvet Loop (Subscribers) | VELVT Management",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSubscribersPage() {
  const session = await getSession();
  if (!session) {
    redirect(adminLoginPath());
  }
  if (session.user.role === "gateman") {
    redirect(adminPath("/gate"));
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <SubscribersManager initialSubscribers={subscribers} />;
}
