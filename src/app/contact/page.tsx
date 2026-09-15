import { getPageStatus } from "@/lib/page-status-server";
import { getCachedSiteSettings } from "@/lib/settings-cache";
import { PageStatusGate } from "@/components/ui/PageStatusGate";
import { ContactForm } from "./ContactForm";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact & Collaboration — VELVT",
  description:
    "Get in touch with VELVT for event collaboration, media, sponsorship, venue partnerships, or general inquiries.",
};

export default async function ContactPage() {
  const [{ status, customTitle, customSubtitle }, settings] = await Promise.all([
    getPageStatus("contact"),
    getCachedSiteSettings(),
  ]);


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
