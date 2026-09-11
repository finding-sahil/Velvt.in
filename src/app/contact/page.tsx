import { getPageStatus } from "@/lib/page-status";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { ContactForm } from "./ContactForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contact & Collaboration — VELVT",
  description:
    "Get in touch with VELVT for event collaboration, media, sponsorship, venue partnerships, or general inquiries.",
};

export default async function ContactPage() {
  const { status, customTitle, customSubtitle } = await getPageStatus("contact");

  return (
    <PageStatusGate
      pageKey="contact"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <ContactForm />
    </PageStatusGate>
  );
}
