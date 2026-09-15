import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getSponsorVerificationData } from "@/app/actions";
import { getSession } from "@/lib/auth";
import DownloadQrButton from "@/components/ui/DownloadQrButton";
import { SponsorPassClient } from "./SponsorPassClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { identifier } = await params;
  return {
    title: `VIP Sponsor Pass Verification | VELVT`,
    description: `Official digital VIP Sponsor pass and credentials for VELVT nocturnal productions.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VerifySponsorPassPage({ params }: PageProps) {
  const { identifier } = await params;
  const [sponsorData, session] = await Promise.all([
    getSponsorVerificationData(identifier),
    getSession(),
  ]);

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  const baseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || "https://velvt.in");

  const isStaff = Boolean(
    session && (session.user.role === "admin" || session.user.role === "gateman" || session.user.role === "founder")
  );

  if (!sponsorData) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-red selection:text-white">
        <div className="w-full max-w-md rounded-2xl bg-[#0d0d0d] border border-red/40 p-8 text-center shadow-[0_0_50px_rgba(200,16,46,0.3)] animate-fade-in space-y-5">
          <div className="w-16 h-16 rounded-full bg-red/20 border-2 border-red flex items-center justify-center mx-auto text-red shadow-[0_0_20px_rgba(200,16,46,0.4)]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-red/20 text-red border border-red/30">
            Sponsor Pass Not Found
          </div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wider text-white">
            Unrecognized Credential
          </h1>
          <p className="text-sm text-g4 max-w-xs mx-auto">
            No official sponsor pass matches code <span className="font-mono text-white font-bold">{identifier}</span>. Please verify with VELVT Brand Operations.
          </p>
          <div className="pt-4 border-t border-white/10">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors"
            >
              &larr; Return to VELVT.in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const passUrl = `${baseUrl}/verify/sponsor/${encodeURIComponent(sponsorData.ticketNumber || identifier)}`;
  let qrSvg = "";
  try {
    const QRCode = await import("qrcode");
    qrSvg = await QRCode.toString(passUrl, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#050505",
        light: "#ffffff",
      },
    });
  } catch {
    qrSvg = "";
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center py-12 px-4 selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Ambient gold & velvet halos */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] rounded-full bg-red/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <SponsorPassClient
          sponsorData={sponsorData}
          identifier={identifier}
          qrSvg={qrSvg}
          passUrl={passUrl}
          isStaff={isStaff}
          staffName={session?.user.name || "Gate Staff"}
        />
      </div>
    </div>
  );
}
