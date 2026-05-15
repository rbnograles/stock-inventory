/**
 * Pure analytics helpers for the Insights tab. Keeps the dashboard component
 * focused on layout while window math, bucketing, and category aggregation
 * stay deterministic and easy to test.
 */
import type { FinanceCategory, Transaction, TransactionKind } from "@/types/finance";
import { getDaysUntilExpiry, getExpiryStatus } from "@/lib/expiry";
import { countsAgainstCashFlow } from "@/lib/financeOperational";
import type { ExpiryStatus, InventoryItem } from "@/types/inventory";

export type InsightsPeriod = "1m" | "3m" | "6m" | "1y";

export const PERIOD_OPTIONS: { value: InsightsPeriod; label: string; longLabel: string }[] = [
  { value: "1m", label: "1M", longLabel: "Last 30 days" },
  { value: "3m", label: "3M", longLabel: "Last 90 days" },
  { value: "6m", label: "6M", longLabel: "Last 180 days" },
  { value: "1y", label: "1Y", longLabel: "Last 12 months" },
];

const DAYS_FOR_PERIOD: Record<InsightsPeriod, number> = {
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

export type Granularity = "day" | "week" | "month";

const GRANULARITY_FOR_PERIOD: Record<InsightsPeriod, Granularity> = {
  "1m": "day",
  "3m": "week",
  "6m": "week",
  "1y": "month",
};

export const granularityForPeriod = (period: InsightsPeriod) => GRANULARITY_FOR_PERIOD[period];

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const startOfWeek = (date: Date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = (day + 6) % 7;
  next.setDate(next.getDate() - diff);
  return next;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, n: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + n);
  return next;
};

const isoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export interface PeriodWindow {
  from: Date;
  to: Date;
  days: number;
  fromIso: string;
  toIso: string;
}

const buildWindow = (from: Date, to: Date, days: number): PeriodWindow => ({
  from,
  to,
  days,
  fromIso: isoDay(from),
  toIso: isoDay(to),
});

export const getPeriodWindow = (period: InsightsPeriod, now = new Date()): PeriodWindow => {
  const days = DAYS_FOR_PERIOD[period];
  const to = startOfDay(now);
  const from = addDays(to, -(days - 1));
  return buildWindow(from, to, days);
};

export const getPriorPeriodWindow = (period: InsightsPeriod, now = new Date()): PeriodWindow => {
  const days = DAYS_FOR_PERIOD[period];
  const current = getPeriodWindow(period, now);
  const to = addDays(current.from, -1);
  const from = addDays(to, -(days - 1));
  return buildWindow(from, to, days);
};

export const isInWindow = (iso: string, window: PeriodWindow) =>
  iso >= window.fromIso && iso <= window.toIso;

export interface BucketRow {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export const bucketByPeriod = (
  transactions: Transaction[],
  window: PeriodWindow,
  granularity: Granularity,
): BucketRow[] => {
  const buckets: BucketRow[] = [];
  let cursor =
    granularity === "month"
      ? startOfMonth(window.from)
      : granularity === "week"
        ? startOfWeek(window.from)
        : startOfDay(window.from);

  while (cursor <= window.to) {
    let key: string;
    let label: string;
    if (granularity === "day") {
      key = isoDay(cursor);
      label = `${cursor.getMonth() + 1}/${cursor.getDate()}`;
    } else if (granularity === "week") {
      key = isoDay(cursor);
      label = cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } else {
      key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      label = cursor.toLocaleDateString(undefined, { month: "short" });
    }
    buckets.push({ key, label, income: 0, expense: 0, net: 0 });

    cursor = new Date(cursor);
    if (granularity === "day") cursor.setDate(cursor.getDate() + 1);
    else if (granularity === "week") cursor.setDate(cursor.getDate() + 7);
    else cursor.setMonth(cursor.getMonth() + 1);
  }

  const indexByKey = new Map<string, number>();
  buckets.forEach((bucket, idx) => indexByKey.set(bucket.key, idx));

  for (const tx of transactions) {
    if (!isInWindow(tx.occurredOn, window)) continue;
    if (!countsAgainstCashFlow(tx)) continue;
    const date = new Date(`${tx.occurredOn}T00:00:00`);
    let key: string;
    if (granularity === "day") {
      key = tx.occurredOn;
    } else if (granularity === "week") {
      key = isoDay(startOfWeek(date));
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    const idx = indexByKey.get(key);
    if (idx === undefined) continue;
    if (tx.kind === "income") buckets[idx].income += tx.amount;
    else buckets[idx].expense += tx.amount;
    buckets[idx].net = buckets[idx].income - buckets[idx].expense;
  }

  return buckets;
};

export interface PeriodSummary {
  income: number;
  expense: number;
  balance: number;
  count: number;
  transactions: Transaction[];
  expenses: Transaction[];
}

export const summarizeWindow = (
  transactions: Transaction[],
  window: PeriodWindow,
): PeriodSummary => {
  const inWindow = transactions.filter((tx) => isInWindow(tx.occurredOn, window));
  let income = 0;
  let expense = 0;
  for (const tx of inWindow) {
    if (!countsAgainstCashFlow(tx)) continue;
    if (tx.kind === "income") income += tx.amount;
    else expense += tx.amount;
  }
  return {
    income,
    expense,
    balance: income - expense,
    count: inWindow.length,
    transactions: inWindow,
    expenses: inWindow.filter((tx) => tx.kind === "expense" && countsAgainstCashFlow(tx)),
  };
};

export interface CategorySlice {
  name: string;
  amount: number;
  share: number;
  emoji: string;
  color: string;
}

const PALETTE = [
  "#0ea5e9",
  "#14b8a6",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#facc15",
  "#10b981",
  "#f43f5e",
  "#6366f1",
  "#22d3ee",
];

export const categoryBreakdown = (
  transactions: Transaction[],
  categories: FinanceCategory[],
  kind: TransactionKind = "expense",
): CategorySlice[] => {
  const totals = new Map<string, number>();
  let total = 0;
  for (const tx of transactions) {
    if (tx.kind !== kind) continue;
    if (!countsAgainstCashFlow(tx)) continue;
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    total += tx.amount;
  }
  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], idx) => {
      const meta = categories.find((entry) => entry.name === name && entry.kind === kind);
      return {
        name,
        amount,
        share: total > 0 ? (amount / total) * 100 : 0,
        emoji: meta?.emoji ?? (kind === "income" ? "💰" : "💸"),
        color: PALETTE[idx % PALETTE.length],
      };
    });
};

/**
 * Returns the % change of `current` vs `prior`. Returns `null` when prior is
 * zero and current is not (no meaningful base for a percentage); returns 0
 * when both are zero so callers can render "—" or "0%" consistently.
 */
export const computeDelta = (current: number, prior: number): number | null => {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
};

export const topExpenses = (transactions: Transaction[], limit = 5): Transaction[] =>
  transactions
    .filter((tx) => tx.kind === "expense" && countsAgainstCashFlow(tx))
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

export interface InventoryHealthSummary {
  totalItems: number;
  totalUnits: number;
  healthy: number;
  soon: number;
  expired: number;
  unknown: number;
  attention: number;
}

export const summarizeInventoryHealth = (
  items: InventoryItem[],
  totalUnits: number,
): InventoryHealthSummary => {
  const summary: InventoryHealthSummary = {
    totalItems: items.length,
    totalUnits,
    healthy: 0,
    soon: 0,
    expired: 0,
    unknown: 0,
    attention: 0,
  };

  for (const item of items) {
    const status = getExpiryStatus(item.expiryDate);
    if (status === "unknown") summary.unknown += 1;
    else summary[status] += 1;
  }

  summary.attention = summary.soon + summary.expired;
  return summary;
};

export interface InventoryWatchItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  status: Extract<ExpiryStatus, "expired" | "soon">;
  daysUntilExpiry: number;
}

export const inventoryWatchlist = (
  items: InventoryItem[],
  limit = 5,
): InventoryWatchItem[] => {
  const watchlist: InventoryWatchItem[] = [];

  for (const item of items) {
    const status = getExpiryStatus(item.expiryDate);
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
    if ((status !== "expired" && status !== "soon") || daysUntilExpiry === null) {
      continue;
    }

    watchlist.push({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        status,
        daysUntilExpiry,
    });
  }

  return watchlist
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry || a.name.localeCompare(b.name))
    .slice(0, limit);
};
