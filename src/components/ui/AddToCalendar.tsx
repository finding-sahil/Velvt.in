"use client";

import { useState, useRef, useEffect } from "react";

interface AddToCalendarProps {
  title: string;
  description: string;
  location: string;
  startDate: string | Date;
  endDate?: string | Date;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "secondary" | "outline";
  dropdownPosition?: "top" | "bottom" | "auto";
}

export function AddToCalendar({
  title,
  description,
  location,
  startDate,
  endDate,
  className = "",
  size = "md",
  variant = "secondary",
  dropdownPosition = "auto",
}: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(dropdownPosition === "top");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Dynamically detect available space below
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (dropdownPosition === "top") {
        setOpenUp(true);
      } else if (dropdownPosition === "bottom") {
        setOpenUp(false);
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const parentCard = containerRef.current.closest(".glass-card, section, main, [class*='overflow-']");
        let parentSpaceBelow = 9999;
        if (parentCard) {
          const parentRect = parentCard.getBoundingClientRect();
          parentSpaceBelow = parentRect.bottom - rect.bottom;
        }
        // If less than 240px below in viewport or inside parent card, open upwards
        setOpenUp(spaceBelow < 240 || parentSpaceBelow < 240);
      }
    }
  }, [isOpen, dropdownPosition]);

  // Format dates for calendar URLs and ICS (YYYYMMDDTHHmmssZ)
  const formatIsoUtc = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const start = new Date(startDate);
  // Default to 4 hours if no end date
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const startFormatted = formatIsoUtc(start);
  const endFormatted = formatIsoUtc(end);

  // Google Calendar URL
  const googleUrl = new URL("https://calendar.google.com/calendar/render");
  googleUrl.searchParams.set("action", "TEMPLATE");
  googleUrl.searchParams.set("text", title);
  googleUrl.searchParams.set("dates", `${startFormatted}/${endFormatted}`);
  googleUrl.searchParams.set("details", description);
  googleUrl.searchParams.set("location", location);

  // Download .ics file
  const handleDownloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VELVT.in//Event Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${title.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n").replace(/,/g, "\\,")}`,
      `LOCATION:${location.replace(/,/g, "\\,")}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `DTSTAMP:${formatIsoUtc(new Date())}`,
      `UID:${Date.now()}@velvt.in`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const sizeStyles = {
    sm: "px-4 py-1.5 text-[0.72rem] tracking-[0.14em]",
    md: "px-6 py-2.5 text-[0.78rem] tracking-[0.16em]",
    lg: "px-7 py-3 text-[0.82rem] tracking-[0.18em]",
  }[size];

  const variantStyles = variant === "outline"
    ? "bg-transparent hover:bg-red/10 text-white border-red/40 hover:border-red shadow-[0_0_12px_rgba(200,16,46,0.15)]"
    : "bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/[0.12] hover:border-red/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]";

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${isOpen ? "z-[60]" : "z-10"} ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center gap-2 font-display uppercase rounded-full border transition-all duration-200 ease-smooth cursor-pointer active:scale-[0.98] font-bold ${variantStyles} ${sizeStyles}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Add ${title} to calendar`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-3.5 h-3.5 text-red shrink-0"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>Add to Calendar</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`w-3 h-3 text-red/80 transition-transform duration-300 ${isOpen ? "rotate-180 text-red" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="Calendar options"
          className={`absolute left-0 ${
            openUp
              ? "bottom-full mb-3 origin-bottom shadow-[0_-16px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(200,16,46,0.2)]"
              : "top-full mt-2.5 origin-top shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(200,16,46,0.2)]"
          } w-60 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0a0a0d]/98 backdrop-blur-2xl border border-white/20 p-2 z-[70] transition-all space-y-1.5`}
        >
          <div className="px-3 py-1.5 border-b border-white/[0.08] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
              Select Calendar Service
            </span>
          </div>

          <a
            role="menuitem"
            href={googleUrl.toString()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono text-white/90 hover:text-white hover:bg-white/[0.08] hover:border-white/20 border border-transparent transition-all group min-h-[40px]"
          >
            <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_#c8102e] group-hover:scale-125 transition-transform" />
            <span className="font-medium">Google Calendar</span>
            <span className="ml-auto text-[10px] font-mono text-white/30 group-hover:text-red transition-colors">↗</span>
          </a>

          <button
            type="button"
            role="menuitem"
            onClick={handleDownloadIcs}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono text-white/90 hover:text-white hover:bg-white/[0.08] hover:border-white/20 border border-transparent transition-all cursor-pointer group min-h-[40px]"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)] group-hover:scale-125 transition-transform" />
            <span className="font-medium">Apple Calendar (.ics)</span>
            <span className="ml-auto text-[10px] font-mono text-white/30 group-hover:text-sky-400 transition-colors">↓</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleDownloadIcs}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono text-white/90 hover:text-white hover:bg-white/[0.08] hover:border-white/20 border border-transparent transition-all cursor-pointer group min-h-[40px]"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)] group-hover:scale-125 transition-transform" />
            <span className="font-medium">Outlook / iCal</span>
            <span className="ml-auto text-[10px] font-mono text-white/30 group-hover:text-purple-400 transition-colors">↓</span>
          </button>
        </div>
      )}
    </div>
  );
}
