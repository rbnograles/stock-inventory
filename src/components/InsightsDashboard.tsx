/**
 * Cross-domain command view for HomeStock. It reads inventory and finance
 * records together, then turns them into a small set of household signals so
 * the bottom nav's extra destination is strategic instead of another utility.
 */
import { ArrowDownRight, ArrowUpRight, Boxes, CircleDollarSign, Sparkles, TriangleAlert } from "lucide-react";
import { getExpiryStatus } from "@/lib/expiry";
import { formatMoney } from "@/lib/money";
import type { Transaction } from "@/types/finance";
import type { InventoryItem } from "@/types/inventory";

interface InsightsDashboardProps {
  items: InventoryItem[];
  totalUnits: number;
  transactions: Transaction[];
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = () =>
  new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

const topExpenseCategory = (transactions: Transaction[]) => {
  const totals = new Map<string, number>();
  transactions
    .filter((entry) => entry.kind === "expense")
    .forEach((entry) => totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount));

  return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0];
};

export const InsightsDashboard = ({ items, totalUnits, transactions }: InsightsDashboardProps) => {
  const expired = items.filter((item) => getExpiryStatus(item.expiryDate) === "expired").length;
  const soon = items.filter((item) => getExpiryStatus(item.expiryDate) === "soon").length;
  const healthy = items.filter((item) => getExpiryStatus(item.expiryDate) === "healthy").length;
  const attention = expired + soon;
  const currentMonth = monthKey(new Date());
  const monthTransactions = transactions.filter((entry) => entry.occurredOn.startsWith(currentMonth));
  const income = monthTransactions
    .filter((entry) => entry.kind === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const expense = monthTransactions
    .filter((entry) => entry.kind === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const balance = income - expense;
  const topExpense = topExpenseCategory(monthTransactions);
  const signal = attention > 0
    ? `${attention} item${attention === 1 ? "" : "s"} need attention`
    : items.length > 0
      ? "Inventory is looking steady"
      : "Ready for your first stock run";

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-soft dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-teal-400/20 text-teal-200">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-200">
              Household insights
            </p>
            <h1 className="text-2xl font-extrabold leading-tight">{signal}</h1>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3" aria-label="Insight metrics">
        <MetricCard
          icon={<Boxes className="h-5 w-5" aria-hidden="true" />}
          label="Stock"
          value={`${items.length} items`}
          detail={`${totalUnits} units on hand`}
        />
        <MetricCard
          icon={<TriangleAlert className="h-5 w-5" aria-hidden="true" />}
          label="Attention"
          value={`${attention}`}
          detail={`${expired} expired · ${soon} soon`}
          tone={attention > 0 ? "warn" : "good"}
        />
        <MetricCard
          icon={<CircleDollarSign className="h-5 w-5" aria-hidden="true" />}
          label={monthLabel()}
          value={formatMoney(Math.abs(balance))}
          detail={balance >= 0 ? "net positive" : "net negative"}
          tone={balance >= 0 ? "good" : "warn"}
        />
        <MetricCard
          icon={balance >= 0 ? <ArrowUpRight className="h-5 w-5" aria-hidden="true" /> : <ArrowDownRight className="h-5 w-5" aria-hidden="true" />}
          label="Cash flow"
          value={`${formatMoney(income)} in`}
          detail={`${formatMoney(expense)} out`}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Next best focus</h2>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          {attention > 0
            ? "Use or replace expiring products before adding more stock."
            : topExpense
              ? `${topExpense[0]} is the top expense this month at ${formatMoney(topExpense[1])}.`
              : healthy > 0
                ? "Stock looks healthy. Keep logging purchases so finance insights get sharper."
                : "Add inventory and a few transactions to unlock stronger household signals."}
        </p>
      </section>
    </div>
  );
};

const MetricCard = ({
  detail,
  icon,
  label,
  tone = "neutral",
  value,
}: {
  detail: string;
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "good" | "warn";
  value: string;
}) => {
  const toneClass = {
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    good: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  }[tone];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        {icon}
      </span>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  );
};
