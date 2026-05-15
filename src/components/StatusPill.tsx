/**
 * Renders a compact expiry state badge shared by dashboard rows and summaries.
 * One visual mapping keeps expired, soon, healthy, and unknown products easy to
 * scan without repeating class decisions across the app.
 */
import { AlertTriangle, CheckCircle2, Clock3, HelpCircle } from "lucide-react";
import type { ExpiryStatus } from "@/types/inventory";

interface StatusPillProps {
  status: ExpiryStatus;
}

const statusConfig = {
  expired: {
    label: "Expired",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100",
    Icon: AlertTriangle,
  },
  soon: {
    label: "Soon",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
    Icon: Clock3,
  },
  healthy: {
    label: "Good",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
    Icon: CheckCircle2,
  },
  unknown: {
    label: "No date",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    Icon: HelpCircle,
  },
};

export const StatusPill = ({ status }: StatusPillProps) => {
  const { label, className, Icon } = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
};
