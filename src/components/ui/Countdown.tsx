"use client";

import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/utils";

interface CountdownProps {
  targetDate: Date | string;
  className?: string;
}

export function Countdown({ targetDate, className = "" }: CountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown(targetDate));

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (countdown.isPast) {
    return (
      <div className={`text-center ${className}`}>
        <p className="font-display font-bold uppercase tracking-widest text-base text-muted">
          This event has commenced
        </p>
      </div>
    );
  }

  const units = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hours" },
    { value: countdown.minutes, label: "Minutes" },
    { value: countdown.seconds, label: "Seconds" },
  ];

  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-2.5 md:gap-3.5 max-w-full overflow-hidden py-1 ${className}`}>
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1 sm:gap-2.5 md:gap-3.5 shrink-0">
          <div className="flex flex-col items-center bg-white/[0.05] border border-white/10 rounded-[10px] sm:rounded-[14px] px-2 py-1.5 sm:px-3.5 sm:py-2.5 backdrop-blur-[14px] shadow-[0_0_20px_rgba(0,0,0,0.4)] min-w-[48px] sm:min-w-[64px] md:min-w-[72px]">
            <span suppressHydrationWarning className="font-display font-black text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white tabular-nums tracking-tight leading-none">
              {mounted ? unit.value.toString().padStart(2, "0") : "--"}
            </span>
            <span className="text-[7px] sm:text-[9px] md:text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-red mt-1 leading-none">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="font-display font-black text-sm sm:text-xl md:text-2xl text-red drop-shadow-[0_0_8px_#c8102e] -mt-1 shrink-0">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
