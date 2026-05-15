/**
 * Search field plus a single horizontal strip of category filter chips and
 * inventory utilities. Chips are driven by the user's categories so adding new
 * ones in the manager shows up here automatically; scan/category actions keep
 * stock management available after the bottom bar switches between workspaces.
 */
import { type ChangeEvent } from "react";
import { ScanLine, Search, Settings2, X } from "lucide-react";
import type { Category } from "@/types/category";

export type CategoryFilter = string;

interface InventoryControlsProps {
  category: CategoryFilter;
  categories: Category[];
  search: string;
  onCategoryChange: (category: CategoryFilter) => void;
  onSearchChange: (search: string) => void;
  onManageCategories?: () => void;
  onScan?: () => void;
}

export const InventoryControls = ({
  category,
  categories,
  search,
  onCategoryChange,
  onSearchChange,
  onManageCategories,
  onScan,
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
        <button
          type="button"
          onClick={onManageCategories}
          className="flex h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200"
        >
          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          Manage
        </button>
      ) : null}
      {onScan ? (
        <button
          type="button"
          onClick={onScan}
          className="flex h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-3.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200 dark:hover:bg-teal-500/20"
        >
          <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
          Scan
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
    className={`flex h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition ${
      active
        ? "bg-teal-500 text-white shadow-soft"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    }`}
  >
    <span aria-hidden="true">{emoji}</span>
    {label}
  </button>
);
