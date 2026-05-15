/**
 * Orchestrates the authenticated HomeStock mobile dashboard. Supabase auth
 * gates the workspace, inventory state loads from the user's remote table, and
 * scan/add/edit/delete flows remain optimized for kitchen use.
 */
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { AttentionCard } from "@/components/AttentionCard";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import { CategorySection } from "@/components/CategorySection";
import { EmptyInventoryState } from "@/components/EmptyInventoryState";
import { InventoryControls, type CategoryFilter } from "@/components/InventoryControls";
import { InventoryHeader } from "@/components/InventoryHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { getExpiryStatus } from "@/lib/expiry";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/hooks/useInventory";
import { INVENTORY_CATEGORIES, type InventoryItem } from "@/types/inventory";

const categoryFilters: CategoryFilter[] = ["All", ...INVENTORY_CATEGORIES];
const ScannerDialog = lazy(() => import("@/components/ScannerDialog").then((module) => ({ default: module.ScannerDialog })));

const matchesSearch = (item: InventoryItem, search: string) => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [item.name, item.category, item.barcode, item.location, item.notes]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(query));
};

const needsAttention = (item: InventoryItem) => ["expired", "soon"].includes(getExpiryStatus(item.expiryDate));

export default function App() {
  const {
    user, isPasswordRecovery, prefersResetPassword, isLoading: authLoading,
    error: authError, clearError, clearPasswordRecovery, signOut,
  } = useAuth();
  const { items, totalUnits, isLoading, error, saveDraft, removeItem, adjustQuantity } = useInventory(user?.id);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InventoryItem | undefined>();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [passwordUpdateRequested, setPasswordUpdateRequested] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [pendingDelete, setPendingDelete] = useState<InventoryItem | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [darkMode, setDarkMode] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const categoryMatch = category === "All" || item.category === category;
        const attentionMatch = !attentionOnly || needsAttention(item);
        return categoryMatch && attentionMatch && matchesSearch(item, search);
      }),
    [attentionOnly, category, items, search],
  );

  const groupedItems = useMemo(
    () =>
      INVENTORY_CATEGORIES.map((group) => ({
        category: group,
        items: filteredItems.filter((item) => item.category === group),
      })),
    [filteredItems],
  );

  const openAddForm = () => {
    setEditingItem(undefined);
    setScannedBarcode("");
    setFormOpen(true);
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingItem(item);
    setScannedBarcode("");
    setDetailOpen(false);
    setFormOpen(true);
  };

  const openDetailView = (item: InventoryItem) => {
    setViewingItem(item);
    setDetailOpen(true);
  };

  const handleScan = (barcode: string) => {
    const existingItem = items.find((item) => item.barcode === barcode);
    setEditingItem(existingItem);
    setScannedBarcode(barcode);
    setFormOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setPendingDelete(item);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeItem(pendingDelete.id);
      setDetailOpen(false);
      setPendingDelete(undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdjustQuantity = (item: InventoryItem, delta: number) => void adjustQuantity(item, delta);

  const handlePasswordUpdateComplete = () => {
    setPasswordUpdateRequested(false);
    clearPasswordRecovery();
  };

  return (
    <AuthGate
      authError={authError}
      authLoading={authLoading}
      isPasswordRecovery={isPasswordRecovery}
      passwordUpdateRequested={passwordUpdateRequested}
      prefersResetPassword={prefersResetPassword}
      userPresent={Boolean(user)}
      onClearError={clearError}
      onClearPasswordRecovery={handlePasswordUpdateComplete}
    >
      <div className="relative min-h-[100svh] bg-vibe-light pb-32 text-slate-900 dark:bg-vibe-dark dark:text-slate-100">
      <InventoryHeader
        darkMode={darkMode}
        email={user?.email}
        onChangePassword={() => setPasswordUpdateRequested(true)}
        onSignOut={() => void signOut()}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
      />

      <main className="mx-auto max-w-xl space-y-4 px-4 py-4">
        <AttentionCard
          items={items}
          totalUnits={totalUnits}
          attentionActive={attentionOnly}
          onToggleAttention={() => setAttentionOnly((current) => !current)}
        />

        <InventoryControls
          category={category}
          filters={categoryFilters}
          search={search}
          onCategoryChange={setCategory}
          onSearchChange={setSearch}
        />

        {authError || error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            {authError ?? error}
          </p>
        ) : null}
        {isLoading ? (
          <p className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading inventory…
          </p>
        ) : null}

        <div className="space-y-4">
          {groupedItems.map((group) => (
            <CategorySection
              key={group.category}
              category={group.category}
              items={group.items}
              onView={openDetailView}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onAdjustQuantity={handleAdjustQuantity}
            />
          ))}
        </div>

        {!isLoading && filteredItems.length === 0 ? (
          <EmptyInventoryState
            attentionOnly={attentionOnly}
            hasFilters={Boolean(attentionOnly || search || category !== "All")}
            onReset={() => {
              setAttentionOnly(false);
              setSearch("");
              setCategory("All");
            }}
          />
        ) : null}
      </main>

      <ItemDetailDialog
        open={detailOpen}
        item={viewingItem}
        onClose={() => setDetailOpen(false)}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        tone="danger"
        title="Delete item?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from your inventory. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep it"
        busy={isDeleting}
        onCancel={() => !isDeleting && setPendingDelete(undefined)}
        onConfirm={() => void confirmDelete()}
      />
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
    </AuthGate>
  );
}
