"use client";

import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  activeLabel,
  inactiveLabel,
  className = "",
  id,
  ariaLabel,
}: ToggleSwitchProps) {
  const sizeConfig = {
    sm: {
      track: "h-5 w-9 border",
      thumb: "h-3.5 w-3.5",
      translate: "translate-x-4",
      untranslate: "translate-x-0.5",
      text: "text-[10px]",
    },
    md: {
      track: "h-7 w-14 border-2",
      thumb: "h-5 w-5",
      translate: "translate-x-7",
      untranslate: "translate-x-0.5",
      text: "text-xs",
    },
    lg: {
      track: "h-8 w-16 border-2",
      thumb: "h-6 w-6",
      translate: "translate-x-8",
      untranslate: "translate-x-1",
      text: "text-sm",
    },
  }[size];

  const statusText = checked ? (activeLabel || "ON") : (inactiveLabel || "OFF");

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {label && (
        <span className={`${sizeConfig.text} font-mono font-medium text-white/90 select-none`}>
          {label}
        </span>
      )}
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label || "Toggle switch"}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }}
        className={`relative inline-flex ${sizeConfig.track} shrink-0 cursor-pointer rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          checked
            ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.45)]"
            : "bg-black/90 border-white/20 hover:border-white/40"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block ${sizeConfig.thumb} transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out my-auto ${
            checked ? sizeConfig.translate : sizeConfig.untranslate
          }`}
        />
      </button>
      {(activeLabel || inactiveLabel) && (
        <span
          className={`font-mono text-[10px] uppercase font-bold tracking-wider select-none ${
            checked ? "text-emerald-400" : "text-g5"
          }`}
        >
          {statusText}
        </span>
      )}
    </div>
  );
}
