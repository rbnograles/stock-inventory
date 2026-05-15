/**
 * Hero summary for the finance dashboard. Shows the month's net balance with
 * income and expense pills, plus a navigation row to jump months. The card
 * mirrors the inventory AttentionCard so the two dashboards feel cohesive.
 */
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/money";

interface FinanceSummaryCardProps {
  monthLabel: string;
  income: number;
  expense: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  atCurrentMonth: boolean;
}

export const FinanceSummaryCard = ({
  monthLabel,
  income,
  expense,
  onPreviousMonth,
  onNextMonth,
  onResetMonth,
  atCurrentMonth,
}: FinanceSummaryCardProps) => {
  const balance = income - expense;
  const positive = balance >= 0;
  const gradient = positive
    ? "from-teal-500 via-emerald-500 to-cyan-500"
    : "from-rose-500 via-pink-500 to-orange-500";

  return (
    <section
      aria-label="Finance summary"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-3.5 text-white shadow-soft`}
    >
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={onPreviousMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onResetMonth}
          disabled={atCurrentMonth}
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 disabled:cursor-default"
        >
          {monthLabel}
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="relative mt-2 flex items-center gap-2.5">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
            Net balance
          </p>
          <p className="truncate text-2xl font-extrabold leading-tight">
            {positive ? "" : "−"}
            {formatMoney(Math.abs(balance))}
          </p>
        </div>
      </div>

      <div className="relative mt-2.5 grid grid-cols-2 gap-1.5 text-sm font-semibold">
        <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-2.5 py-1.5 backdrop-blur">
          <TrendingUp className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/85">Income</p>
            <p className="truncate text-sm font-extrabold leading-tight">{formatMoney(income)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-2.5 py-1.5 backdrop-blur">
          <TrendingDown className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/85">Expense</p>
            <p className="truncate text-sm font-extrabold leading-tight">{formatMoney(expense)}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
