import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { adminLogout } from "@/app/actions";
import { AdminNav } from "./AdminNav";
import { adminPath, adminLoginPath } from "@/lib/admin-path";

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Admin Top Header Bar */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container-velvet py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={adminPath()} className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-wider text-white">
                VELVT<span className="text-red">.in</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-dim text-red border border-red-glow font-bold">
                Mgmt
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-[11px] font-mono text-g5 hover:text-white transition-colors hidden sm:inline-flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10"
            >
              <span>Live Site</span>
              <span className="text-red">&nearr;</span>
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-semibold text-white">{session.user.name}</p>
                  <p className="text-[10px] font-mono text-g5">
                    {session.user.email}
                  </p>
                </div>
                <form action={adminLogout}>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border border-white/15 bg-white/[0.05] text-g5 hover:text-red hover:border-red/40 transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={adminLoginPath()}
                className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border border-red-glow bg-red-dim text-white hover:bg-red/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Responsive Horizontal Admin Navigation Tabs */}
        {session && <AdminNav />}
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 container-velvet py-6 sm:py-8">{children}</main>
    </div>
  );
}
