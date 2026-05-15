/**
 * Single transaction row. Tap opens edit; the trailing menu hosts the delete
 * action behind a confirm dialog at the dashboard level.
 */
import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2, WalletCards } from "lucide-react";
import { isOperationalDrawdown } from "@/lib/financeOperational";
import { formatMoney } from "@/lib/money";
import type { FinanceCategory, Transaction } from "@/types/finance";

interface TransactionRowProps {
  transaction: Transaction;
  categories: FinanceCategory[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

export const TransactionRow = ({ transaction, categories, onEdit, onDelete }: TransactionRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handler = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [menuOpen]);

  const category = categories.find(
    (entry) => entry.name === transaction.category && entry.kind === transaction.kind,
  );
  const emoji = category?.emoji ?? (transaction.kind === "income" ? "💰" : "💸");

  const isIncome = transaction.kind === "income";
  const operationalDrawdown = isOperationalDrawdown(transaction);
  const amountClass = isIncome
    ? "text-emerald-600 dark:text-emerald-300"
    : operationalDrawdown
      ? "text-amber-600 dark:text-amber-300"
      : "text-rose-600 dark:text-rose-300";
  const avatarBg = isIncome
    ? "bg-emerald-100 dark:bg-emerald-500/15"
    : operationalDrawdown || transaction.isOperationalFund
      ? "bg-amber-100 dark:bg-amber-500/15"
      : "bg-rose-100 dark:bg-rose-500/15";

  return (
    <article className={`flex items-center gap-3 px-3 py-2.5 ${menuOpen ? "relative z-20" : ""}`}>
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition active:scale-[0.99]"
      >
        <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl text-xl ${avatarBg}`}>
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900 dark:text-white">
            {transaction.category}
          </h3>
          <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {formatDate(transaction.occurredOn)}
            {transaction.description ? ` · ${transaction.description}` : ""}
          </p>
          {transaction.isOperationalFund || operationalDrawdown ? (
            <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <WalletCards className="h-3 w-3" aria-hidden="true" />
              {transaction.isOperationalFund ? "Operational fund" : "Operational spend"}
            </p>
          ) : null}
        </div>
      </button>

      <div className="flex flex-none items-center gap-1">
        <span className={`text-sm font-extrabold tabular-nums ${amountClass}`}>
          {isIncome ? "+" : "−"}
          {formatMoney(transaction.amount)}
        </span>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label={`More actions for ${transaction.category}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-9 z-10 w-44 animate-pop-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(transaction);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(transaction);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};
