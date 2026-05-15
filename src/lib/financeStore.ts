/**
 * Supabase repositories for finance transactions and categories. Both tables
 * are user-scoped via RLS; this module just maps between snake_case rows and
 * the camelCase domain shapes the UI prefers.
 */
import { supabase } from "@/lib/supabaseClient";
import { defaultOperationalPeriodEnd } from "@/lib/financeOperational";
import type {
  FinanceCategory,
  FinanceCategoryDraft,
  FinanceCategorySeed,
  Transaction,
  TransactionDraft,
  TransactionKind,
} from "@/types/finance";

interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  kind: TransactionKind;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface TransactionRow {
  id: string;
  user_id: string;
  kind: TransactionKind;
  amount: number | string;
  category: string;
  description: string | null;
  occurred_on: string;
  is_operational_fund?: boolean | null;
  operational_fund_id?: string | null;
  operational_period_start?: string | null;
  operational_period_end?: string | null;
  created_at: string;
  updated_at: string;
}

const cleanNullable = (value: string | undefined) => value?.trim() || null;

const OPERATIONAL_MIGRATION_MESSAGE =
  "Operational expenses need the latest Supabase migration. Apply 20260515163000_add_operational_expenses.sql, then try again.";

const isMissingOperationalColumnError = (message: string) =>
  [
    "is_operational_fund",
    "operational_fund_id",
    "operational_period_start",
    "operational_period_end",
  ].some((column) => message.includes(column));

const getSaveErrorMessage = (error: { message: string }, needsOperationalColumns: boolean) => {
  if (needsOperationalColumns && isMissingOperationalColumnError(error.message)) {
    return OPERATIONAL_MIGRATION_MESSAGE;
  }

  return error.message;
};

const mapCategoryRow = (row: CategoryRow): FinanceCategory => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  emoji: row.emoji,
  kind: row.kind,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTransactionRow = (row: TransactionRow): Transaction => ({
  id: row.id,
  userId: row.user_id,
  kind: row.kind,
  amount: Number(row.amount) || 0,
  category: row.category,
  description: row.description ?? undefined,
  occurredOn: row.occurred_on,
  isOperationalFund: Boolean(row.is_operational_fund),
  operationalFundId: row.operational_fund_id ?? undefined,
  operationalPeriodStart: row.operational_period_start ?? undefined,
  operationalPeriodEnd: row.operational_period_end ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getFinanceCategories = async (): Promise<FinanceCategory[]> => {
  const { data, error } = await supabase
    .from("finance_categories")
    .select("*")
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as CategoryRow[]).map(mapCategoryRow);
};

export const createFinanceCategory = async (
  draft: FinanceCategoryDraft,
  userId: string,
  sortOrder: number,
) => {
  const { data, error } = await supabase
    .from("finance_categories")
    .insert({
      user_id: userId,
      name: draft.name.trim(),
      emoji: draft.emoji.trim() || "💰",
      kind: draft.kind,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapCategoryRow(data as CategoryRow);
};

export const updateFinanceCategory = async (id: string, draft: FinanceCategoryDraft) => {
  const { data, error } = await supabase
    .from("finance_categories")
    .update({
      name: draft.name.trim(),
      emoji: draft.emoji.trim() || "💰",
      kind: draft.kind,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapCategoryRow(data as CategoryRow);
};

export const renameFinanceTransactionsCategory = async (
  userId: string,
  kind: TransactionKind,
  previousName: string,
  nextName: string,
) => {
  if (previousName.trim() === nextName.trim()) {
    return;
  }

  const { error } = await supabase
    .from("finance_transactions")
    .update({ category: nextName.trim() })
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("category", previousName.trim());

  if (error) throw new Error(error.message);
};

export const deleteFinanceCategory = async (id: string) => {
  const { error } = await supabase.from("finance_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const seedFinanceCategories = async (seeds: FinanceCategorySeed[], userId: string) => {
  const payload = seeds.map((seed, index) => ({
    user_id: userId,
    name: seed.name,
    emoji: seed.emoji,
    kind: seed.kind,
    sort_order: index,
  }));

  const { data, error } = await supabase.from("finance_categories").insert(payload).select("*");
  if (error) throw new Error(error.message);
  return (data as CategoryRow[]).map(mapCategoryRow);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as TransactionRow[]).map(mapTransactionRow);
};

export const saveTransactionDraft = async (
  draft: TransactionDraft,
  userId: string,
  current?: Transaction,
) => {
  const isExpense = draft.kind === "expense";
  const isOperationalFund = isExpense && draft.isOperationalFund;
  const periodStart = draft.operationalPeriodStart || draft.occurredOn;
  const basePayload = {
    kind: draft.kind,
    amount: Math.max(0, Number(draft.amount) || 0),
    category: draft.category.trim() || "Other",
    description: cleanNullable(draft.description),
    occurred_on: draft.occurredOn,
  };
  const needsOperationalColumns =
    isOperationalFund || Boolean(draft.operationalFundId) || Boolean(current?.isOperationalFund);
  const payload = needsOperationalColumns
    ? {
        ...basePayload,
        is_operational_fund: isOperationalFund,
        operational_fund_id:
          isExpense && !isOperationalFund && draft.operationalFundId
            ? draft.operationalFundId
            : null,
        operational_period_start: isOperationalFund ? periodStart : null,
        operational_period_end: isOperationalFund
          ? draft.operationalPeriodEnd || defaultOperationalPeriodEnd(periodStart)
          : null,
      }
    : basePayload;

  if (current) {
    const { data, error } = await supabase
      .from("finance_transactions")
      .update(payload)
      .eq("id", current.id)
      .select("*")
      .single();

    if (error) throw new Error(getSaveErrorMessage(error, needsOperationalColumns));
    if (current.isOperationalFund && !isOperationalFund) {
      await clearOperationalFundAssignments(current.id);
    }
    return mapTransactionRow(data as TransactionRow);
  }

  const { data, error } = await supabase
    .from("finance_transactions")
    .insert({ user_id: userId, ...payload })
    .select("*")
    .single();

  if (error) throw new Error(getSaveErrorMessage(error, needsOperationalColumns));
  return mapTransactionRow(data as TransactionRow);
};

const clearOperationalFundAssignments = async (fundId: string) => {
  const { error } = await supabase
    .from("finance_transactions")
    .update({ operational_fund_id: null })
    .eq("operational_fund_id", fundId);

  if (error) throw new Error(error.message);
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
