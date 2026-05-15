/**
 * Coordinates the Insights analytics workspace. It combines finance periods,
 * inventory freshness, KPI comparisons, and chart-ready data into a focused
 * mobile dashboard that helps Ryan decide what to spend, restock, or consume.
 */
import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Boxes, CalendarRange, ReceiptText, ShieldAlert } from "lucide-react";
import { CategoryExpenseChart, CashFlowTrendChart } from "@/components/insights/InsightsCharts";
import { InsightMetric, InsightsKpiGrid } from "@/components/insights/InsightsKpiGrid";
import { InventoryHealthPanel } from "@/components/insights/InventoryHealthPanel";
import {
  PERIOD_OPTIONS,
  categoryBreakdown,
  bucketByPeriod,
  computeDelta,
  getPeriodWindow,
  getPriorPeriodWindow,
  granularityForPeriod,
  inventoryWatchlist,
  summarizeInventoryHealth,
  summarizeWindow,
  type InsightsPeriod,
} from "@/lib/insights";
import { formatMoney } from "@/lib/money";
import type { FinanceCategory, Transaction } from "@/types/finance";
import type { InventoryItem } from "@/types/inventory";

interface InsightsDashboardProps {
  items: InventoryItem[];
  totalUnits: number;
  transactions: Transaction[];
  financeCategories: FinanceCategory[];
}

const compactDate = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

const formatDelta = (
  delta: number | null,
  invert = false,
): { label: string; tone: InsightMetric["deltaTone"] } => {
  if (delta === null) return { label: "New activity", tone: "up" as const };
  if (Math.abs(delta) < 0.5) return { label: "Flat vs prior", tone: "flat" as const };
  const higher = delta > 0;
  const tone: InsightMetric["deltaTone"] = higher === invert ? "down" : "up";
  return { label: `${higher ? "+" : ""}${Math.round(delta)}% vs prior`, tone };
};

const formatMoneyDelta = (current: number, prior: number): { label: string; tone: InsightMetric["deltaTone"] } => {
  const diff = current - prior;
  if (Math.abs(diff) < 1) return { label: "Flat vs prior", tone: "flat" };
  return {
    label: `${diff > 0 ? "+" : "-"}${formatMoney(Math.abs(diff))} vs prior`,
    tone: diff > 0 ? "up" : "down",
  };
};

export const InsightsDashboard = ({
  items,
  totalUnits,
  transactions,
  financeCategories,
}: InsightsDashboardProps) => {
  const [period, setPeriod] = useState<InsightsPeriod>("3m");

  const model = useMemo(() => {
    const window = getPeriodWindow(period);
    const priorWindow = getPriorPeriodWindow(period);
    const current = summarizeWindow(transactions, window);
    const prior = summarizeWindow(transactions, priorWindow);
    const buckets = bucketByPeriod(transactions, window, granularityForPeriod(period));
    const expenseSlices = categoryBreakdown(current.transactions, financeCategories, "expense");
    const health = summarizeInventoryHealth(items, totalUnits);
    const watchlist = inventoryWatchlist(items);
    return { window, current, prior, buckets, expenseSlices, health, watchlist };
  }, [financeCategories, items, period, totalUnits, transactions]);

  const balanceDelta = formatMoneyDelta(model.current.balance, model.prior.balance);
  const dailySpend = model.current.expense / model.window.days;
  const priorDailySpend = model.prior.expense / model.window.days;
  const spendPaceDelta = formatDelta(computeDelta(dailySpend, priorDailySpend), true);
  const riskRate = model.health.totalItems > 0 ? (model.health.attention / model.health.totalItems) * 100 : 0;
  const balancePositive = model.current.balance >= 0;

  const metrics: InsightMetric[] = [
    {
      label: "Net balance",
      value: `${balancePositive ? "" : "-"}${formatMoney(Math.abs(model.current.balance))}`,
      detail: `${formatMoney(model.current.income)} in · ${formatMoney(model.current.expense)} out`,
      deltaLabel: balanceDelta.label,
      deltaTone: balanceDelta.tone,
      tone: balancePositive ? "good" : "danger",
      icon: balancePositive ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : <ArrowDownRight className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Spend pace",
      value: formatMoney(dailySpend),
      detail: "Average expense per day",
      deltaLabel: spendPaceDelta.label,
      deltaTone: spendPaceDelta.tone,
      tone: dailySpend > priorDailySpend && priorDailySpend > 0 ? "warn" : "neutral",
      icon: <ReceiptText className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Stock risk",
      value: `${Math.round(riskRate)}%`,
      detail: `${model.health.attention} of ${model.health.totalItems} items need attention`,
      deltaLabel: model.health.attention > 0 ? "Review watchlist" : "No immediate risk",
      deltaTone: model.health.attention > 0 ? "down" : "flat",
      tone: model.health.expired > 0 ? "danger" : model.health.soon > 0 ? "warn" : "good",
      icon: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Units tracked",
      value: model.health.totalUnits.toLocaleString(),
      detail: `${model.health.totalItems} inventory records`,
      deltaLabel: "Live inventory total",
      deltaTone: "flat",
      tone: "neutral",
      icon: <Boxes className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className="mt-2 space-y-5">
      <section className="hs-surface overflow-hidden p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="hs-eyebrow-tight">Insights</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-normal hs-text-primary">Household intelligence</h1>
              <p className="mt-1 text-sm font-semibold hs-text-muted">
                {compactDate(model.window.from)} to {compactDate(model.window.to)} · {model.current.count} transaction{model.current.count === 1 ? "" : "s"}
              </p>
            </div>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div role="radiogroup" aria-label="Insights period" className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={period === option.value}
                title={option.longLabel}
                onClick={() => setPeriod(option.value)}
                className={`flex h-10 items-center justify-center rounded-xl text-sm font-extrabold transition ${
                  period === option.value
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <InsightsKpiGrid metrics={metrics} />

      <CashFlowTrendChart
        buckets={model.buckets}
        hasData={model.current.transactions.length > 0}
      />

      <CategoryExpenseChart
        slices={model.expenseSlices}
        total={model.current.expense}
      />

      <InventoryHealthPanel health={model.health} watchlist={model.watchlist} />

      <section className="hs-surface p-5" aria-label="Insight decision notes">
        <h2 className="hs-section-title">
          <CalendarRange className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
          Decision notes
        </h2>
        <div className="mt-4 space-y-2">
          <InsightNote
            label="Cash"
            copy={balancePositive ? "Selected period cash flow is positive. Keep expense categories within this pace." : "Expenses are ahead of income for this period. Start with the largest category above."}
          />
          <InsightNote
            label="Inventory"
            copy={model.health.attention > 0 ? "Use, replace, or remove watchlist items before adding more stock." : "No urgent expiry issues. Keep adding dates so the risk score stays useful."}
          />
        </div>
      </section>
    </div>
  );
};

const InsightNote = ({ label, copy }: { label: string; copy: string }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] hs-text-muted">{label}</p>
    <p className="mt-1 text-sm font-semibold hs-text-secondary">{copy}</p>
  </div>
);
