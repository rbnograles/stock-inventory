/**
 * Compact expiry indicator shared by inventory rows. A small color-coded dot
 * plus a one-word label keeps the row scannable on narrow mobile widths.
 */
import type { ExpiryStatus } from "@/types/inventory";

interface StatusPillProps {
  status: ExpiryStatus;
}

const statusConfig: Record<ExpiryStatus, { label: string; bg: string; text: string; dot: string }> = {
  expired: {
    label: "Expired",
    bg: "bg-rose-100 dark:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-200",
    dot: "bg-rose-500",
  },
  soon: {
    label: "Soon",
    bg: "bg-amber-100 dark:bg-amber-500/15",
    text: "text-amber-800 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  healthy: {
    label: "Fresh",
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  unknown: {
    label: "No date",
    bg: "bg-slate-200 dark:bg-slate-700/40",
    text: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

export const StatusPill = ({ status }: StatusPillProps) => {
  const { label, bg, text, dot } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${bg} ${text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
};
