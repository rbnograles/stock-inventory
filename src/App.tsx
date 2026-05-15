/**
 * Orchestrates the authenticated HomeStock mobile dashboard. Supabase auth
 * gates the workspace, inventory and finance state load from user-scoped remote
 * tables, and the bottom bar routes the primary add action to the active tool.
 */
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { DailyDigestCard } from "@/components/DailyDigestCard";
import { InventoryGreeting } from "@/components/InventoryGreeting";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav, type AppView } from "@/components/BottomNav";
import { CategoryManagerDialog } from "@/components/CategoryManagerDialog";
import { CategorySection, type InventoryViewMode } from "@/components/CategorySection";
import { ViewToggle } from "@/components/ViewToggle";
import { EmptyInventoryState } from "@/components/EmptyInventoryState";
import { FinanceCategoryManagerDialog } from "@/components/FinanceCategoryManagerDialog";
import { FinanceDashboard } from "@/components/FinanceDashboard";
import { InventoryControls, type CategoryFilter } from "@/components/InventoryControls";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { FinanceSkeleton, InsightsSkeleton, InventorySkeleton } from "@/components/skeletons";
import { ToastNotification, type ToastMessage } from "@/components/ToastNotification";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { getExpiryStatus } from "@/lib/expiry";
import { getOperationalFundSummaries } from "@/lib/financeOperational";
import { getDisplayName, getStoredDisplayName } from "@/lib/userProfile";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { useFinance } from "@/hooks/useFinance";
import { useInventory } from "@/hooks/useInventory";
import { usePersistedState } from "@/hooks/usePersistedState";

const APP_VIEWS: readonly AppView[] = ["inventory", "finance", "insights", "profile"];
const isAppView = (value: unknown): value is AppView =>
  typeof value === "string" && (APP_VIEWS as readonly string[]).includes(value);

const initialDarkMode = (): boolean => {
  try {
    const stored = window.localStorage.getItem("homestock-theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // ignore
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
import { type Transaction } from "@/types/finance";
import { type InventoryItem } from "@/types/inventory";

const InsightsDashboard = lazy(() => import("@/components/InsightsDashboard").then((module) => ({ default: module.InsightsDashboard })));

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
    error: authError, clearError, clearPasswordRecovery, signOut, updateDisplayName,
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
  const { currency, setCurrency: changeCurrency } = useCurrency();
  const [view, setView] = usePersistedState<AppView>("homestock-view", "inventory", isAppView);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [inventoryViewMode, setInventoryViewMode] = useState<InventoryViewMode>("list");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InventoryItem | undefined>();
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [passwordUpdateRequested, setPasswordUpdateRequested] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [pendingDelete, setPendingDelete] = useState<InventoryItem | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [financeMonthOffset, setFinanceMonthOffset] = useState(0);
  const [financeKindFilter, setFinanceKindFilter] = useState<"all" | "income" | "expense">("all");
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState("All");
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [financeCategoryManagerOpen, setFinanceCategoryManagerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [initialOperationalFundId, setInitialOperationalFundId] = useState("");
  const [pendingTransactionDelete, setPendingTransactionDelete] = useState<Transaction | undefined>();
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(initialDarkMode);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      window.localStorage.setItem("homestock-theme", darkMode ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current));
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notifySuccess = (title: string, detail?: string) => {
    setToast({ id: Date.now(), title, detail });
  };

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

  const operationalFunds = useMemo(
    () => getOperationalFundSummaries(finance.transactions).map((entry) => entry.fund),
    [finance.transactions],
  );

  const openAddForm = () => {
    setView("inventory");
    setEditingItem(undefined);
    setFormOpen(true);
  };

  const openAddTransaction = () => {
    setView("finance");
    setEditingTransaction(undefined);
    setInitialOperationalFundId("");
    setTransactionFormOpen(true);
  };

  const openAddOperationalSpend = (fundId: string) => {
    setView("finance");
    setEditingTransaction(undefined);
    setInitialOperationalFundId(fundId);
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
    setDetailOpen(false);
    setFormOpen(true);
  };

  const openDetailView = (item: InventoryItem) => {
    setViewingItem(item);
    setDetailOpen(true);
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
      const deletedName = pendingDelete.name;
      await removeItem(pendingDelete.id);
      setDetailOpen(false);
      setPendingDelete(undefined);
      notifySuccess("Item deleted", deletedName);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setInitialOperationalFundId("");
    setTransactionFormOpen(true);
  };

  const confirmTransactionDelete = async () => {
    if (!pendingTransactionDelete) {
      return;
    }

    setIsDeletingTransaction(true);
    try {
      const deleted = pendingTransactionDelete;
      await finance.removeTransaction(pendingTransactionDelete.id);
      setPendingTransactionDelete(undefined);
      notifySuccess("Transaction deleted", `${deleted.kind === "income" ? "Income" : "Expense"} · ${deleted.category}`);
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
      <main className="safe-pt mx-auto max-w-xl space-y-5 px-4 pb-10 pt-14">
        {view === "inventory" ? (
          isLoading ? (
            <InventorySkeleton />
          ) : (
          <div className="mt-2">
            <InventoryGreeting displayName={getDisplayName(user)} />
            <DailyDigestCard
              items={items}
              totalUnits={totalUnits}
              categories={categories}
              attentionActive={attentionOnly}
              isLoading={isLoading}
              onToggleAttention={() => setAttentionOnly((current) => !current)}
              onOpenItem={openDetailView}
              onAddItem={openAddForm}
            />

            <InventoryControls
              category={category}
              categories={categories}
              search={search}
              onCategoryChange={setCategory}
              onSearchChange={setSearch}
              onManageCategories={openManageCategories}
            />

            {authError || error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                {authError ?? error}
              </p>
            ) : null}

            {filteredItems.length > 0 ? (
              <div className="flex items-center justify-between px-1 pt-1 mt-2">
                <p className="text-xs font-semibold hs-text-muted">
                  {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
                </p>
                <ViewToggle mode={inventoryViewMode} onChange={setInventoryViewMode} />
              </div>
            ) : null}

            <div className="space-y-4">
              {groupedItems.map((group) => (
                <CategorySection
                  key={group.key}
                  category={group.name}
                  emoji={group.emoji}
                  items={group.items}
                  categories={categories}
                  viewMode={inventoryViewMode}
                  onView={openDetailView}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  onAdjustQuantity={handleAdjustQuantity}
                />
              ))}
            </div>

            {filteredItems.length === 0 ? (
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
          </div>
          )
        ) : view === "finance" ? (
          finance.isLoading ? (
            <FinanceSkeleton />
          ) : (
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
            onAddOperationalSpend={openAddOperationalSpend}
            onManageCategories={openManageFinanceCategories}
          />
          )
        ) : view === "insights" ? (
          isLoading || finance.isLoading ? (
            <InsightsSkeleton />
          ) : (
          <Suspense fallback={<InsightsSkeleton />}>
            <InsightsDashboard
              items={items}
              totalUnits={totalUnits}
              transactions={finance.transactions}
              financeCategories={finance.categories}
            />
          </Suspense>
          )
        ) : (
          <ProfileDashboard
            darkMode={darkMode}
            email={user?.email}
            displayName={getDisplayName(user)}
            storedDisplayName={getStoredDisplayName(user)}
            inventoryCategoryCount={categories.length}
            financeCategoryCount={finance.categories.length}
            currency={currency}
            onCurrencyChange={changeCurrency}
            onChangePassword={() => setPasswordUpdateRequested(true)}
            onSaveDisplayName={updateDisplayName}
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
        item={editingItem}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onManageCategories={openManageCategories}
        onSubmit={async (draft, current) => {
          const saved = await saveDraft(draft, current);
          notifySuccess(current ? "Item updated" : "Item added", saved.name);
        }}
      />
      <TransactionFormDialog
        open={transactionFormOpen}
        transaction={editingTransaction}
        categories={finance.categories}
        operationalFunds={operationalFunds}
        initialOperationalFundId={initialOperationalFundId}
        onClose={() => {
          setTransactionFormOpen(false);
          setInitialOperationalFundId("");
        }}
        onManageCategories={openManageFinanceCategories}
        onSubmit={async (draft, current) => {
          const saved = await finance.saveTransaction(draft, current);
          setInitialOperationalFundId("");
          notifySuccess(
            current ? "Transaction updated" : "Transaction added",
            `${saved.kind === "income" ? "Income" : "Expense"} · ${saved.category}`,
          );
        }}
      />
      <CategoryManagerDialog
        open={categoryManagerOpen}
        categories={categories}
        error={categoriesError}
        onClose={() => setCategoryManagerOpen(false)}
        onCreate={async (draft) => {
          const created = await addCategory(draft);
          notifySuccess("Inventory category added", created.name);
          return created;
        }}
        onUpdate={async (id, draft) => {
          const updated = await editCategory(id, draft);
          notifySuccess("Inventory category updated", updated.name);
          return updated;
        }}
        onDelete={async (id) => {
          const deleted = categories.find((entry) => entry.id === id);
          await removeCategory(id);
          notifySuccess("Inventory category deleted", deleted?.name);
        }}
      />
      <FinanceCategoryManagerDialog
        open={financeCategoryManagerOpen}
        categories={finance.categories}
        error={finance.error}
        onClose={() => setFinanceCategoryManagerOpen(false)}
        onCreate={async (draft) => {
          const created = await finance.addCategory(draft);
          notifySuccess("Finance category added", created.name);
          return created;
        }}
        onUpdate={async (id, draft) => {
          const updated = await finance.editCategory(id, draft);
          notifySuccess("Finance category updated", updated.name);
          return updated;
        }}
        onDelete={async (id) => {
          const deleted = finance.categories.find((entry) => entry.id === id);
          await finance.removeCategory(id);
          notifySuccess("Finance category deleted", deleted?.name);
        }}
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
      <ToastNotification message={toast} onDismiss={() => setToast(null)} />
      <BottomNav view={view} onChangeView={setView} onAdd={handlePrimaryAdd} />
      </div>
    </AuthGate>
  );
}
