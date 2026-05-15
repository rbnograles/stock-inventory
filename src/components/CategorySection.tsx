/**
 * Displays one category as a compact inventory list. Each row surfaces quantity,
 * expiry, barcode, location, and actions so the dashboard works as the main
 * operating surface rather than a passive report.
 */
import { Barcode, MapPin, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/lib/material";
import { getExpiryLabel, getExpiryStatus, sortByExpiryPriority } from "@/lib/expiry";
import { StatusPill } from "@/components/StatusPill";
import type { InventoryCategory, InventoryItem } from "@/types/inventory";

interface CategorySectionProps {
  category: InventoryCategory;
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export const CategorySection = ({ category, items, onEdit, onDelete }: CategorySectionProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" aria-labelledby={`${category}-heading`}>
      <div className="flex items-end justify-between">
        <div>
          <h2 id={`${category}-heading`} className="text-base font-bold text-slate-950 dark:text-white">
            {category}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {items.length} product{items.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {sortByExpiryPriority(items).map((item) => (
          <article key={item.id} className="grid grid-cols-[64px_1fr_auto] gap-3 p-3">
            {item.photoDataUrl ? (
              <img className="h-16 w-16 rounded-lg object-cover" src={item.photoDataUrl} alt={item.name} />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-100">
                {item.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">{item.name}</h3>
                <StatusPill status={getExpiryStatus(item.expiryDate)} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {item.quantity} {item.unit}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{getExpiryLabel(item)}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {item.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {item.location}
                  </span>
                ) : null}
                {item.barcode ? (
                  <span className="inline-flex items-center gap-1">
                    <Barcode className="h-3 w-3" aria-hidden="true" />
                    {item.barcode}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <IconButton variant="text" color="blue-gray" aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </IconButton>
              <IconButton variant="text" color="red" aria-label={`Delete ${item.name}`} onClick={() => onDelete(item)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
