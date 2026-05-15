/**
 * Shows active operational expense funds. Each fund is an envelope carved out
 * from income for a short period, and assigned transactions draw down the
 * remaining amount without double-counting cash-flow expense.
 */
import { PlusCircle, WalletCards } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { OperationalFundSummary } from "@/lib/financeOperational";

interface OperationalFundsPanelProps {
  funds: OperationalFundSummary[];
  onAddSpend: (fundId: string) => void;
}

const formatShortDate = (iso?: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "";

export const OperationalFundsPanel = ({ funds, onAddSpend }: OperationalFundsPanelProps) => {
  if (funds.length === 0) {
    return null;
  }

  return (
    <section className="hs-surface p-4" aria-label="Operational expense funds">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="hs-section-title">
            <WalletCards className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
            Operational expenses
          </h2>
          <p className="mt-1 text-xs font-semibold hs-text-muted">
            Two-week spending funds and their daily drawdowns.
          </p>
        </div>
      </header>

      <div className="mt-4 space-y-3">
        {funds.map(({ fund, spent, remaining, percentUsed, drawdowns }) => (
          <article key={fund.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold hs-text-primary">{fund.category}</p>
                <p className="text-[11px] font-semibold hs-text-muted">
                  {formatShortDate(fund.operationalPeriodStart)} - {formatShortDate(fund.operationalPeriodEnd)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold tabular-nums text-teal-700 dark:text-teal-300">
                  {formatMoney(remaining)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] hs-text-muted">left</p>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                style={{ width: `${percentUsed}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold hs-text-muted">
                {formatMoney(spent)} spent · {drawdowns.length} transaction{drawdowns.length === 1 ? "" : "s"}
              </p>
              <button type="button" onClick={() => onAddSpend(fund.id)} className="hs-btn-secondary h-9 px-3">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Add spend
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
