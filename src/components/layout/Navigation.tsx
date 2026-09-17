"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { GlobalSearchTrigger } from "@/components/ui/GlobalSearchModal";

const GlobalSearchModal = dynamic(
  () => import("@/components/ui/GlobalSearchModal").then((mod) => mod.GlobalSearchModal),
  { ssr: false }
);


const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/tickets", label: "Tickets" },
  { href: "/volunteers", label: "Volunteers" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/team", label: "Core Team" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key or outside click
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  // Don't render on management or locked standalone link tree pages
  if (
    pathname?.startsWith("/velvt-management") ||
    pathname === "/links" ||
    pathname === "/linktree"
  ) {
    return null;
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <header ref={headerRef} className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[860px] z-50">
        {/* Floating Glass Capsule Navigation Bar */}
        <nav className="h-[54px] rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Brand Logo with Red Dot Accent */}
          <Link
            href="/"
            className="font-display font-black text-xl tracking-[0.08em] uppercase text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
          >
            <span>VELVT</span>
            <span className="text-red">.in</span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-7">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-[0.75rem] font-medium tracking-[0.16em] uppercase transition-colors duration-200 ${
                      isActive
                        ? "text-red font-bold drop-shadow-[0_0_8px_var(--red-glow)]"
                        : "text-g6 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Search Trigger & Social Link on right */}
          <div className="hidden sm:flex items-center gap-2">
            <GlobalSearchTrigger />
            <a
              href="https://www.instagram.com/velvt.in"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow on Instagram @velvt.in"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 rounded-full text-g5 hover:text-red transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* Mobile Hamburger Toggle & Search Icon */}
          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
              aria-label="Search site"
              className="p-2 text-g5 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
              </svg>
            </button>
            <button
              className="flex flex-col justify-center items-center gap-1.5 min-w-[44px] min-h-[44px] p-2 text-white cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span
                className={`block w-5 h-0.5 bg-white transition-transform duration-300 ${
                  mobileOpen ? "rotate-45 translate-y-[4px]" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-white transition-opacity duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-white transition-transform duration-300 ${
                  mobileOpen ? "-rotate-45 -translate-y-[4px]" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-smooth mt-2 rounded-[20px] border border-white/10 bg-black/95 backdrop-blur-2xl ${
            mobileOpen ? "max-h-[calc(100vh-5.5rem)] overflow-y-auto p-5 shadow-2xl" : "max-h-0 p-0 border-transparent"
          }`}
        >
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium tracking-[0.14em] uppercase py-2.5 min-h-[44px] flex items-center transition-colors ${
                pathname === "/" ? "text-red font-bold" : "text-g6 hover:text-white"
              }`}
            >
              Home
            </Link>
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium tracking-[0.14em] uppercase py-2.5 min-h-[44px] flex items-center transition-colors ${
                    isActive ? "text-red font-bold" : "text-g6 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Socials & Quick Links inside Mobile Menu */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/velvt.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white"
                >
                  <span className="text-red">📷</span> Instagram
                </a>
                <a
                  href="https://chat.whatsapp.com/E5F1PCTqmgU2ljE2rtuzl8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white"
                >
                  <span className="text-emerald-400">💬</span> WhatsApp Updates
                </a>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/gallery"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-mono text-g5 hover:text-white uppercase tracking-wider"
                >
                  Archive Gallery →
                </Link>
                <Link
                  href="/verify"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs font-mono text-g5 hover:text-white uppercase tracking-wider"
                >
                  Verify Credential
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal Mount */}
      <GlobalSearchModal />
    </>
  );
}
