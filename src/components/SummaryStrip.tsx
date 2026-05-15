/**
 * Condenses the household stock picture into four thumb-readable counters.
 * The dashboard can show risk and total volume immediately before Ryan scrolls
 * into category details.
 */
import { Archive, CheckCircle2, Clock3, TriangleAlert } from "lucide-react";
import { getExpiryStatus } from "@/lib/expiry";
import type { InventoryItem } from "@/types/inventory";

interface SummaryStripProps {
  items: InventoryItem[];
  totalUnits: number;
}

export const SummaryStrip = ({ items, totalUnits }: SummaryStripProps) => {
  const expired = items.filter((item) => getExpiryStatus(item.expiryDate) === "expired").length;
  const soon = items.filter((item) => getExpiryStatus(item.expiryDate) === "soon").length;
  const healthy = items.filter((item) => getExpiryStatus(item.expiryDate) === "healthy").length;

  const summaries = [
    { label: "Items", value: items.length, Icon: Archive, className: "text-slate-900 dark:text-white" },
    { label: "Units", value: totalUnits, Icon: CheckCircle2, className: "text-teal-700 dark:text-teal-200" },
    { label: "Soon", value: soon, Icon: Clock3, className: "text-amber-700 dark:text-amber-200" },
    { label: "Expired", value: expired, Icon: TriangleAlert, className: "text-rose-700 dark:text-rose-200" },
  ];

  return (
    <section aria-label="Inventory summary" className="grid grid-cols-4 gap-2">
      {summaries.map(({ label, value, Icon, className }) => (
        <div
          key={label}
          className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <Icon className={`mx-auto mb-1 h-4 w-4 ${className}`} aria-hidden="true" />
          <p className={`text-lg font-bold leading-tight ${className}`}>{value}</p>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      ))}
      <span className="sr-only">{healthy} products are in good shape.</span>
    </section>
  );
};
