/**
 * Houses the Recharts-backed analytics visuals for Insights. Keeping chart
 * setup isolated avoids bloating the dashboard shell and gives every graph a
 * focused empty state, accessible label, and mobile-stable height.
 */
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingDown } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { BucketRow, CategorySlice } from "@/lib/insights";

interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
}

interface MoneyTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayload[];
}

const MoneyTooltip = ({ active, label, payload }: MoneyTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-card dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 font-bold hs-text-primary">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <p key={entry.name} className="flex items-center justify-between gap-4 font-semibold hs-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              {entry.name}
            </span>
            <span className="tabular-nums">{formatMoney(Number(entry.value ?? 0))}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export const CashFlowTrendChart = ({
  buckets,
  hasData,
}: {
  buckets: BucketRow[];
  hasData: boolean;
}) => (
  <section className="hs-surface p-5" aria-label="Cash flow trend">
    <header className="flex items-start justify-between gap-3">
      <div>
        <h2 className="hs-section-title">
          <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-300" aria-hidden="true" />
          Cash-flow trend
        </h2>
        <p className="mt-1 text-xs font-semibold hs-text-muted">Income, expense, and net movement by period bucket.</p>
      </div>
    </header>

    <div className="mt-4 h-64 w-full">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={buckets} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
            <Tooltip content={<MoneyTooltip />} cursor={{ stroke: "#94a3b8", strokeWidth: 1 }} />
            <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeFill)" />
            <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#expenseFill)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChartState copy="Add income or expense entries to activate the trend chart." />
      )}
    </div>
  </section>
);

export const CategoryExpenseChart = ({
  slices,
  total,
}: {
  slices: CategorySlice[];
  total: number;
}) => (
  <section className="hs-surface p-5" aria-label="Expense category ranking">
    <header className="flex items-start justify-between gap-3">
      <div>
        <h2 className="hs-section-title">
          <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-300" aria-hidden="true" />
          Expense mix
        </h2>
        <p className="mt-1 text-xs font-semibold hs-text-muted">Ranked by share of selected-period spend.</p>
      </div>
      <span className="text-xs font-extrabold tabular-nums hs-text-primary">{formatMoney(total)}</span>
    </header>

    <div className="mt-4 h-64 w-full">
      {slices.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={slices.slice(0, 6)} layout="vertical" margin={{ left: 12, right: 20, top: 4, bottom: 4 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={88} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip content={<MoneyTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
            <Bar dataKey="amount" name="Spend" radius={[0, 10, 10, 0]}>
              {slices.slice(0, 6).map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChartState copy="No expenses in this period yet." />
      )}
    </div>
  </section>
);

const EmptyChartState = ({ copy }: { copy: string }) => (
  <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm font-semibold hs-text-muted dark:border-slate-700 dark:bg-slate-950/40">
    {copy}
  </div>
);
