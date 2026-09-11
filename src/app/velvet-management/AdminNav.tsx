"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminPath } from "@/lib/admin-path";

const navItems = [
  { href: adminPath(), label: "Overview" },
  { href: adminPath("/events"), label: "Events & Tickets" },
  { href: adminPath("/volunteers"), label: "Volunteers" },
  { href: adminPath("/team"), label: "Core Team" },
  { href: adminPath("/gallery"), label: "Gallery" },
  { href: adminPath("/partners"), label: "Partners & Press" },
  { href: adminPath("/inquiries"), label: "Inquiries" },
  { href: adminPath("/settings"), label: "CMS Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const prefix = adminPath();

  return (
    <div className="border-t border-white/[0.06] bg-white/[0.01]">
      <div className="container-velvet overflow-x-auto no-scrollbar py-2">
        <nav className="flex items-center gap-1.5 text-xs font-mono whitespace-nowrap min-w-max">
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
                    ? "bg-red-dim border border-red-glow text-white font-bold shadow-[0_0_12px_rgba(200,16,46,0.35)]"
                    : "text-g5 hover:text-white hover:bg-white/[0.06] border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red shadow-[0_0_6px_#c8102e] animate-pulse" />
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
