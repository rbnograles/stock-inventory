/**
 * Displays inventory risk as a compact operational panel. The donut shows the
 * current health split while the watchlist turns expiry analytics into the next
 * practical household actions.
 */
import { AlertTriangle, CheckCircle2, CircleHelp, TimerReset } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatExpiryMonthDistance } from "@/lib/expiry";
import type { InventoryHealthSummary, InventoryWatchItem } from "@/lib/insights";

const HEALTH_ROWS = [
  { key: "healthy", label: "Fresh", color: "#10b981", icon: CheckCircle2 },
  { key: "soon", label: "Use soon", color: "#f59e0b", icon: TimerReset },
  { key: "expired", label: "Expired", color: "#f43f5e", icon: AlertTriangle },
  { key: "unknown", label: "No date", color: "#64748b", icon: CircleHelp },
] as const;

const watchCopy = (item: InventoryWatchItem) => {
  if (item.daysUntilExpiry < 0) return `Expired ${formatExpiryMonthDistance(item.daysUntilExpiry)} ago`;
  if (item.daysUntilExpiry === 0) return "Expires today";
  return `Use in ${formatExpiryMonthDistance(item.daysUntilExpiry)}`;
};

export const InventoryHealthPanel = ({
  health,
  watchlist,
}: {
  health: InventoryHealthSummary;
  watchlist: InventoryWatchItem[];
}) => {
  const chartData = HEALTH_ROWS.map((row) => ({
    ...row,
    value: health[row.key],
  })).filter((row) => row.value > 0);

  return (
    <section className="hs-surface p-5" aria-label="Inventory freshness and watchlist">
      <header>
        <h2 className="hs-section-title">
          <TimerReset className="h-4 w-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
          Inventory risk
        </h2>
        <p className="mt-1 text-xs font-semibold hs-text-muted">Freshness split and the items most likely to need action.</p>
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="h-52">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={3}>
                  {chartData.map((row) => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} item${Number(value) === 1 ? "" : "s"}`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold hs-text-muted dark:border-slate-700 dark:bg-slate-950/40">
              No items yet
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {HEALTH_ROWS.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.key} className="hs-tile-muted px-3 py-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hs-text-muted">
                    <Icon className="h-3.5 w-3.5" style={{ color: row.color }} aria-hidden="true" />
                    {row.label}
                  </p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums hs-text-primary">{health[row.key]}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="hs-eyebrow-tight">Watchlist</p>
            {watchlist.length > 0 ? (
              <ul className="space-y-2">
                {watchlist.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold hs-text-primary">{item.name}</p>
                      <p className="truncate text-xs font-semibold hs-text-muted">
                        {item.category} · {item.quantity} {item.unit}
                      </p>
                    </div>
                    <span className={item.status === "expired" ? "text-xs font-extrabold text-rose-600 dark:text-rose-300" : "text-xs font-extrabold text-amber-600 dark:text-amber-300"}>
                      {watchCopy(item)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold hs-text-muted dark:bg-slate-800/60">
                No expiring items in the current watch window.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
