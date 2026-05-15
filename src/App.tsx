/**
 * Orchestrates the HomeStock mobile dashboard. The app keeps inventory state
 * local-first, routes barcode scans into the add/edit dialog, and exposes the
 * high-frequency kitchen workflows through one focused screen.
 */
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CategorySection } from "@/components/CategorySection";
import { InventoryControls, type CategoryFilter } from "@/components/InventoryControls";
import { InventoryHeader } from "@/components/InventoryHeader";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { SummaryStrip } from "@/components/SummaryStrip";
import { getExpiryStatus } from "@/lib/expiry";
import { useInventory } from "@/hooks/useInventory";
import { INVENTORY_CATEGORIES, type InventoryCategory, type InventoryItem } from "@/types/inventory";

const categoryFilters: CategoryFilter[] = ["All", ...INVENTORY_CATEGORIES];
const ScannerDialog = lazy(() =>
  import("@/components/ScannerDialog").then((module) => ({ default: module.ScannerDialog })),
);

const matchesSearch = (item: InventoryItem, search: string) => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [item.name, item.category, item.barcode, item.location, item.notes]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(query));
};

export default function App() {
  const { items, totalUnits, isLoading, error, refresh, saveDraft, removeItem } = useInventory();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [darkMode, setDarkMode] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const categoryMatch = category === "All" || item.category === category;
        return categoryMatch && matchesSearch(item, search);
      }),
    [category, items, search],
  );

  const groupedItems = useMemo(
    () =>
      INVENTORY_CATEGORIES.map((group) => ({
        category: group,
        items: filteredItems.filter((item) => item.category === group),
      })),
    [filteredItems],
  );

  const consumeSoon = useMemo(
    () => items.filter((item) => ["expired", "soon"].includes(getExpiryStatus(item.expiryDate))).length,
    [items],
  );

  const openAddForm = () => {
    setEditingItem(undefined);
    setScannedBarcode("");
    setFormOpen(true);
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingItem(item);
    setScannedBarcode("");
    setFormOpen(true);
  };

  const handleScan = (barcode: string) => {
    const existingItem = items.find((item) => item.barcode === barcode);
    setEditingItem(existingItem);
    setScannedBarcode(barcode);
    setFormOpen(true);
  };

  const handleDelete = async (item: InventoryItem) => {
    const confirmed = window.confirm(`Delete ${item.name} from your inventory?`);

    if (confirmed) {
      await removeItem(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-950 dark:bg-slate-950 dark:text-white">
      <InventoryHeader
        darkMode={darkMode}
        onRefresh={() => void refresh()}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
      />

      <main className="mx-auto max-w-xl space-y-5 px-4 py-5">
        <section className="space-y-4">
          <SummaryStrip items={items} totalUnits={totalUnits} />
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950">
            <p className="text-sm font-semibold text-teal-950 dark:text-teal-100">
              {consumeSoon === 0
                ? "Stock is in good shape. No urgent expiry actions today."
                : `${consumeSoon} product${consumeSoon === 1 ? "" : "s"} should be consumed or checked soon.`}
            </p>
          </div>
        </section>

        <InventoryControls
          category={category}
          filters={categoryFilters}
          search={search}
          onAdd={openAddForm}
          onCategoryChange={setCategory}
          onScan={() => setScannerOpen(true)}
          onSearchChange={setSearch}
        />

        {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading inventory...</p> : null}

        <div className="space-y-5">
          {groupedItems.map((group) => (
            <CategorySection
              key={group.category}
              category={group.category}
              items={group.items}
              onEdit={openEditForm}
              onDelete={(item) => void handleDelete(item)}
            />
          ))}
        </div>

        {!isLoading && filteredItems.length === 0 ? (
          <section className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <p className="font-bold text-slate-800 dark:text-slate-100">No products found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add an item or clear your filters.</p>
          </section>
        ) : null}
      </main>

      <ItemFormDialog
        open={formOpen}
        barcode={scannedBarcode}
        item={editingItem}
        onClose={() => setFormOpen(false)}
        onClearBarcode={() => setScannedBarcode("")}
        onSubmit={async (draft, current) => {
          await saveDraft(draft, current);
        }}
      />
      <Suspense fallback={null}>
        {scannerOpen ? (
          <ScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleScan} />
        ) : null}
      </Suspense>
      <BottomNav onAdd={openAddForm} onScan={() => setScannerOpen(true)} />
    </div>
  );
}
