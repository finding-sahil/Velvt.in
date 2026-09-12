import { Metadata } from "next";
import { getTicketVerificationData } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { TicketVerifier } from "./TicketVerifier";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ identifier: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { identifier } = await params;
  return {
    title: `Ticket Pass Verification | VELVT`,
    description: `Official digital pass and ticket verification for VELVT events.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VerifyTicketPage({ params }: PageProps) {
  const { identifier } = await params;
  const [ticket, session] = await Promise.all([
    getTicketVerificationData(identifier),
    getSession(),
  ]);

  const isAuthorizedStaff = Boolean(
    session && (session.user.role === "admin" || session.user.role === "gateman")
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 selection:bg-red selection:text-white">
      <div className="w-full max-w-md my-auto">
        <TicketVerifier
          initialTicket={ticket}
          identifier={identifier}
          isAuthorizedStaff={isAuthorizedStaff}
          staffName={session?.user.name || "Gate Staff"}
        />
      </div>
    </div>
  );
}
