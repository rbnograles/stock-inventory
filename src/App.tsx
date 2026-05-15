/**
 * Orchestrates the authenticated HomeStock mobile dashboard. Supabase auth
 * gates the workspace, inventory and finance state load from user-scoped remote
 * tables, and the bottom bar routes the primary add action to the active tool.
 */
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { AttentionCard } from "@/components/AttentionCard";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav, type AppView } from "@/components/BottomNav";
import { CategoryManagerDialog } from "@/components/CategoryManagerDialog";
import { CategorySection } from "@/components/CategorySection";
import { EmptyInventoryState } from "@/components/EmptyInventoryState";
import { FinanceCategoryManagerDialog } from "@/components/FinanceCategoryManagerDialog";
import { FinanceDashboard } from "@/components/FinanceDashboard";
import { InsightsDashboard } from "@/components/InsightsDashboard";
import { InventoryControls, type CategoryFilter } from "@/components/InventoryControls";
import { InventoryGreeting } from "@/components/InventoryGreeting";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { getExpiryStatus } from "@/lib/expiry";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useFinance } from "@/hooks/useFinance";
import { useInventory } from "@/hooks/useInventory";
import { type Transaction } from "@/types/finance";
import { type InventoryItem } from "@/types/inventory";

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
  const {
    categories,
    error: categoriesError,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories(user?.id);
  const finance = useFinance(user?.id);
  const [view, setView] = useState<AppView>("inventory");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InventoryItem | undefined>();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [passwordUpdateRequested, setPasswordUpdateRequested] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [pendingDelete, setPendingDelete] = useState<InventoryItem | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [financeMonthOffset, setFinanceMonthOffset] = useState(0);
  const [financeKindFilter, setFinanceKindFilter] = useState<"all" | "income" | "expense">("all");
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState("All");
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [financeCategoryManagerOpen, setFinanceCategoryManagerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [pendingTransactionDelete, setPendingTransactionDelete] = useState<Transaction | undefined>();
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
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

  const groupedItems = useMemo(() => {
    const known = categories.map((entry) => ({
      key: entry.id,
      name: entry.name,
      emoji: entry.emoji,
    }));

    const orphanNames = new Set<string>();
    filteredItems.forEach((item) => {
      if (!categories.some((entry) => entry.name === item.category)) {
        orphanNames.add(item.category);
      }
    });

    const orphans = Array.from(orphanNames).map((name) => ({ key: `orphan:${name}`, name, emoji: "📦" }));

    return [...known, ...orphans].map((group) => ({
      ...group,
      items: filteredItems.filter((item) => item.category === group.name),
    }));
  }, [categories, filteredItems]);

  const openAddForm = () => {
    setView("inventory");
    setEditingItem(undefined);
    setScannedBarcode("");
    setFormOpen(true);
  };

  const openAddTransaction = () => {
    setView("finance");
    setEditingTransaction(undefined);
    setTransactionFormOpen(true);
  };

  const handlePrimaryAdd = () => {
    if (view === "finance") {
      openAddTransaction();
      return;
    }

    openAddForm();
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
    setView("inventory");
    setEditingItem(existingItem);
    setScannedBarcode(barcode);
    setFormOpen(true);
  };

  const openScanner = () => {
    setView("inventory");
    setScannerOpen(true);
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

  const openEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormOpen(true);
  };

  const confirmTransactionDelete = async () => {
    if (!pendingTransactionDelete) {
      return;
    }

    setIsDeletingTransaction(true);
    try {
      await finance.removeTransaction(pendingTransactionDelete.id);
      setPendingTransactionDelete(undefined);
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  const handleAdjustQuantity = (item: InventoryItem, delta: number) => void adjustQuantity(item, delta);

  const handlePasswordUpdateComplete = () => {
    setPasswordUpdateRequested(false);
    clearPasswordRecovery();
  };

  const openManageCategories = () => {
    setCategoryManagerOpen(true);
  };

  const openManageFinanceCategories = () => {
    setFinanceCategoryManagerOpen(true);
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
      <main className="safe-pt mx-auto max-w-xl space-y-4 px-4 py-4">
        {view === "inventory" ? (
          <>
            <InventoryGreeting email={user?.email} itemCount={items.length} totalUnits={totalUnits} />

            <AttentionCard
              items={items}
              totalUnits={totalUnits}
              attentionActive={attentionOnly}
              onToggleAttention={() => setAttentionOnly((current) => !current)}
            />

            <InventoryControls
              category={category}
              categories={categories}
              search={search}
              onCategoryChange={setCategory}
              onSearchChange={setSearch}
              onManageCategories={openManageCategories}
              onScan={openScanner}
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
                  key={group.key}
                  category={group.name}
                  emoji={group.emoji}
                  items={group.items}
                  categories={categories}
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
          </>
        ) : view === "finance" ? (
          <FinanceDashboard
            transactions={finance.transactions}
            categories={finance.categories}
            isLoading={finance.isLoading}
            error={finance.error}
            monthOffset={financeMonthOffset}
            kindFilter={financeKindFilter}
            categoryFilter={financeCategoryFilter}
            onMonthOffsetChange={setFinanceMonthOffset}
            onKindFilterChange={setFinanceKindFilter}
            onCategoryFilterChange={setFinanceCategoryFilter}
            onEditTransaction={openEditTransaction}
            onDeleteTransaction={setPendingTransactionDelete}
            onAddTransaction={openAddTransaction}
            onManageCategories={openManageFinanceCategories}
          />
        ) : view === "insights" ? (
          <InsightsDashboard items={items} totalUnits={totalUnits} transactions={finance.transactions} />
        ) : (
          <ProfileDashboard
            darkMode={darkMode}
            email={user?.email}
            inventoryCategoryCount={categories.length}
            financeCategoryCount={finance.categories.length}
            onChangePassword={() => setPasswordUpdateRequested(true)}
            onManageInventoryCategories={openManageCategories}
            onManageFinanceCategories={openManageFinanceCategories}
            onSignOut={() => void signOut()}
            onToggleDarkMode={() => setDarkMode((current) => !current)}
          />
        )}
      </main>

      <ItemDetailDialog
        open={detailOpen}
        item={viewingItem}
        categories={categories}
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
        categories={categories}
        onClose={() => setFormOpen(false)}
        onClearBarcode={() => setScannedBarcode("")}
        onManageCategories={openManageCategories}
        onSubmit={async (draft, current) => {
          await saveDraft(draft, current);
        }}
      />
      <TransactionFormDialog
        open={transactionFormOpen}
        transaction={editingTransaction}
        categories={finance.categories}
        onClose={() => setTransactionFormOpen(false)}
        onManageCategories={openManageFinanceCategories}
        onSubmit={async (draft, current) => {
          await finance.saveTransaction(draft, current);
        }}
      />
      <CategoryManagerDialog
        open={categoryManagerOpen}
        categories={categories}
        error={categoriesError}
        onClose={() => setCategoryManagerOpen(false)}
        onCreate={addCategory}
        onUpdate={editCategory}
        onDelete={removeCategory}
      />
      <FinanceCategoryManagerDialog
        open={financeCategoryManagerOpen}
        categories={finance.categories}
        error={finance.error}
        onClose={() => setFinanceCategoryManagerOpen(false)}
        onCreate={finance.addCategory}
        onUpdate={finance.editCategory}
        onDelete={finance.removeCategory}
      />
      <ConfirmDialog
        open={Boolean(pendingTransactionDelete)}
        tone="danger"
        title="Delete transaction?"
        message={
          pendingTransactionDelete
            ? `"${pendingTransactionDelete.category}" ${pendingTransactionDelete.kind} entry will be removed. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep it"
        busy={isDeletingTransaction}
        onCancel={() => !isDeletingTransaction && setPendingTransactionDelete(undefined)}
        onConfirm={() => void confirmTransactionDelete()}
      />
      <Suspense fallback={null}>
        {scannerOpen ? (
          <ScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleScan} />
        ) : null}
      </Suspense>
      <BottomNav view={view} onChangeView={setView} onAdd={handlePrimaryAdd} />
      </div>
    </AuthGate>
  );
}
