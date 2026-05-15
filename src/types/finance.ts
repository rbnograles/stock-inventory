/**
 * Finance domain contract. Transactions are user-scoped income/expense entries
 * with a free-text category that maps back to a row in finance_categories for
 * display metadata (emoji + kind).
 */
export type TransactionKind = "income" | "expense";

export interface FinanceCategory {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  kind: TransactionKind;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceCategoryDraft {
  name: string;
  emoji: string;
  kind: TransactionKind;
}

export interface FinanceCategorySeed {
  name: string;
  emoji: string;
  kind: TransactionKind;
}

export interface Transaction {
  id: string;
  userId: string;
  kind: TransactionKind;
  amount: number;
  category: string;
  description?: string;
  occurredOn: string;
  isOperationalFund: boolean;
  operationalFundId?: string;
  operationalPeriodStart?: string;
  operationalPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDraft {
  kind: TransactionKind;
  amount: number;
  category: string;
  description: string;
  occurredOn: string;
  isOperationalFund: boolean;
  operationalFundId: string;
  operationalPeriodStart: string;
  operationalPeriodEnd: string;
}

export const EMPTY_TRANSACTION_DRAFT: TransactionDraft = {
  kind: "expense",
  amount: 0,
  category: "",
  description: "",
  occurredOn: new Date().toISOString().slice(0, 10),
  isOperationalFund: false,
  operationalFundId: "",
  operationalPeriodStart: "",
  operationalPeriodEnd: "",
};

export const DEFAULT_FINANCE_CATEGORY_SEEDS: FinanceCategorySeed[] = [
  { name: "Salary", emoji: "💼", kind: "income" },
  { name: "Bonus", emoji: "🎁", kind: "income" },
  { name: "Refund", emoji: "↩️", kind: "income" },
  { name: "Other", emoji: "💰", kind: "income" },
  { name: "Groceries", emoji: "🛒", kind: "expense" },
  { name: "Rent", emoji: "🏠", kind: "expense" },
  { name: "Utilities", emoji: "⚡", kind: "expense" },
  { name: "Transport", emoji: "🚗", kind: "expense" },
  { name: "Dining", emoji: "🍽️", kind: "expense" },
  { name: "Entertainment", emoji: "🎬", kind: "expense" },
  { name: "Health", emoji: "💊", kind: "expense" },
  { name: "Shopping", emoji: "🛍️", kind: "expense" },
  { name: "Other", emoji: "📦", kind: "expense" },
];
