/**
 * Search field plus a single horizontal strip of category filter chips and
 * inventory utilities. Chips are driven by the user's categories so adding new
 * ones in the manager shows up here automatically; category management stays
 * available after the bottom bar switches between workspaces.
 */
import { type ChangeEvent } from "react";
import { Search, Settings2, X } from "lucide-react";
import type { Category } from "@/types/category";

export type CategoryFilter = string;

interface InventoryControlsProps {
  category: CategoryFilter;
  categories: Category[];
  search: string;
  onCategoryChange: (category: CategoryFilter) => void;
  onSearchChange: (search: string) => void;
  onManageCategories?: () => void;
}

export const InventoryControls = ({
  category,
  categories,
  search,
  onCategoryChange,
  onSearchChange,
  onManageCategories,
}: InventoryControlsProps) => (
  <section className="space-y-3" aria-label="Filter inventory">
    <label className="relative block">
      <span className="sr-only">Search products</span>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      />
      <input
        type="search"
        inputMode="search"
        placeholder="Search products, barcode, location"
        className="hs-input h-12 pl-11 pr-11 shadow-card"
        value={search}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
      />
      {search ? (
        <button
          type="button"
          aria-label="Clear search"
          className="hs-btn-icon absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => onSearchChange("")}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </label>

    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide"
      role="tablist"
      aria-label="Categories"
    >
      <FilterChip
        active={category === "All"}
        onClick={() => onCategoryChange("All")}
        emoji="✨"
        label="All"
      />
      {categories.map((entry) => (
        <FilterChip
          key={entry.id}
          active={category === entry.name}
          onClick={() => onCategoryChange(entry.name)}
          emoji={entry.emoji}
          label={entry.name}
        />
      ))}
      {onManageCategories ? (
        <button type="button" onClick={onManageCategories} className="hs-pill-ghost">
          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          Manage
        </button>
      ) : null}
    </div>
  </section>
);

const FilterChip = ({
  active,
  emoji,
  label,
  onClick,
}: {
  active: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={active ? "hs-pill-active" : "hs-pill"}
  >
    <span aria-hidden="true">{emoji}</span>
    {label}
  </button>
);
