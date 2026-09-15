import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function TicketIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function SpotifyIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export function YouTubeIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function CrownIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}

export function HeadphonesIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function CameraIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function CrewIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function BriefcaseIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export function PhoneIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function MailIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function MapPinIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function LightningIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function FireIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

export function LinkGlobeIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function StarBadgeIcon({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export interface RealIconDefinition {
  id: string;
  name: string;
  component: React.ComponentType<IconProps>;
  colorClass: string;
  glowClass: string;
}

export const REAL_ICON_OPTIONS: RealIconDefinition[] = [
  { id: "ticket", name: "Pass / Tickets", component: TicketIcon, colorClass: "text-red-500", glowClass: "shadow-[0_0_15px_rgba(239,68,68,0.4)]" },
  { id: "crown", name: "VIP / Royal", component: CrownIcon, colorClass: "text-amber-400", glowClass: "shadow-[0_0_15px_rgba(251,191,36,0.4)]" },
  { id: "instagram", name: "Instagram", component: InstagramIcon, colorClass: "text-pink-500", glowClass: "shadow-[0_0_15px_rgba(236,72,153,0.4)]" },
  { id: "whatsapp", name: "WhatsApp", component: WhatsAppIcon, colorClass: "text-[#25D366]", glowClass: "shadow-[0_0_15px_rgba(37,211,102,0.4)]" },
  { id: "spotify", name: "Spotify", component: SpotifyIcon, colorClass: "text-[#1DB954]", glowClass: "shadow-[0_0_15px_rgba(29,185,84,0.4)]" },
  { id: "youtube", name: "YouTube", component: YouTubeIcon, colorClass: "text-red-600", glowClass: "shadow-[0_0_15px_rgba(220,38,38,0.4)]" },
  { id: "headphones", name: "Music / Audio", component: HeadphonesIcon, colorClass: "text-orange-400", glowClass: "shadow-[0_0_15px_rgba(251,146,60,0.4)]" },
  { id: "camera", name: "Gallery / Photos", component: CameraIcon, colorClass: "text-cyan-400", glowClass: "shadow-[0_0_15px_rgba(34,211,238,0.4)]" },
  { id: "crew", name: "Crew / Volunteer", component: CrewIcon, colorClass: "text-purple-400", glowClass: "shadow-[0_0_15px_rgba(192,132,252,0.4)]" },
  { id: "sponsor", name: "Brand / Sponsor", component: BriefcaseIcon, colorClass: "text-amber-300", glowClass: "shadow-[0_0_15px_rgba(252,211,77,0.4)]" },
  { id: "phone", name: "Direct Call", component: PhoneIcon, colorClass: "text-emerald-400", glowClass: "shadow-[0_0_15px_rgba(52,211,153,0.4)]" },
  { id: "mail", name: "Desk / Email", component: MailIcon, colorClass: "text-blue-400", glowClass: "shadow-[0_0_15px_rgba(96,165,250,0.4)]" },
  { id: "location", name: "Venue / Map", component: MapPinIcon, colorClass: "text-rose-400", glowClass: "shadow-[0_0_15px_rgba(251,113,133,0.4)]" },
  { id: "lightning", name: "Exclusive / Flash", component: LightningIcon, colorClass: "text-yellow-400", glowClass: "shadow-[0_0_15px_rgba(250,204,21,0.4)]" },
  { id: "fire", name: "Trending / Hot", component: FireIcon, colorClass: "text-red-500", glowClass: "shadow-[0_0_15px_rgba(239,68,68,0.4)]" },
  { id: "star", name: "Featured / Highlight", component: StarBadgeIcon, colorClass: "text-amber-400", glowClass: "shadow-[0_0_15px_rgba(251,191,36,0.4)]" },
  { id: "link", name: "Web / Portal", component: LinkGlobeIcon, colorClass: "text-slate-200", glowClass: "shadow-[0_0_15px_rgba(255,255,255,0.3)]" },
];

/**
 * Intelligently resolves any icon string (emoji, keyword, or URL/title match) to a real, ultra-sharp SVG icon.
 */
export function RealLinkIcon({
  icon,
  title = "",
  url = "",
  className = "w-5 h-5",
}: {
  icon?: string;
  title?: string;
  url?: string;
  className?: string;
}) {
  const iconStr = (icon || "").toLowerCase().trim();
  const titleLower = title.toLowerCase();
  const urlLower = url.toLowerCase();

  // 1. Direct key matches
  if (iconStr === "ticket" || iconStr === "🎟️" || iconStr === "tickets") {
    return <TicketIcon className={`${className} text-red-500`} />;
  }
  if (iconStr === "crown" || iconStr === "👑" || iconStr === "vip") {
    return <CrownIcon className={`${className} text-amber-400`} />;
  }
  if (iconStr === "instagram" || iconStr === "📷" || iconStr === "ig") {
    return <InstagramIcon className={`${className} text-pink-500`} />;
  }
  if (iconStr === "whatsapp" || iconStr === "💬" || iconStr === "wa") {
    return <WhatsAppIcon className={`${className} text-[#25D366]`} />;
  }
  if (iconStr === "spotify" || iconStr === "🎧" || iconStr === "music") {
    return <SpotifyIcon className={`${className} text-[#1DB954]`} />;
  }
  if (iconStr === "youtube" || iconStr === "▶️" || iconStr === "yt") {
    return <YouTubeIcon className={`${className} text-red-600`} />;
  }
  if (iconStr === "camera" || iconStr === "gallery" || iconStr === "🏛️" || iconStr === "photos") {
    return <CameraIcon className={`${className} text-cyan-400`} />;
  }
  if (iconStr === "crew" || iconStr === "volunteer" || iconStr === "🛡️" || iconStr === "team") {
    return <CrewIcon className={`${className} text-purple-400`} />;
  }
  if (iconStr === "sponsor" || iconStr === "deck" || iconStr === "💎" || iconStr === "briefcase") {
    return <BriefcaseIcon className={`${className} text-amber-300`} />;
  }
  if (iconStr === "phone" || iconStr === "📞" || iconStr === "call") {
    return <PhoneIcon className={`${className} text-emerald-400`} />;
  }
  if (iconStr === "mail" || iconStr === "email" || iconStr === "✉️" || iconStr === "contact") {
    return <MailIcon className={`${className} text-blue-400`} />;
  }
  if (iconStr === "location" || iconStr === "pin" || iconStr === "📍" || iconStr === "venue") {
    return <MapPinIcon className={`${className} text-rose-400`} />;
  }
  if (iconStr === "lightning" || iconStr === "⚡" || iconStr === "flash") {
    return <LightningIcon className={`${className} text-yellow-400`} />;
  }
  if (iconStr === "fire" || iconStr === "🔥" || iconStr === "hot") {
    return <FireIcon className={`${className} text-red-500`} />;
  }
  if (iconStr === "star" || iconStr === "⭐" || iconStr === "🌟") {
    return <StarBadgeIcon className={`${className} text-amber-400`} />;
  }

  // 2. Intelligent URL detection
  if (urlLower.includes("instagram.com")) return <InstagramIcon className={`${className} text-pink-500`} />;
  if (urlLower.includes("whatsapp.com") || urlLower.includes("chat.whatsapp")) return <WhatsAppIcon className={`${className} text-[#25D366]`} />;
  if (urlLower.includes("spotify.com")) return <SpotifyIcon className={`${className} text-[#1DB954]`} />;
  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) return <YouTubeIcon className={`${className} text-red-600`} />;
  if (urlLower.includes("/tickets") || urlLower.includes("ticket")) return <TicketIcon className={`${className} text-red-500`} />;
  if (urlLower.includes("/gallery")) return <CameraIcon className={`${className} text-cyan-400`} />;
  if (urlLower.includes("/sponsors")) return <BriefcaseIcon className={`${className} text-amber-300`} />;
  if (urlLower.includes("/volunteers")) return <CrewIcon className={`${className} text-purple-400`} />;
  if (urlLower.includes("/contact")) return <MailIcon className={`${className} text-blue-400`} />;

  // 3. Intelligent Title detection
  if (titleLower.includes("ticket") || titleLower.includes("pass") || titleLower.includes("book")) {
    return <TicketIcon className={`${className} text-red-500`} />;
  }
  if (titleLower.includes("vip") || titleLower.includes("curse") || titleLower.includes("deck")) {
    return <CrownIcon className={`${className} text-amber-400`} />;
  }
  if (titleLower.includes("instagram")) return <InstagramIcon className={`${className} text-pink-500`} />;
  if (titleLower.includes("whatsapp")) return <WhatsAppIcon className={`${className} text-[#25D366]`} />;
  if (titleLower.includes("spotify") || titleLower.includes("playlist") || titleLower.includes("audio")) {
    return <SpotifyIcon className={`${className} text-[#1DB954]`} />;
  }
  if (titleLower.includes("youtube") || titleLower.includes("recap") || titleLower.includes("trailer")) {
    return <YouTubeIcon className={`${className} text-red-600`} />;
  }
  if (titleLower.includes("gallery") || titleLower.includes("photos") || titleLower.includes("production")) {
    return <CameraIcon className={`${className} text-cyan-400`} />;
  }
  if (titleLower.includes("crew") || titleLower.includes("volunteer")) {
    return <CrewIcon className={`${className} text-purple-400`} />;
  }
  if (titleLower.includes("sponsor") || titleLower.includes("brand")) {
    return <BriefcaseIcon className={`${className} text-amber-300`} />;
  }
  if (titleLower.includes("contact") || titleLower.includes("desk")) {
    return <MailIcon className={`${className} text-blue-400`} />;
  }

  // 4. Default Globe Link
  return <LinkGlobeIcon className={`${className} text-white/90`} />;
}

export function InstagramVerifiedBadge({ className = "w-4 h-4", size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Verified"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.001 2.002c-.822 0-1.597.354-2.14.974l-.994 1.135c-.382.436-.931.688-1.511.693l-1.507.013c-1.026.009-1.928.673-2.227 1.638l-.442 1.423c-.17.548-.56 1.002-1.074 1.25l-1.332.646c-.927.45-1.464 1.431-1.328 2.45l.198 1.494c.077.58-.094 1.163-.472 1.606l-.98 1.147c-.667.781-.667 1.939 0 2.72l.98 1.147c.378.443.549 1.026.472 1.606l-.198 1.494c-.136 1.019.401 2 1.328 2.45l1.332.646c.514.248.904.702 1.074 1.25l.442 1.423c.299.965 1.201 1.629 2.227 1.638l1.507.013c.58.005 1.129.257 1.511.693l.994 1.135c.543.62 1.318.974 2.14.974s1.597-.354 2.14-.974l.994-1.135c.382-.436.931-.688 1.511-.693l1.507-.013c1.026-.009 1.928-.673 2.227-1.638l.442-1.423c.17-.548.56-1.002 1.074-1.25l1.332-.646c.927-.45 1.464-1.431 1.328-2.45l-.198-1.494c-.077-.58.094-1.163.472-1.606l.98-1.147c.667-.781.667-1.939 0-2.72l-.98-1.147c-.378-.443-.549-1.026-.472-1.606l.198-1.494c.136-1.019-.401-2-1.328-2.45l-1.332-.646c-.514-.248-.904-.702-1.074-1.25l-.442-1.423c-.299-.965-1.201-1.629-2.227-1.638l-1.507-.013c-.58-.005-1.129-.257-1.511-.693l-.994-1.135c-.543-.62-1.318-.974-2.14-.974zm-1.8 14.5-3.5-3.5 1.414-1.414 2.086 2.086 5.586-5.586 1.414 1.414-7 7z"
        fill="#0095F6"
      />
      <path
        d="M10.201 16.502l-3.5-3.5 1.414-1.414 2.086 2.086 5.586-5.586 1.414 1.414-7 7z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
