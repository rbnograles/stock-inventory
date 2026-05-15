/**
 * Renders one category with either a row list or a 2-column card grid. The
 * label emoji is resolved from the user's category list with a fallback for
 * legacy items. The section applies the selected dashboard sort locally, then
 * passes quantity saves through so each item can persist independently.
 */
import { InventoryCard } from "@/components/InventoryCard";
import { InventoryRow } from "@/components/InventoryRow";
import { getDaysUntilExpiry, sortByExpiryPriority } from "@/lib/expiry";
import type { Category } from "@/types/category";
import type { InventoryItem } from "@/types/inventory";

export type InventoryViewMode = "list" | "cards";
export type InventorySortMode = "expiry" | "location" | "quantity";

interface CategorySectionProps {
  category: string;
  emoji: string;
  items: InventoryItem[];
  categories: Category[];
  viewMode: InventoryViewMode;
  sortMode: InventorySortMode;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onSaveQuantity: (item: InventoryItem, quantity: number) => Promise<void>;
}

export const CategorySection = ({
  category,
  emoji,
  items,
  categories,
  viewMode,
  sortMode,
  onView,
  onEdit,
  onDelete,
  onSaveQuantity,
}: CategorySectionProps) => {
  if (items.length === 0) {
    return null;
  }

  const sorted = sortInventoryItems(items, sortMode);

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
              onSaveQuantity={onSaveQuantity}
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
              onSaveQuantity={onSaveQuantity}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const sortInventoryItems = (items: InventoryItem[], mode: InventorySortMode) => {
  if (mode === "expiry") {
    return sortByExpiryPriority(items);
  }

  return [...items].sort((a, b) => {
    if (mode === "location") {
      const aLocation = a.location?.trim();
      const bLocation = b.location?.trim();

      if (!aLocation && bLocation) {
        return 1;
      }

      if (aLocation && !bLocation) {
        return -1;
      }

      const locationCompare = (aLocation ?? "").localeCompare(bLocation ?? "");
      return locationCompare || compareExpiry(a, b);
    }

    return b.quantity - a.quantity || compareExpiry(a, b);
  });
};

const compareExpiry = (a: InventoryItem, b: InventoryItem) => {
  const aDays = getDaysUntilExpiry(a.expiryDate) ?? Number.POSITIVE_INFINITY;
  const bDays = getDaysUntilExpiry(b.expiryDate) ?? Number.POSITIVE_INFINITY;

  return aDays - bDays || a.name.localeCompare(b.name);
};
