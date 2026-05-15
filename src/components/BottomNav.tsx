/**
 * Persistent thumb-zone action bar. Two real actions — Scan (secondary) and
 * Add (primary) — so the most-used kitchen workflows stay one tap away. Safe
 * area padding keeps the controls clear of the iOS home indicator.
 */
import { Plus, ScanLine } from "lucide-react";

interface BottomNavProps {
  onAdd: () => void;
  onScan: () => void;
}

export const BottomNav = ({ onAdd, onScan }: BottomNavProps) => (
  <nav
    aria-label="Primary actions"
    className="safe-pb fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-4 pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"
  >
    <div className="mx-auto grid max-w-xl grid-cols-[1fr_2fr] gap-3">
      <button
        type="button"
        onClick={onScan}
        className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-card transition active:scale-[0.98] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
      >
        <ScanLine className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />
        Scan
      </button>
      <button
        type="button"
        onClick={onAdd}
        className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-soft transition active:scale-[0.98] hover:brightness-110"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Add item
      </button>
    </div>
  </nav>
);
