import Link from "next/link";

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
    { href: "/press", label: "Press & Media" },
    { href: "/contact", label: "Contact" },
  ],
  resources: [
    { href: "/verify", label: "Verify Volunteer" },
    { href: "/volunteers/register", label: "Join As Volunteer" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-xl mt-16">
      <div className="container-velvet py-14 space-y-12">
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
              &ldquo;It starts as a thought, ends as a memory.&rdquo;
            </p>

            <div className="pt-2">
              <span className="text-[10px] font-mono tracking-widest text-g5 uppercase bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10">
                Kolkata, India
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-red">
              Explore
            </h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-g6 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-red">
              Organization
            </h4>
            <ul className="space-y-2">
              {footerLinks.organization.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-g6 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Ops */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-red">
              Verification &amp; Crew
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-g6 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <h5 className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-g5">
                Join Community
              </h5>
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <a
                  href="https://www.instagram.com/velvt.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-g6 hover:text-red transition-colors flex items-center gap-1.5"
                >
                  <span>📷</span> Instagram @velvt.in
                </a>
                <a
                  href="https://chat.whatsapp.com/invite/velvt-community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-g6 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>💬</span> WhatsApp VIP Group
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] font-mono text-g5 uppercase tracking-wider">
            © {year} VELVT. Experiential Events &amp; Creative Productions.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/velvt.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-g5 hover:text-red transition-colors uppercase tracking-wider"
            >
              Instagram
            </a>
            <a
              href="https://chat.whatsapp.com/invite/velvt-community"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-g5 hover:text-emerald-400 transition-colors uppercase tracking-wider"
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
