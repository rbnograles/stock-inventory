/**
 * Coordinates Supabase-backed finance state for the dashboard: loads
 * transactions + categories, auto-seeds default categories on first login, and
 * exposes the mutations the UI needs.
 */
import { useCallback, useEffect, useState } from "react";
import {
  createFinanceCategory,
  deleteFinanceCategory,
  deleteTransaction,
  getFinanceCategories,
  getTransactions,
  renameFinanceTransactionsCategory,
  saveTransactionDraft,
  seedFinanceCategories,
  updateFinanceCategory,
} from "@/lib/financeStore";
import {
  DEFAULT_FINANCE_CATEGORY_SEEDS,
  type FinanceCategory,
  type FinanceCategoryDraft,
  type Transaction,
  type TransactionDraft,
} from "@/types/finance";

export const useFinance = (userId?: string) => {
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCategories([]);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let cats = await getFinanceCategories();
      if (cats.length === 0) {
        cats = await seedFinanceCategories(DEFAULT_FINANCE_CATEGORY_SEEDS, userId);
      }
      setCategories(cats);
      setTransactions(await getTransactions());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load finance data.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveTransaction = useCallback(
    async (draft: TransactionDraft, current?: Transaction) => {
      if (!userId) {
        throw new Error("Please sign in before saving transactions.");
      }

      const saved = await saveTransactionDraft(draft, userId, current);
      setTransactions((list) => {
        const normalized = current?.isOperationalFund && !saved.isOperationalFund
          ? list.map((entry) =>
              entry.operationalFundId === current.id ? { ...entry, operationalFundId: undefined } : entry,
            )
          : list;
        const without = normalized.filter((entry) => entry.id !== saved.id);
        return [saved, ...without].sort(
          (a, b) =>
            b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt),
        );
      });
      return saved;
    },
    [userId],
  );

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(id);
    setTransactions((list) => list.filter((entry) => entry.id !== id));
  }, []);

  const addCategory = useCallback(
    async (draft: FinanceCategoryDraft) => {
      if (!userId) {
        throw new Error("Please sign in before managing categories.");
      }

      const sortOrder = categories.filter((entry) => entry.kind === draft.kind).length;
      const created = await createFinanceCategory(draft, userId, sortOrder);
      setCategories((list) => [...list, created]);
      return created;
    },
    [categories, userId],
  );

  const editCategory = useCallback(
    async (id: string, draft: FinanceCategoryDraft) => {
      const current = categories.find((entry) => entry.id === id);
      const updated = await updateFinanceCategory(id, draft);

      if (userId && current && current.kind === updated.kind && current.name !== updated.name) {
        await renameFinanceTransactionsCategory(userId, current.kind, current.name, updated.name);
        setTransactions((list) =>
          list.map((entry) =>
            entry.kind === current.kind && entry.category === current.name
              ? { ...entry, category: updated.name }
              : entry,
          ),
        );
      }

      setCategories((list) => list.map((entry) => (entry.id === id ? updated : entry)));
      return updated;
    },
    [categories, userId],
  );

  const removeCategory = useCallback(async (id: string) => {
    await deleteFinanceCategory(id);
    setCategories((list) => list.filter((entry) => entry.id !== id));
  }, []);

  return {
    categories,
    transactions,
    isLoading,
    error,
    refresh,
    saveTransaction,
    removeTransaction,
    addCategory,
    editCategory,
    removeCategory,
  };
};
