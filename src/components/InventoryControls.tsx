/**
 * Groups search, category filtering, and fast add/scan actions into one mobile
 * control surface. The filters are passed in so the dashboard owns inventory
 * state while this component owns only interaction chrome.
 */
import { type ChangeEvent } from "react";
import { Plus, Search, ScanLine } from "lucide-react";
import { Button, Input } from "@/lib/material";
import type { InventoryCategory } from "@/types/inventory";

export type CategoryFilter = "All" | InventoryCategory;

interface InventoryControlsProps {
  category: CategoryFilter;
  filters: CategoryFilter[];
  search: string;
  onAdd: () => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onScan: () => void;
  onSearchChange: (search: string) => void;
}

export const InventoryControls = ({
  category,
  filters,
  search,
  onAdd,
  onCategoryChange,
  onScan,
  onSearchChange,
}: InventoryControlsProps) => (
  <section className="space-y-3" aria-label="Inventory controls">
    <Input
      crossOrigin=""
      icon={<Search className="h-4 w-4" />}
      label="Search products"
      aria-label="Search products"
      value={search}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
    />
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-bold transition ${
            category === filter
              ? "bg-teal-50 text-teal-900 ring-2 ring-teal-600 dark:bg-teal-950 dark:text-teal-100 dark:ring-teal-300"
              : "bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
          }`}
          onClick={() => onCategoryChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Button className="flex min-h-12 items-center justify-center gap-2 bg-teal-700" onClick={onAdd}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add item
      </Button>
      <Button
        variant="outlined"
        className="flex min-h-12 items-center justify-center gap-2 border-slate-300 text-slate-800 dark:border-slate-700 dark:text-white"
        onClick={onScan}
      >
        <ScanLine className="h-4 w-4" aria-hidden="true" />
        Scan
      </Button>
    </div>
  </section>
);
