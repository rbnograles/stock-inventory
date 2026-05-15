/**
 * Renders the dashboard empty state for both normal filters and attention-only
 * mode. Extracting it keeps `App` focused on orchestration while preserving the
 * reset affordance that helps mobile users recover from narrow filters quickly.
 */
import { Inbox } from "lucide-react";

interface EmptyInventoryStateProps {
  attentionOnly: boolean;
  hasFilters: boolean;
  onReset: () => void;
}

export const EmptyInventoryState = ({
  attentionOnly,
  hasFilters,
  onReset,
}: EmptyInventoryStateProps) => (
  <section className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center shadow-card backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/40">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-soft">
      <Inbox className="h-7 w-7" aria-hidden="true" />
    </span>
    <div className="space-y-1">
      <p className="text-base font-extrabold text-slate-900 dark:text-white">
        {attentionOnly ? "Nothing needs attention" : "No products found"}
      </p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {attentionOnly ? "You're all caught up - nice work." : "Try a different search, or tap Add item below."}
      </p>
    </div>
    {hasFilters ? (
      <button
        type="button"
        onClick={onReset}
        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-card dark:bg-white dark:text-slate-900"
      >
        Reset filters
      </button>
    ) : null}
  </section>
);
