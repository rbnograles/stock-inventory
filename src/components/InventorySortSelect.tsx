/**
 * Compact inventory sort picker for the dashboard toolbar. It keeps sorting
 * close to the item count and view toggle, giving Ryan quick control over the
 * current list order without adding a bulky filter panel.
 */
import { ArrowUpDown, ChevronDown } from "lucide-react";
import type { InventorySortMode } from "@/components/CategorySection";

interface InventorySortSelectProps {
  mode: InventorySortMode;
  onChange: (mode: InventorySortMode) => void;
}

const SORT_LABELS: Record<InventorySortMode, string> = {
  expiry: "Expiry",
  location: "Location",
  quantity: "Qty",
};

export const InventorySortSelect = ({ mode, onChange }: InventorySortSelectProps) => (
  <label className="relative inline-flex h-9 items-center rounded-full bg-white pl-3 pr-8 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
    <span className="sr-only">Sort inventory</span>
    <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
    <select
      value={mode}
      aria-label="Sort inventory"
      onChange={(event) => onChange(event.target.value as InventorySortMode)}
      className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full bg-transparent opacity-0"
    >
      <option value="expiry">Expiration</option>
      <option value="location">Location</option>
      <option value="quantity">Quantity</option>
    </select>
    <span aria-hidden="true">{SORT_LABELS[mode]}</span>
    <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
  </label>
);
