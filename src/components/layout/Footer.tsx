import Link from "next/link";
import { prisma } from "@/lib/db";

const footerLinks = {
  explore: [
    { href: "/events", label: "Events" },
    { href: "/tickets", label: "Tickets" },
    { href: "/gallery", label: "Archive" },
    { href: "/volunteers", label: "Volunteers" },
  ],
  organization: [
    { href: "/about", label: "About" },
    { href: "/team", label: "Core Team" },
    { href: "/press", label: "Press & Sponsors" },
    { href: "/contact", label: "Contact" },
  ],
  resources: [
    { href: "/verify", label: "Verify Volunteer" },
    { href: "/volunteers/register", label: "Join As Volunteer" },
  ],
};

export async function Footer() {
  const year = new Date().getFullYear();

  const siteSettings = await prisma.siteSetting.findMany().catch(() => []);
  const settings: Record<string, string> = {};
  for (const s of siteSettings) {
    settings[s.key] = s.value;
  }

  const location = settings.location || "Silchar, Assam, India";
  const phone = settings.phone || "+91 93951 78940";
  const cleanPhone = phone.replace(/\s+/g, "");
  const instagram = settings.social_instagram || "https://www.instagram.com/velvt.in";
  const whatsapp = settings.social_whatsapp || "https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8";

  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-xl mt-16">
      <div className="container-velvt py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href="/"
              className="font-display font-black text-2xl tracking-[0.08em] text-white hover:opacity-90 transition-opacity uppercase inline-block"
            >
              VELVT<span className="text-red">.in</span>
            </Link>
            
            <p className="text-xs text-g5 italic max-w-xs leading-relaxed">
              "It starts as a thought, ends as a memory."
            </p>

            <div className="pt-2 space-y-2">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-g5 uppercase bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                  {location}
                </span>
              </div>
              <div>
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-[11px] font-mono text-g5 hover:text-white transition-colors inline-flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/10 hover:border-red/40"
                >
                  <span>📞</span>
                  <span>{phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-red">
              Explore
            </p>
            <ul className="space-y-1">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-g6 hover:text-white transition-colors duration-150 py-1.5 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization Links */}
          <div className="space-y-3">
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-red">
              Organization
            </p>
            <ul className="space-y-1">
              {footerLinks.organization.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-g6 hover:text-white transition-colors duration-150 py-1.5 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Ops */}
          <div className="space-y-3">
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-red">
              Verification & Crew
            </p>
            <ul className="space-y-1">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-g6 hover:text-white transition-colors duration-150 py-1.5 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-g5">
                Join Community & Contact
              </p>
              <div className="flex flex-col gap-1 text-xs font-mono">
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-g6 hover:text-white transition-colors flex items-center gap-1.5 py-1 min-h-[32px]"
                >
                  <span>📞</span> {phone}
                </a>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-g6 hover:text-red transition-colors flex items-center gap-1.5 py-1 min-h-[32px]"
                >
                  <span>📷</span> Instagram @velvt.in
                </a>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-g6 hover:text-emerald-400 transition-colors flex items-center gap-1.5 py-1 min-h-[32px]"
                >
                  <span>💬</span> WhatsApp Updates Group
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-[11px] font-mono text-g5 uppercase tracking-wider">
              © {year} VELVT. All rights reserved.
            </p>
            <a
              href="https://www.instagram.com/finding.sahil/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-g5 hover:text-white transition-colors tracking-wider flex items-center gap-1 group py-2 px-1"
            >
              <span>Created with</span>
              <span className="text-red group-hover:scale-125 transition-transform inline-block">❤️</span>
              <span>by</span>
              <span className="text-white group-hover:text-red transition-colors underline decoration-white/20 underline-offset-4 font-semibold">Sahil</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-g5 hover:text-red transition-colors uppercase tracking-wider py-2 px-1 inline-block"
            >
              Instagram
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-g5 hover:text-emerald-400 transition-colors uppercase tracking-wider py-2 px-1 inline-block"
            >
              WhatsApp
            </a>
            {/* Admin link intentionally removed for security */}
          </div>
        </div>
      </div>
    </footer>
  );
}
