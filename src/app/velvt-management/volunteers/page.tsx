import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateShort } from "@/lib/utils";
import { VolunteerActions } from "./VolunteerActions";

export default async function AdminVolunteersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/velvt-management/login");
  }

  const volunteers = await prisma.volunteer.findMany({
    orderBy: { appliedAt: "desc" },
    include: { event: { select: { name: true } } },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-red">
            Team &amp; Operations
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Volunteer Management
          </h1>
          <p className="text-xs text-g5 mt-1">
            Review submissions, assign roles, issue verified volunteer IDs, and manage team status.
          </p>
        </div>

        <div className="text-xs font-mono text-g5 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 self-start sm:self-auto">
          Total Registered: <span className="text-white font-bold">{volunteers.length}</span>
        </div>
      </div>

      {volunteers.length === 0 ? (
        <div className="border border-white/10 bg-white/[0.02] p-12 text-center rounded-2xl space-y-3">
          <p className="font-display font-bold text-xl text-white uppercase">No Volunteer Applications</p>
          <p className="text-xs text-g5">
            Submissions from the public volunteer registration form will appear here for review.
          </p>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10 text-g5 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Credential ID</th>
                  <th className="py-3.5 px-4">Volunteer Details</th>
                  <th className="py-3.5 px-4">Contact (Private)</th>
                  <th className="py-3.5 px-4">Event &amp; Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applied</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {volunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono">
                      {vol.volunteerId ? (
                        <span className="text-gold font-medium bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                          {vol.volunteerId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px] italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {vol.photo ? (
                          <img
                            src={vol.photo}
                            alt={vol.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center font-bold text-xs text-g5 shrink-0">
                            {vol.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white text-sm">{vol.fullName}</p>
                          <p className="text-g5 text-[11px] font-mono">
                            {vol.city}
                          </p>
                          {vol.socialLink && (
                            <a
                              href={vol.socialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red hover:underline block text-[10px] font-mono mt-0.5"
                            >
                              🔗 Social / Portfolio &nearr;
                            </a>
                          )}
                        </div>
                      </div>
                      {vol.experience && (
                        <p className="text-g5/80 text-[10px] mt-1.5 line-clamp-1 italic">
                          &ldquo;{vol.experience}&rdquo;
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] space-y-0.5">
                      <p className="text-g6">{vol.email}</p>
                      <p className="text-g5">{vol.phone}</p>
                    </td>

                    <td className="py-4 px-4 space-y-1">
                      <p className="text-white font-medium">{vol.event.name}</p>
                      <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-red bg-red-dim px-2 py-0.5 rounded-full border border-red-glow">
                        {vol.assignedRole || vol.preferredRole}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={vol.status} />
                    </td>

                    <td className="py-4 px-4 font-mono text-g5 text-[11px]">
                      {formatDateShort(vol.appliedAt)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <VolunteerActions
                        id={vol.id}
                        status={vol.status}
                        volunteerId={vol.volunteerId}
                        fullName={vol.fullName}
                        assignedRole={vol.assignedRole || vol.preferredRole}
                        currentPhoto={vol.photo}
                        currentSocialLink={vol.socialLink}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
