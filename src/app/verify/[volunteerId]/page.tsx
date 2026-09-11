import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import QRCode from "qrcode";

interface VerifyPageProps {
  params: Promise<{ volunteerId: string }>;
}

export async function generateMetadata({
  params,
}: VerifyPageProps): Promise<Metadata> {
  const { volunteerId } = await params;
  return {
    title: `Verify ${volunteerId} — VELVT`,
    description: `Verify volunteer ID ${volunteerId} on the official VELVT volunteer registry.`,
  };
}

export const revalidate = 0;

export default async function VerifyVolunteerPage({
  params,
}: VerifyPageProps) {
  const { volunteerId } = await params;
  const decodedId = decodeURIComponent(volunteerId);

  // Query ONLY public-safe fields — never return email, phone, adminNotes
  const volunteer = await prisma.volunteer
    .findUnique({
      where: { volunteerId: decodedId },
      select: {
        volunteerId: true,
        fullName: true,
        status: true,
        assignedRole: true,
        preferredRole: true,
        approvedAt: true,
        socialLink: true,
        photo: true,
        event: {
          select: {
            name: true,
            date: true,
          },
        },
      },
    })
    .catch(() => null);

  // ─── Not Found State ────────────────────────────────────────────────────────
  if (!volunteer) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full mx-auto text-center rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(200,16,46,0.2)] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-dim border border-red-glow flex items-center justify-center">
            <span className="text-2xl text-primary font-bold">✕</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            Verification Not Found
          </h1>
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />
          <p className="text-xs text-primary font-mono tracking-widest uppercase bg-white/[0.04] py-1.5 px-3 rounded-full border border-white/10 inline-block">
            ID: {decodedId}
          </p>
          <p className="text-sm text-muted leading-relaxed">
            No volunteer record was found matching this credential ID. Please verify the code or contact the VELVT production desk.
          </p>
          <div className="pt-2">
            <a
              href="/verify"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono uppercase tracking-widest text-white hover:border-primary/40 hover:text-primary transition-all"
            >
              ← Try Another ID
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Revoked State ──────────────────────────────────────────────────────────
  if (volunteer.status === "revoked") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full mx-auto text-center rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(200,16,46,0.2)] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-dim border border-red-glow flex items-center justify-center">
            <span className="text-2xl text-primary font-bold">⊘</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            Record Revoked
          </h1>
          <div className="w-12 h-0.5 bg-primary shadow-[0_0_12px_#c8102e] mx-auto" />
          <p className="text-xs text-primary font-mono tracking-widest uppercase bg-white/[0.04] py-1.5 px-3 rounded-full border border-white/10 inline-block">
            ID: {volunteer.volunteerId}
          </p>
          <p className="text-sm text-muted leading-relaxed">
            This volunteer credential has been archived or revoked. If you believe this is an error, please contact the VELVT production desk.
          </p>
          <div className="pt-2">
            <a
              href="/verify"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono uppercase tracking-widest text-white hover:border-primary/40 hover:text-primary transition-all"
            >
              ← Return to Verification
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pending State ──────────────────────────────────────────────────────────
  if (volunteer.status === "pending") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full mx-auto text-center rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-12 shadow-[0_0_40px_rgba(200,16,46,0.2)] space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <span className="text-2xl text-amber-400">⏳</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            Pending Review
          </h1>
          <div className="w-12 h-0.5 bg-amber-500/50 mx-auto" />
          <p className="text-xs text-amber-400 font-mono tracking-widest uppercase bg-white/[0.04] py-1.5 px-3 rounded-full border border-white/10 inline-block">
            ID: {volunteer.volunteerId}
          </p>
          <p className="text-sm text-muted leading-relaxed">
            This volunteer application is currently undergoing verification by the production team. Once approved, the official credential will appear here.
          </p>
        </div>
      </div>
    );
  }

  // ─── Verified / Approved State ──────────────────────────────────────────────
  const year = volunteer.event
    ? new Date(volunteer.event.date).getFullYear()
    : null;

  let qrSvg = "";
  try {
    const verifyUrl = `https://velvt.in/verify/${encodeURIComponent(volunteer.volunteerId || "")}`;
    qrSvg = await QRCode.toString(verifyUrl, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#ffffff",
        light: "#00000000",
      },
    });
  } catch {
    qrSvg = "";
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 relative overflow-hidden">
      {/* Background ambient red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[130px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10 space-y-6">
        {/* Verification Card */}
        <div className="rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-[14px] p-8 sm:p-10 shadow-[0_0_50px_rgba(200,16,46,0.25)] relative overflow-hidden">
          {/* Top Neon Red Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_14px_#c8102e]" />

          {/* Status indicator & Brand */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-dim border border-red-glow">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c8102e] animate-pulse" />
              <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-white">
                Official Credential
              </span>
            </div>
            <p className="font-display font-black text-lg tracking-wider text-white">
              VELVT<span className="text-primary">.in</span>
            </p>
          </div>

          {/* Optional Official Photo */}
          {volunteer.photo && (
            <div className="mb-6 flex items-center justify-center">
              <div className="relative">
                <img
                  src={volunteer.photo}
                  alt={volunteer.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-primary shadow-[0_0_25px_rgba(200,16,46,0.4)]"
                />
                <span className="absolute -bottom-1.5 -right-1.5 bg-primary text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-black shadow">
                  ID PASS
                </span>
              </div>
            </div>
          )}

          {/* Volunteer Info */}
          <div className="space-y-5">
            <VerifyField label="Volunteer Name" value={volunteer.fullName} />
            <VerifyField
              label="Credential ID"
              value={volunteer.volunteerId || ""}
              mono
            />
            {volunteer.event && (
              <VerifyField label="Event Production" value={volunteer.event.name} />
            )}
            <VerifyField
              label="Assigned Specialization"
              value={
                volunteer.assignedRole ||
                volunteer.preferredRole
              }
            />
            {year && <VerifyField label="Production Year" value={year.toString()} />}
            <VerifyField
              label="Verification Status"
              value={
                volunteer.status === "verified"
                  ? "Verified Contributor"
                  : "Approved Contributor"
              }
              highlight
            />

            {(() => {
              if (!volunteer.socialLink) return null;
              let soc: {
                instagram?: string;
                linkedin?: string;
                twitter?: string;
                phone?: string;
                portfolio?: string;
              } | null = null;
              try {
                soc = JSON.parse(volunteer.socialLink);
              } catch {}

              if (soc && (soc.instagram || soc.linkedin || soc.twitter || soc.phone || soc.portfolio)) {
                return (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <p className="text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted/60">
                      Verified Member Links &amp; Contact
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {soc.instagram && (
                        <a
                          href={soc.instagram.startsWith("http") ? soc.instagram : `https://instagram.com/${soc.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-white hover:border-primary hover:text-primary transition-all"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span>Instagram</span>
                        </a>
                      )}
                      {soc.linkedin && (
                        <a
                          href={soc.linkedin.startsWith("http") ? soc.linkedin : `https://linkedin.com/in/${soc.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-white hover:border-blue-400 hover:text-blue-400 transition-all"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {soc.phone && (
                        <a
                          href={`https://wa.me/${soc.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-emerald-400 hover:border-emerald-400 hover:text-white hover:bg-emerald-600/20 transition-all"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                          </svg>
                          <span>WhatsApp: {soc.phone}</span>
                        </a>
                      )}
                      {soc.portfolio && (
                        <a
                          href={soc.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-white hover:border-primary hover:text-primary transition-all"
                        >
                          <span>🔗</span> Portfolio &nearr;
                        </a>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div>
                  <p className="text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted/60 mb-1">
                    Verified Social Profile
                  </p>
                  <a
                    href={volunteer.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono text-xs flex items-center gap-1.5 break-all"
                  >
                    <span>🔗</span> {volunteer.socialLink} &nearr;
                  </a>
                </div>
              );
            })()}
          </div>

          {/* QR Code Verification Section */}
          {qrSvg && (
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center text-center space-y-2">
              <div
                className="w-32 h-32 p-2 bg-white/[0.04] border border-white/15 rounded-xl flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <span className="text-[10px] font-mono text-muted/60 tracking-wider uppercase">
                Scan to Verify Credential Authenticity
              </span>
              <a
                href={`/verify/${encodeURIComponent(volunteer.volunteerId || "")}`}
                className="text-[9px] font-mono text-primary hover:underline break-all"
              >
                https://velvt.in/verify/{volunteer.volunteerId}
              </a>
            </div>
          )}

          {/* Verification timestamp */}
          {volunteer.approvedAt && (
            <p className="text-[10px] text-muted/50 font-mono mt-6 pt-4 border-t border-white/10 text-center">
              Verified on{" "}
              {new Date(volunteer.approvedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted/60 font-mono px-2">
          <a href="/verify" className="hover:text-primary transition-colors">
            ← Search Another
          </a>
          <a href="/volunteers" className="hover:text-primary transition-colors">
            Volunteer Directory →
          </a>
        </div>
      </div>
    </div>
  );
}


function VerifyField({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-muted/60 mb-1">
        {label}
      </p>
      <p
        className={`text-base sm:text-lg font-bold ${
          mono ? "font-mono tracking-wider" : "font-display uppercase tracking-wide"
        } ${highlight ? "text-primary drop-shadow-[0_0_8px_rgba(200,16,46,0.3)]" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
