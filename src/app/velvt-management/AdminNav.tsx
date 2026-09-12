"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminPath } from "@/lib/admin-path";

interface AdminNavProps {
  role?: string;
}

const allNavItems = [
  { href: adminPath(), label: "Overview", icon: "📊" },
  { href: adminPath("/events"), label: "Events & Tickets", icon: "🎟️" },
  { href: adminPath("/tickets"), label: "Passes & QR", icon: "🎫" },
  { href: adminPath("/gatemen"), label: "Gatemen & Access", icon: "🛡️", adminOnly: true },
  { href: adminPath("/gate"), label: "Live Gate Scanner", icon: "📷" },
  { href: adminPath("/volunteers"), label: "Volunteers", icon: "🤝" },
  { href: adminPath("/team"), label: "Core Team", icon: "👥" },
  { href: adminPath("/gallery"), label: "Gallery", icon: "🖼️" },
  { href: adminPath("/partners"), label: "Partners & Press", icon: "📰" },
  { href: adminPath("/inquiries"), label: "Inquiries", icon: "📬" },
  { href: adminPath("/settings"), label: "CMS Settings", icon: "⚙️", adminOnly: true },
];

export function AdminNav({ role = "admin" }: AdminNavProps) {
  const pathname = usePathname();
  const prefix = adminPath();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCoreTeam = role === "core_team";

  const navItems = isCoreTeam
    ? allNavItems.filter((item) => !item.adminOnly)
    : allNavItems;

  const currentItem =
    navItems.find((item) =>
      item.href === prefix
        ? pathname === prefix
        : pathname === item.href || pathname?.startsWith(item.href + "/")
    ) || navItems[0];

  return (
    <div className="border-t border-white/[0.08] bg-white/[0.01]">
      <div className="container-velvt py-2">
        {/* Mobile View: Clean Section Pill Selector */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-white tracking-wider uppercase font-bold"
            >
              <span>{currentItem.icon}</span>
              <span>{currentItem.label}</span>
              <span className="text-red text-[10px] ml-1">▼</span>
            </button>
            <span className="text-[10px] font-mono text-g5 uppercase tracking-widest">
              Navigation Menu
            </span>
          </div>

          {/* Expandable Mobile Grid */}
          {mobileOpen && (
            <div className="mt-2.5 p-3 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-2xl grid grid-cols-2 gap-2 animate-fade-in shadow-2xl">
              {navItems.map((item) => {
                const isActive =
                  item.href === prefix
                    ? pathname === prefix
                    : pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
                      isActive
                        ? "bg-red text-white font-bold shadow-[0_0_15px_var(--red-glow)]"
                        : "bg-white/[0.03] text-g5 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop View: Smooth Horizontal Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono whitespace-nowrap overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive =
              item.href === prefix
                ? pathname === prefix
                : pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full uppercase tracking-wider text-[11px] transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-red-dim border border-red-glow text-white font-bold shadow-[0_0_12px_var(--red-glow)]"
                    : "text-g5 hover:text-white hover:bg-white/[0.06] border border-transparent"
                }`}
              >
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-red shadow-[0_0_8px_var(--red)] animate-pulse" />
                ) : (
                  <span className="text-[10px] opacity-60">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
