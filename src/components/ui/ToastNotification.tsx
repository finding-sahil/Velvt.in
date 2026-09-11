"use client";

import { useEffect } from "react";

export interface ToastMessage {
  id?: string;
  message: string;
  type?: "success" | "error" | "info";
  actionLabel?: string;
  onAction?: () => void;
}

export type ToastState = ToastMessage;

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-auto pointer-events-auto animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-neutral-900/95 border border-red/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-white text-xs font-mono">
        {toast.type === "error" ? (
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] shrink-0" />
        )}

        <span className="text-white font-medium whitespace-nowrap">
          {toast.message}
        </span>

        {toast.actionLabel && toast.onAction && (
          <button
            onClick={() => {
              toast.onAction?.();
              onClose();
            }}
            className="ml-2 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-gold text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            {toast.actionLabel}
          </button>
        )}

        <button
          onClick={onClose}
          className="ml-1 text-white/50 hover:text-white p-0.5 rounded transition-colors cursor-pointer text-sm leading-none"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
