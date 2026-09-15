import { prisma } from "@/lib/db";
import { getPageStatus } from "@/lib/page-status";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { ContactForm } from "./ContactForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Collaboration — VELVT",
  description:
    "Get in touch with VELVT for event collaboration, media, sponsorship, venue partnerships, or general inquiries.",
};

export default async function ContactPage() {
  const [{ status, customTitle, customSubtitle }, siteSettings] = await Promise.all([
    getPageStatus("contact"),
    prisma.siteSetting.findMany().catch(() => []),
  ]);

  const settings: Record<string, string> = {};
  for (const s of siteSettings) {
    settings[s.key] = s.value;
  }

  return (
    <PageStatusGate
      pageKey="contact"
      status={status}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
    >
      <ContactForm
        contactEmail={settings.contact_email || "velvt.in@gmail.com"}
        phone={settings.phone || "+91 93951 78940"}
        socialInstagram={settings.social_instagram || "https://www.instagram.com/velvt.in"}
        socialWhatsapp={settings.social_whatsapp || "https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8"}
        location={settings.location || "Silchar, Assam, India"}
      />
    </PageStatusGate>
  );
}
