/**
 * Renders one category with either a row list or a 2-column card grid. The
 * label emoji is resolved from the user's category list with a fallback for
 * legacy items whose category was removed.
 */
import { InventoryCard } from "@/components/InventoryCard";
import { InventoryRow } from "@/components/InventoryRow";
import { sortByExpiryPriority } from "@/lib/expiry";
import type { Category } from "@/types/category";
import type { InventoryItem } from "@/types/inventory";

export type InventoryViewMode = "list" | "cards";

interface CategorySectionProps {
  category: string;
  emoji: string;
  items: InventoryItem[];
  categories: Category[];
  viewMode: InventoryViewMode;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustQuantity: (item: InventoryItem, delta: number) => void;
}

export const CategorySection = ({
  category,
  emoji,
  items,
  categories,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onAdjustQuantity,
}: CategorySectionProps) => {
  if (items.length === 0) {
    return null;
  }

  const sorted = sortByExpiryPriority(items);

  return (
    <section className="space-y-2" aria-labelledby={`${category}-heading`}>
      <div className="flex items-center justify-between px-1">
        <h2 id={`${category}-heading`} className="hs-section-title">
          <span aria-hidden="true">{emoji}</span>
          {category}
        </h2>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              categories={categories}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdjustQuantity={onAdjustQuantity}
            />
          ))}
        </div>
      ) : (
        <div className="hs-surface hs-divider">
          {sorted.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              categories={categories}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdjustQuantity={onAdjustQuantity}
            />
          ))}
        </div>
      )}
    </section>
  );
};
