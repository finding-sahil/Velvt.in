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
        <div className="container-velvt py-3 flex items-center justify-between gap-4">
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
                  <div className="flex items-center justify-end gap-1.5">
                    <p className="text-xs font-semibold text-white">{session.user.name}</p>
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                        session.user.role === "founder"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          : session.user.role === "core_team"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : session.user.role === "gateman"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-red-dim text-red border border-red-glow"
                      }`}
                    >
                      {session.user.role === "founder"
                        ? "Founder"
                        : session.user.role === "core_team"
                        ? "Core Team"
                        : session.user.role === "gateman"
                        ? "Gateman"
                        : "Main Admin"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-g5">
                    {session.user.email}
                  </p>
                </div>
                <form action={adminLogout}>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border border-white/15 bg-white/[0.05] text-g5 hover:text-red hover:border-red/40 transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={adminLoginPath()}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border border-red-glow bg-red-dim text-white hover:bg-red/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Responsive Horizontal Admin Navigation Tabs (Admins & Staff) */}
        {session && session.user.role !== "gateman" && (
          <AdminNav role={session.user.role} />
        )}

        {/* Dedicated Gateman Header Bar */}
        {session && session.user.role === "gateman" && (
          <div className="border-t border-white/[0.06] bg-emerald-950/20 py-2">
            <div className="container-velvt flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wider uppercase text-[11px]">
                  Official Gate Scanner & Admission Terminal
                </span>
              </div>
              <div className="text-[10px] text-g5">
                Staff ID: <span className="text-white font-bold">{session.user.name}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 container-velvt py-6 sm:py-8">{children}</main>
    </div>
  );
}
