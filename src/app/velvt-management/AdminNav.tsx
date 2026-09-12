"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { adminPath } from "@/lib/admin-path";
import { adminLogout } from "@/app/actions";

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

interface AdminNavProps {
  user?: AdminUser;
}

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
  icon: (props: { className?: string }) => React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "DASHBOARD",
    items: [
      {
        href: adminPath(),
        label: "Overview",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "EVENTS & TICKETING",
    items: [
      {
        href: adminPath("/events"),
        label: "Events & Tickets",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" />
            <path d="M13 17v2" />
            <path d="M13 11v2" />
          </svg>
        ),
      },
      {
        href: adminPath("/tickets"),
        label: "Passes & QR",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
          </svg>
        ),
      },
      {
        href: adminPath("/gate"),
        label: "Live Gate Scanner",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" x2="17" y1="12" y2="12" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "STAFF & ROLES",
    items: [
      {
        href: adminPath("/gatemen"),
        label: "Gatemen & Access",
        adminOnly: true,
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ),
      },
      {
        href: adminPath("/volunteers"),
        label: "Volunteers",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
        ),
      },
      {
        href: adminPath("/team"),
        label: "Core Team",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 21a8 8 0 0 0-16 0" />
            <circle cx="10" cy="8" r="5" />
            <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "CONTENT & SYSTEM",
    items: [
      {
        href: adminPath("/gallery"),
        label: "Gallery",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        ),
      },
      {
        href: adminPath("/partners"),
        label: "Partners & Press",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
          </svg>
        ),
      },
      {
        href: adminPath("/inquiries"),
        label: "Inquiries",
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        ),
      },
      {
        href: adminPath("/settings"),
        label: "CMS Settings",
        adminOnly: true,
        icon: ({ className }) => (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
      },
    ],
  },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const prefix = adminPath();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isCoreTeam = user?.role === "core_team";
  const isGateman = user?.role === "gateman";

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "founder":
        return {
          label: "Founder",
          classes: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        };
      case "core_team":
        return {
          label: "Core Team",
          classes: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
      case "gateman":
        return {
          label: "Gateman",
          classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
      default:
        return {
          label: "Administrator",
          classes: "bg-red-dim text-red border-red-glow",
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  // Gateman dedicated layout
  if (isGateman) {
    return (
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-xl tracking-wider text-white">
              VELVT<span className="text-red">.in</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Gate Terminal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-g5 hidden sm:inline">
              Scanner: <span className="text-white font-bold">{user?.name}</span>
            </span>
            <form action={adminLogout}>
              <button
                type="submit"
                className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border border-white/10 bg-white/[0.04] text-g5 hover:text-red hover:border-red/40 transition-all cursor-pointer"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
    );
  }

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* ─── Top Brand Header ─── */}
      <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
        <Link href={adminPath()} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red to-red-dim border border-red/40 flex items-center justify-center font-display font-black text-white text-base shadow-[0_0_15px_var(--red-glow)] group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-wider text-white leading-none">
              VELVT<span className="text-red">.in</span>
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-g5 mt-0.5">
              Admin Console
            </span>
          </div>
        </Link>
        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-dim text-red border border-red-glow font-bold">
          v2.0
        </span>
      </div>

      {/* ─── Scrollable Navigation Sections ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (isCoreTeam && item.adminOnly) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-g5 font-bold">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    item.href === prefix
                      ? pathname === prefix
                      : pathname === item.href || pathname?.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-200 ${
                        isActive
                          ? "bg-red/10 text-white font-semibold border border-red/25 shadow-[0_0_15px_rgba(200,16,46,0.15)]"
                          : "text-g5 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      {/* Active Left Accent Pill */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-red shadow-[0_0_8px_var(--red)]" />
                      )}
                      <item.icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? "text-red" : "text-g5 group-hover:text-white"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Bottom Profile & Quick Links ─── */}
      <div className="p-3 border-t border-white/[0.08] bg-black/40 space-y-2">
        {user && (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center font-display font-bold text-sm text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              </div>
              <span
                className={`inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded border font-semibold mt-0.5 ${roleInfo.classes}`}
              >
                {roleInfo.label}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Link
            href="/"
            target="_blank"
            className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-g5 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <span>Live Site</span>
            <span className="text-red">↗</span>
          </Link>
          <form action={adminLogout} className="flex-1">
            <button
              type="submit"
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-red/15 border border-white/10 hover:border-red/40 text-[11px] font-mono text-g5 hover:text-red transition-all cursor-pointer flex items-center justify-center"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Mobile Sticky Top Bar ─── */}
      <div className="md:hidden sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <Link href={adminPath()} className="flex items-center gap-2">
          <span className="font-display font-black text-xl tracking-wider text-white">
            VELVT<span className="text-red">.in</span>
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-dim text-red border border-red-glow font-bold">
            Mgmt
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* ─── Mobile Full-Screen Overlay Drawer ─── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Sidebar */}
          <aside className="relative w-72 max-w-[85vw] bg-[#09090b] border-r border-white/[0.1] h-full shadow-2xl flex flex-col z-10 animate-fade-in-up">
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* ─── Desktop Left Fixed Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 xl:w-72 bg-[#09090b] border-r border-white/[0.08] min-h-screen sticky top-0 h-screen z-30 flex-shrink-0">
        {renderNavContent()}
      </aside>
    </>
  );
}
