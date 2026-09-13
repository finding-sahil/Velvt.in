"use client";

import { useState } from "react";

interface AddToCalendarProps {
  title: string;
  description: string;
  location: string;
  startDate: string | Date;
  endDate?: string | Date;
  className?: string;
}

export function AddToCalendar({
  title,
  description,
  location,
  startDate,
  endDate,
  className = "",
}: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs font-mono text-white transition-all cursor-pointer"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-red">
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
          strokeWidth="2"
          className={`w-3 h-3 text-g5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#09090b] border border-white/10 shadow-2xl p-1.5 z-50 animate-fade-in-up space-y-1">
            <a
              href={googleUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-g5 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <span className="text-red">●</span> Google Calendar
            </a>
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-g5 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <span className="text-emerald-400">●</span> Apple Calendar (.ics)
            </button>
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-g5 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <span className="text-purple-400">●</span> Outlook / iCal
            </button>
          </div>
        </>
      )}
    </div>
  );
}
