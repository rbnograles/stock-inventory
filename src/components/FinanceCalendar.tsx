/**
 * Monthly calendar view for the finance dashboard. Each day cell shows dot
 * indicators when transactions exist (rose for expenses, emerald for income);
 * tapping a day reveals its transactions and totals in a detail strip below.
 * Reuses the parent's month scope, so navigation stays in the summary card.
 */
import { useMemo, useState } from "react";
import { TransactionRow } from "@/components/TransactionRow";
import { countsAgainstCashFlow } from "@/lib/financeOperational";
import { formatMoney } from "@/lib/money";
import type { FinanceCategory, Transaction } from "@/types/finance";

interface FinanceCalendarProps {
  referenceDate: Date;
  monthTransactions: Transaction[];
  categories: FinanceCategory[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
  onAddTransaction: () => void;
}

interface DayBucket {
  expense: number;
  income: number;
  count: number;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const isoForLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayIso = () => isoForLocalDate(new Date());

const formatLongDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export const FinanceCalendar = ({
  referenceDate,
  monthTransactions,
  categories,
  onEditTransaction,
  onDeleteTransaction,
  onAddTransaction,
}: FinanceCalendarProps) => {
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const buckets = useMemo(() => {
    const map = new Map<string, DayBucket>();
    monthTransactions.forEach((entry) => {
      const current = map.get(entry.occurredOn) ?? { expense: 0, income: 0, count: 0 };
      if (countsAgainstCashFlow(entry)) {
        if (entry.kind === "expense") current.expense += entry.amount;
        else current.income += entry.amount;
      }
      current.count += 1;
      map.set(entry.occurredOn, current);
    });
    return map;
  }, [monthTransactions]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const leadingBlanks = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const total = leadingBlanks + daysInMonth;
    const trailingBlanks = (7 - (total % 7)) % 7;

    const list: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < leadingBlanks; i += 1) list.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(year, month, d);
      list.push({ iso: isoForLocalDate(date), day: d });
    }
    for (let i = 0; i < trailingBlanks; i += 1) list.push(null);
    return list;
  }, [month, year]);

  const today = todayIso();
  const selectedBucket = selectedIso ? buckets.get(selectedIso) : undefined;
  const selectedEntries = useMemo(
    () =>
      selectedIso
        ? monthTransactions
            .filter((entry) => entry.occurredOn === selectedIso)
            .sort((a, b) => b.amount - a.amount)
        : [],
    [monthTransactions, selectedIso],
  );

  return (
    <section className="space-y-3" aria-label="Monthly calendar">
      <div className="hs-surface p-3">
        <div
          role="row"
          className="grid grid-cols-7 gap-1 px-1 pb-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] hs-text-muted"
        >
          {WEEKDAYS.map((label, idx) => (
            <span key={`${label}-${idx}`} role="columnheader">
              {label}
            </span>
          ))}
        </div>
        <div role="grid" className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell) {
              return <span key={`blank-${idx}`} aria-hidden="true" className="aspect-square" />;
            }
            const bucket = buckets.get(cell.iso);
            const isToday = cell.iso === today;
            const isSelected = cell.iso === selectedIso;
            const hasExpense = (bucket?.expense ?? 0) > 0;
            const hasIncome = (bucket?.income ?? 0) > 0;

            const base =
              "relative flex aspect-square w-full flex-col items-center justify-center rounded-xl text-[13px] font-bold transition";
            const palette = isSelected
              ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
              : isToday
                ? "bg-teal-100 text-teal-900 ring-1 ring-teal-300 dark:bg-teal-500/20 dark:text-teal-100 dark:ring-teal-400/40"
                : bucket
                  ? "bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40";

            return (
              <button
                key={cell.iso}
                type="button"
                role="gridcell"
                aria-label={`${formatLongDay(cell.iso)}${
                  bucket
                    ? `, ${bucket.count} transaction${bucket.count === 1 ? "" : "s"}`
                    : ", no transactions"
                }`}
                aria-pressed={isSelected}
                onClick={() => setSelectedIso((current) => (current === cell.iso ? null : cell.iso))}
                className={`${base} ${palette}`}
              >
                <span className="leading-none">{cell.day}</span>
                {bucket ? (
                  <span className="absolute bottom-1 flex items-center gap-0.5">
                    {hasExpense ? (
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected ? "bg-rose-300" : "bg-rose-500"
                        }`}
                      />
                    ) : null}
                    {hasIncome ? (
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected ? "bg-emerald-300" : "bg-emerald-500"
                        }`}
                      />
                    ) : null}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedIso ? (
        <section className="space-y-2" aria-label="Selected day">
          <header className="flex flex-wrap items-baseline justify-between gap-2 px-1">
            <h3 className="text-sm font-bold hs-text-primary">{formatLongDay(selectedIso)}</h3>
            <div className="flex items-center gap-3 text-[11px] font-bold tabular-nums">
              {selectedBucket && selectedBucket.income > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-300">
                  +{formatMoney(selectedBucket.income)}
                </span>
              ) : null}
              {selectedBucket && selectedBucket.expense > 0 ? (
                <span className="text-rose-600 dark:text-rose-300">
                  −{formatMoney(selectedBucket.expense)}
                </span>
              ) : null}
            </div>
          </header>

          {selectedEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-sm font-semibold hs-text-secondary">No transactions on this day.</p>
              <button type="button" onClick={onAddTransaction} className="hs-btn-primary px-5 py-2">
                Add transaction
              </button>
            </div>
          ) : (
            <div className="hs-surface hs-divider">
              {selectedEntries.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  categories={categories}
                  onEdit={onEditTransaction}
                  onDelete={onDeleteTransaction}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="px-1 text-center text-[12px] font-medium hs-text-muted">
          Tap a day to see its transactions.
        </p>
      )}
    </section>
  );
};
