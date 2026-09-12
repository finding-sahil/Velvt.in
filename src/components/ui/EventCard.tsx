import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, getYear, eventStatusLabels } from "@/lib/utils";

interface EventCardProps {
  name: string;
  slug: string;
  date: Date | string;
  status: string;
  description: string;
  coverImage?: string | null;
  venue?: { city: string } | null;
  variant?: "default" | "featured";
}

export function EventCard({
  name,
  slug,
  date,
  status,
  description,
  coverImage,
  venue,
  variant = "default",
}: EventCardProps) {
  if (variant === "featured") {
    return (
      <Link
        href={`/events/${slug}`}
        className="glass-card group block relative overflow-hidden"
      >
        <div className="grid md:grid-cols-2 min-h-[360px]">
          {/* Image Side */}
          <div className="relative bg-black/40 overflow-hidden">
            {coverImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="font-display font-black text-6xl text-white/10">V</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
          </div>

          {/* Content Side */}
          <div className="relative p-7 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge
                status={status}
                label={eventStatusLabels[status] || status}
                size="sm"
              />
              <span className="text-xs font-mono text-g5">{getYear(date)}</span>
            </div>

            <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-3 group-hover:text-red transition-colors duration-200 uppercase tracking-wide">
              {name}
            </h3>

            <p className="text-xs sm:text-sm text-g6 leading-relaxed mb-5 line-clamp-3">
              {description}
            </p>

            <div className="flex items-center gap-3 text-xs text-g5 font-mono mb-6">
              <span>{formatDate(date)}</span>
              {venue?.city && (
                <>
                  <span className="text-white/20">·</span>
                  <span>{venue.city}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-red font-display font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
              <span>View Production Dossier</span>
              <span className="text-base leading-none">→</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant (Standard Archive Card)
  return (
    <Link
      href={`/events/${slug}`}
      className="glass-card group block relative overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
        {coverImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="font-display font-black text-5xl text-white/10">V</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <StatusBadge
            status={status}
            label={eventStatusLabels[status] || status}
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-3 text-xs text-g5 font-mono">
          <span>{getYear(date)}</span>
          <span className="text-white/20">·</span>
          <span>{formatDate(date)}</span>
          {venue?.city && (
            <>
              <span className="text-white/20">·</span>
              <span>{venue.city}</span>
            </>
          )}
        </div>

        <h3 className="font-display font-bold text-xl text-white group-hover:text-red transition-colors duration-200 uppercase tracking-wide">
          {name}
        </h3>

        <p className="text-xs sm:text-sm text-g6 leading-relaxed line-clamp-2">
          {description}
        </p>

        <div className="pt-2 flex items-center justify-between text-xs font-mono text-red font-semibold uppercase tracking-wider">
          <span>Explore Event</span>
          <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
        </div>
      </div>
    </Link>
  );
}
