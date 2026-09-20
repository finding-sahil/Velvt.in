"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme, THEMES, type ThemeId } from "./ThemeProvider";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Switch theme"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-200 min-h-[36px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-g5 hover:text-white"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span className="hidden lg:inline">{theme === "velvt2" ? "VELVT 2.O" : "Legacy"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-black/95 backdrop-blur-2xl shadow-2xl z-[100] overflow-hidden animate-fade-in-up">
          <div className="p-3 border-b border-white/[0.06]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-g5">Theme</p>
          </div>
          <div className="p-2 space-y-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id as ThemeId);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  theme === t.id
                    ? "bg-white/[0.08] border border-white/[0.12]"
                    : "hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold tracking-wide ${
                    theme === t.id ? "text-white" : "text-g6 group-hover:text-white"
                  }`}>
                    {t.label}
                  </span>
                  {theme === t.id && (
                    <span className="w-2 h-2 rounded-full bg-red" />
                  )}
                </div>
                <p className="text-[10px] text-g5 mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact theme toggle for mobile drawer */
export function ThemeSelectorCompact() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "velvt2" ? "legacy" : "velvt2")}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs transition-all hover:bg-white/[0.08]"
    >
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-g5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span className="font-mono uppercase tracking-wider text-white">
          {theme === "velvt2" ? "VELVT 2.O" : "Legacy"}
        </span>
      </div>
      <span className="text-[10px] font-mono text-g5 uppercase tracking-wider">
        Switch →
      </span>
    </button>
  );
}
