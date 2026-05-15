/**
 * Main finance view. Mirrors the inventory dashboard layout: hero summary,
 * filter controls, then a grouped transaction list. Month scoping is handled
 * locally so the user can scrub backwards without re-loading the network.
 */
import { useMemo } from "react";
import { Filter, Inbox, MinusCircle, PlusCircle, Settings2, TrendingUp } from "lucide-react";
import { FinanceSummaryCard } from "@/components/FinanceSummaryCard";
import { TransactionRow } from "@/components/TransactionRow";
import { formatMoney } from "@/lib/money";
import type { FinanceCategory, Transaction, TransactionKind } from "@/types/finance";

interface FinanceDashboardProps {
  transactions: Transaction[];
  categories: FinanceCategory[];
  isLoading: boolean;
  error: string | null;
  monthOffset: number;
  kindFilter: "all" | TransactionKind;
  categoryFilter: string;
  onMonthOffsetChange: (next: number) => void;
  onKindFilterChange: (next: "all" | TransactionKind) => void;
  onCategoryFilterChange: (next: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
  onAddTransaction: () => void;
  onManageCategories: () => void;
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const shiftMonth = (offset: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
};

const monthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

const groupByDay = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((entry) => {
    const key = entry.occurredOn;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
};

const formatDayHeading = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const FinanceDashboard = ({
  transactions,
  categories,
  isLoading,
  error,
  monthOffset,
  kindFilter,
  categoryFilter,
  onMonthOffsetChange,
  onKindFilterChange,
  onCategoryFilterChange,
  onEditTransaction,
  onDeleteTransaction,
  onAddTransaction,
  onManageCategories,
}: FinanceDashboardProps) => {
  const referenceDate = useMemo(() => shiftMonth(monthOffset), [monthOffset]);
  const selectedKey = monthKey(referenceDate);

  const monthTransactions = useMemo(
    () => transactions.filter((entry) => entry.occurredOn.startsWith(selectedKey)),
    [selectedKey, transactions],
  );

  const filtered = useMemo(() => {
    return monthTransactions.filter((entry) => {
      const kindMatch = kindFilter === "all" || entry.kind === kindFilter;
      const categoryMatch = categoryFilter === "All" || entry.category === categoryFilter;
      return kindMatch && categoryMatch;
    });
  }, [categoryFilter, kindFilter, monthTransactions]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    monthTransactions.forEach((entry) => {
      if (entry.kind === "income") income += entry.amount;
      else expense += entry.amount;
    });
    return { income, expense };
  }, [monthTransactions]);

  const topExpenseCategories = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    monthTransactions
      .filter((entry) => entry.kind === "expense")
      .forEach((entry) => {
        totalsByCategory.set(
          entry.category,
          (totalsByCategory.get(entry.category) ?? 0) + entry.amount,
        );
      });
    return Array.from(totalsByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [monthTransactions]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  const visibleCategories = useMemo(() => {
    if (kindFilter === "all") return categories;
    return categories.filter((entry) => entry.kind === kindFilter);
  }, [categories, kindFilter]);

  return (
    <div className="space-y-4">
      <FinanceSummaryCard
        monthLabel={monthLabel(referenceDate)}
        income={totals.income}
        expense={totals.expense}
        onPreviousMonth={() => onMonthOffsetChange(monthOffset - 1)}
        onNextMonth={() => onMonthOffsetChange(monthOffset + 1)}
        onResetMonth={() => onMonthOffsetChange(0)}
        atCurrentMonth={monthOffset === 0}
      />

      {topExpenseCategories.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Top expense categories
          </h3>
          <ul className="mt-3 space-y-2">
            {topExpenseCategories.map(([name, amount]) => {
              const share = totals.expense > 0 ? Math.min(100, Math.round((amount / totals.expense) * 100)) : 0;
              const meta = categories.find((entry) => entry.name === name && entry.kind === "expense");
              return (
                <li key={name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-slate-700 dark:text-slate-200">
                      <span aria-hidden="true">{meta?.emoji ?? "💸"}</span>
                      <span className="truncate font-semibold">{name}</span>
                    </span>
                    <span className="flex-none text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                      {formatMoney(amount)} · {share}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3" aria-label="Filter transactions">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-1 shadow-card dark:bg-slate-900">
          <FilterPill
            active={kindFilter === "all"}
            onClick={() => onKindFilterChange("all")}
            icon={<Filter className="h-4 w-4" aria-hidden="true" />}
            label="All"
          />
          <FilterPill
            active={kindFilter === "income"}
            onClick={() => onKindFilterChange("income")}
            icon={<PlusCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />}
            label="Income"
          />
          <FilterPill
            active={kindFilter === "expense"}
            onClick={() => onKindFilterChange("expense")}
            icon={<MinusCircle className="h-4 w-4 text-rose-500" aria-hidden="true" />}
            label="Expense"
          />
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          <CategoryChip
            active={categoryFilter === "All"}
            label="All categories"
            emoji="✨"
            onClick={() => onCategoryFilterChange("All")}
          />
          {visibleCategories.map((category) => (
            <CategoryChip
              key={category.id}
              active={categoryFilter === category.name}
              label={category.name}
              emoji={category.emoji}
              onClick={() => onCategoryFilterChange(category.name)}
            />
          ))}
          <button
            type="button"
            onClick={onManageCategories}
            className="flex h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            Manage
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading transactions…
        </p>
      ) : null}

      {!isLoading && filtered.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-soft">
            <Inbox className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-slate-900 dark:text-white">
              Nothing logged here yet
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Add a transaction to start tracking this month.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddTransaction}
            className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-soft transition active:scale-[0.98] hover:brightness-110"
          >
            Add transaction
          </button>
        </section>
      ) : null}

      <div className="space-y-4">
        {grouped.map(([day, entries]) => {
          const dayTotal = entries.reduce(
            (sum, entry) => sum + (entry.kind === "income" ? entry.amount : -entry.amount),
            0,
          );
          return (
            <section key={day} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatDayHeading(day)}
                </h3>
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    dayTotal >= 0
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-rose-600 dark:text-rose-300"
                  }`}
                >
                  {dayTotal >= 0 ? "+" : "−"}
                  {formatMoney(Math.abs(dayTotal))}
                </span>
              </div>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                {entries.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    categories={categories}
                    onEdit={onEditTransaction}
                    onDelete={onDeleteTransaction}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

const FilterPill = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition ${
      active
        ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`}
  >
    {icon}
    {label}
  </button>
);

const CategoryChip = ({
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
