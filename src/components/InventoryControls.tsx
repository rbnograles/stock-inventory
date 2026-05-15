/**
 * Search field plus a single horizontal strip of category filter chips. The
 * primary Add/Scan actions live in the persistent bottom action bar, so this
 * surface stays focused on what the user is filtering toward.
 */
import { type ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import type { InventoryCategory } from "@/types/inventory";

export type CategoryFilter = "All" | InventoryCategory;

interface InventoryControlsProps {
  category: CategoryFilter;
  filters: CategoryFilter[];
  search: string;
  onCategoryChange: (category: CategoryFilter) => void;
  onSearchChange: (search: string) => void;
}

const categoryEmoji: Record<CategoryFilter, string> = {
  All: "✨",
  Pantry: "🥫",
  Refrigerated: "🥬",
  Frozen: "🧊",
  Medicine: "💊",
  Cleaning: "🧼",
  "Personal Care": "🧴",
  Other: "📦",
};

export const InventoryControls = ({
  category,
  filters,
  search,
  onCategoryChange,
  onSearchChange,
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
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-card focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        value={search}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
      />
      {search ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
      {filters.map((filter) => {
        const active = category === filter;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={active}
            className={`flex h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition ${
              active
                ? "bg-teal-500 text-white shadow-soft"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
            onClick={() => onCategoryChange(filter)}
          >
            <span aria-hidden="true">{categoryEmoji[filter]}</span>
            {filter}
          </button>
        );
      })}
    </div>
  </section>
);
