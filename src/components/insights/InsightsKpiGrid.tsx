/**
 * Renders the executive KPI row for Insights. The parent computes analytics so
 * this component can focus on consistent responsive tiles, accessible trend
 * labels, and dark-mode-safe visual hierarchy.
 */
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export interface InsightMetric {
  label: string;
  value: string;
  detail: string;
  deltaLabel: string;
  icon: ReactNode;
  tone: "neutral" | "good" | "warn" | "danger";
  deltaTone: "up" | "down" | "flat";
}

interface InsightsKpiGridProps {
  metrics: InsightMetric[];
}

const toneClass: Record<InsightMetric["tone"], string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const deltaClass: Record<InsightMetric["deltaTone"], string> = {
  up: "text-emerald-600 dark:text-emerald-300",
  down: "text-rose-600 dark:text-rose-300",
  flat: "hs-text-muted",
};

const DeltaIcon = ({ tone }: { tone: InsightMetric["deltaTone"] }) => {
  if (tone === "up") return <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />;
  if (tone === "down") return <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Minus className="h-3.5 w-3.5" aria-hidden="true" />;
};

export const InsightsKpiGrid = ({ metrics }: InsightsKpiGridProps) => (
  <section className="grid grid-cols-2 gap-3" aria-label="Selected period KPIs">
    {metrics.map((metric) => (
      <article key={metric.label} className="hs-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="hs-eyebrow-tight">{metric.label}</p>
            <p className="mt-2 truncate text-2xl font-extrabold tabular-nums hs-text-primary">
              {metric.value}
            </p>
          </div>
          <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-2xl ${toneClass[metric.tone]}`}>
            {metric.icon}
          </span>
        </div>
        <p className="mt-2 min-h-5 truncate text-xs font-semibold hs-text-muted">{metric.detail}</p>
        <p className={`mt-3 flex items-center gap-1 text-xs font-extrabold ${deltaClass[metric.deltaTone]}`}>
          <DeltaIcon tone={metric.deltaTone} />
          {metric.deltaLabel}
        </p>
      </article>
    ))}
  </section>
);
