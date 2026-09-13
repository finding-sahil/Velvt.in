"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePortfolioSection } from "@/app/actions";
import Link from "next/link";

interface PortfolioQuickControlsProps {
  memberId: string;
  memberName: string;
  initialVisibility: Record<string, boolean>;
}

const SECTIONS = [
  { key: "showBio", label: "Bio" },
  { key: "showQuote", label: "Vision Quote" },
  { key: "showRoles", label: "Roles" },
  { key: "showAchievements", label: "Milestones" },
  { key: "showSkills", label: "Specialties & Disciplines" },
  { key: "showTimeline", label: "Timeline" },
  { key: "showSocials", label: "Social Bar" },
  { key: "showActions", label: "Action CTAs" },
  { key: "showOtherMembers", label: "Other Members" },
];

export function PortfolioQuickControls({
  memberId,
  memberName,
  initialVisibility,
}: PortfolioQuickControlsProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState<Record<string, boolean>>(initialVisibility);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function handleToggle(key: string, label: string) {
    const currentVal = visibility[key] !== false;
    const newVal = !currentVal;

    // Optimistic update
    setVisibility((prev) => ({
      ...prev,
      [key]: newVal,
      ...(key === "showTimeline" ? { timeline: newVal } : {}),
    }));
    setLoadingKey(key);

    try {
      const res = await togglePortfolioSection(memberId, key, newVal);
      if (res.success) {
        setToastMessage(`"${label}" turned ${newVal ? "ON" : "OFF"}`);
        setTimeout(() => setToastMessage(null), 3000);
        router.refresh();
      } else {
        // Rollback
        setVisibility((prev) => ({
          ...prev,
          [key]: currentVal,
          ...(key === "showTimeline" ? { timeline: currentVal } : {}),
        }));
        setToastMessage(res.error || "Failed to toggle section");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: any) {
      // Rollback
      setVisibility((prev) => ({
        ...prev,
        [key]: currentVal,
        ...(key === "showTimeline" ? { timeline: currentVal } : {}),
      }));
      setToastMessage("Error: " + err.message);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-1.5rem)] w-max">
      {/* Toast bubble */}
      {toastMessage && (
        <div className="mb-2 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-black/90 border border-red/60 text-[11px] font-mono text-white shadow-[0_0_20px_rgba(200,16,46,0.4)] animate-fade-in">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Main Bar */}
      <div className="rounded-2xl sm:rounded-full bg-black/90 backdrop-blur-xl border border-red/40 p-2 sm:px-4 sm:py-2 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-wrap items-center gap-2 text-xs font-mono">
        {/* Header Indicator */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-red tracking-wider">
            Admin Section Controls
          </span>
        </div>

        {/* Collapsed view summary */}
        {!isExpanded ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {SECTIONS.slice(0, 4).map((sec) => {
              const isVisible = visibility[sec.key] !== false;
              const isLoading = loadingKey === sec.key;
              return (
                <button
                  key={sec.key}
                  onClick={() => handleToggle(sec.key, sec.label)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1 ${
                    isVisible
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                      : "bg-white/5 text-g5 border-white/10 line-through opacity-60 hover:opacity-100 hover:text-white"
                  }`}
                  title={`Click to turn ${isVisible ? "OFF" : "ON"} ${sec.label}`}
                >
                  <span>{isVisible ? "✓" : "✕"}</span>
                  <span>{sec.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsExpanded(true)}
              className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[10px] text-white transition-all cursor-pointer"
            >
              +{SECTIONS.length - 4} More Sections...
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap max-w-2xl py-1">
            {SECTIONS.map((sec) => {
              const isVisible = visibility[sec.key] !== false;
              const isLoading = loadingKey === sec.key;
              return (
                <button
                  key={sec.key}
                  onClick={() => handleToggle(sec.key, sec.label)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isVisible
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                      : "bg-red/10 text-red/80 border-red/30 line-through hover:opacity-100 hover:text-red"
                  }`}
                  title={`Click to turn ${isVisible ? "OFF" : "ON"} ${sec.label}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? "bg-emerald-400" : "bg-red"}`} />
                  <span>{sec.label}</span>
                  <span className="text-[9px] opacity-70">({isVisible ? "ON" : "OFF"})</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsExpanded(false)}
              className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[10px] text-g5 hover:text-white transition-all cursor-pointer"
            >
              Collapse ▴
            </button>
          </div>
        )}

        {/* CMS Edit Direct Link */}
        <div className="pl-2 border-l border-white/10 shrink-0 flex items-center gap-1.5">
          <Link
            href="/velvt-management/portfolio"
            className="px-2.5 py-1 rounded-full bg-red/15 hover:bg-red text-red hover:text-white border border-red/40 hover:border-red text-[10px] font-mono uppercase tracking-wider transition-all"
          >
            Open CMS ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
