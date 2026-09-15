import { getSession } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export const metadata = {
  title: "Management | VELVT",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If no session (e.g. login page), render full-width clean page
  if (!session) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans">
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          {children}
        </main>
      </div>
    );
  }

  // If Gateman role, streamlined dedicated terminal view
  if (session.user.role === "gateman") {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans">
        <AdminNav user={session.user} />
        <main className="flex-1 container-velvt py-6 sm:py-8">{children}</main>
      </div>
    );
  }

  // Modern Left-Sidebar Admin Architecture
  return (
    <div
      suppressHydrationWarning
      className="admin-shell min-h-screen bg-[#050507] text-white flex flex-col md:flex-row font-sans selection:bg-red selection:text-white"
    >
      {/* ─── Left Sidebar Navigation (Desktop Fixed + Mobile Drawer) ─── */}
      <AdminNav user={session.user} />

      {/* ─── Main Content Canvas (Right Side) ─── */}
      <div className="admin-canvas flex-1 flex flex-col min-w-0 min-h-screen bg-black/40">
        {/* Subtle Ambient Background Gradient */}
        <div className="fixed top-0 right-0 w-[500px] h-[350px] bg-red/5 rounded-full filter blur-[140px] pointer-events-none -z-10" />

        {/* Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 pt-5 pb-10 w-full max-w-[1720px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
