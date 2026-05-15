/**
 * Renders one category as a labeled card containing the matching inventory
 * rows. Sections are skipped when empty so the dashboard stays compact.
 */
import { InventoryRow } from "@/components/InventoryRow";
import { sortByExpiryPriority } from "@/lib/expiry";
import type { InventoryCategory, InventoryItem } from "@/types/inventory";

interface CategorySectionProps {
  category: InventoryCategory;
  items: InventoryItem[];
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustQuantity: (item: InventoryItem, delta: number) => void;
}

const categoryEmoji: Record<InventoryCategory, string> = {
  Pantry: "🥫",
  Refrigerated: "🥬",
  Frozen: "🧊",
  Medicine: "💊",
  Cleaning: "🧼",
  "Personal Care": "🧴",
  Other: "📦",
};

export const CategorySection = ({
  category,
  items,
  onView,
  onEdit,
  onDelete,
  onAdjustQuantity,
}: CategorySectionProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2" aria-labelledby={`${category}-heading`}>
      <div className="flex items-center justify-between px-1">
        <h2
          id={`${category}-heading`}
          className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"
        >
          <span aria-hidden="true">{categoryEmoji[category]}</span>
          {category}
        </h2>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {sortByExpiryPriority(items).map((item) => (
          <InventoryRow
            key={item.id}
            item={item}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdjustQuantity={onAdjustQuantity}
          />
        ))}
      </div>
    </section>
  );
};
