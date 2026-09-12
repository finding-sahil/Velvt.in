"use client";

import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AppShell({ children, footer }: AppShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/velvt-management");

  if (isAdmin) {
    return (
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 pt-24">{children}</main>
      {footer}
    </>
  );
}
