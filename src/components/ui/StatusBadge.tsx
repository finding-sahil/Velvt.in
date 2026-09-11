// UNTOLDSURI Style Status Badge Component
import { getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const sizeClass =
    size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-[0.16em] border rounded-full backdrop-blur-md ${colorClass} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-90" />
      <span>{label || status}</span>
    </span>
  );
}
