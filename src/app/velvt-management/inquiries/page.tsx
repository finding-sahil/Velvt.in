import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InquiryManager } from "./InquiryManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminInquiriesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }
  if (session.user.role === "gateman") {
    redirect("/velvt-management/gate");
  }

  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <InquiryManager inquiries={inquiries} />;
}
