/**
 * Create / edit dialog for a finance transaction. Mirrors the inventory form
 * dialog patterns: stacked labels, rounded inputs, sticky footer, mobile sheet
 * presentation, and proper dark-mode contrast.
 */
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, Coins, MinusCircle, NotebookPen, Pencil, PlusCircle, Sparkles, X } from "lucide-react";
import {
  EMPTY_TRANSACTION_DRAFT,
  type FinanceCategory,
  type Transaction,
  type TransactionDraft,
  type TransactionKind,
} from "@/types/finance";

interface TransactionFormDialogProps {
  open: boolean;
  transaction?: Transaction;
  categories: FinanceCategory[];
  onClose: () => void;
  onManageCategories?: () => void;
  onSubmit: (draft: TransactionDraft, current?: Transaction) => Promise<void>;
}

const fieldShell =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

const Field = ({
  label,
  htmlFor,
  required,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  hint?: ReactNode;
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
    >
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
    {children}
    {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
  </div>
);

const transactionToDraft = (entry?: Transaction): TransactionDraft => {
  if (!entry) {
    return EMPTY_TRANSACTION_DRAFT;
  }
  return {
    kind: entry.kind,
    amount: entry.amount,
    category: entry.category,
    description: entry.description ?? "",
    occurredOn: entry.occurredOn,
  };
};

export const TransactionFormDialog = ({
  open,
  transaction,
  categories,
  onClose,
  onManageCategories,
  onSubmit,
}: TransactionFormDialogProps) => {
  const [draft, setDraft] = useState<TransactionDraft>(EMPTY_TRANSACTION_DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const editing = Boolean(transaction);
  const title = editing ? "Edit transaction" : "New transaction";
  const subtitle = editing ? "Update amount, category, or date" : "Log income or an expense";

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.kind === draft.kind),
    [categories, draft.kind],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const initial = transactionToDraft(transaction);
    const fallbackCategory = categories.find((entry) => entry.kind === initial.kind)?.name ?? "";
    setDraft({
      ...initial,
      category: initial.category || fallbackCategory,
    });
    setError("");
  }, [categories, open, transaction]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, open]);

  const isValid = useMemo(
    () => draft.amount > 0 && draft.category.trim().length > 0 && Boolean(draft.occurredOn),
    [draft],
  );

  const updateDraft = <Key extends keyof TransactionDraft>(key: Key, value: TransactionDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const switchKind = (kind: TransactionKind) => {
    setDraft((current) => {
      const fallback = categories.find((entry) => entry.kind === kind);
      return {
        ...current,
        kind,
        category:
          categories.some((entry) => entry.kind === kind && entry.name === current.category)
            ? current.category
            : fallback?.name ?? "",
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setError("Amount, category and date are required.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await onSubmit(draft, transaction);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save transaction.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  const accent =
    draft.kind === "income"
      ? "from-emerald-500 to-teal-500"
      : "from-rose-500 to-pink-500";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[92svh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-soft animate-pop-in sm:rounded-3xl dark:border-slate-800 dark:bg-slate-900"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-soft`}>
              {editing ? <Pencil className="h-5 w-5" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div className="leading-tight">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/60">
            <button
              type="button"
              aria-pressed={draft.kind === "expense"}
              onClick={() => switchKind("expense")}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                draft.kind === "expense"
                  ? "bg-white text-rose-700 shadow-sm dark:bg-slate-900 dark:text-rose-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <MinusCircle className="h-4 w-4" aria-hidden="true" />
              Expense
            </button>
            <button
              type="button"
              aria-pressed={draft.kind === "income"}
              onClick={() => switchKind("income")}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                draft.kind === "income"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Income
            </button>
          </div>

          <Field label="Amount" htmlFor="finance-amount" required>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Coins className="h-4 w-4" />
              </span>
              <input
                id="finance-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={draft.amount}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateDraft("amount", Number(event.target.value))
                }
                onFocus={(event) => event.target.select()}
                className={`${fieldShell} h-14 pl-10 text-2xl font-extrabold`}
                required
              />
            </div>
          </Field>

          <Field
            label="Category"
            htmlFor="finance-category"
            required
            hint={
              onManageCategories ? (
                <button
                  type="button"
                  onClick={onManageCategories}
                  className="font-bold text-teal-600 hover:underline dark:text-teal-300"
                >
                  Manage finance categories
                </button>
              ) : undefined
            }
          >
            <div className="relative">
              <select
                id="finance-category"
                value={draft.category}
                onChange={(event) => updateDraft("category", event.target.value)}
                className={`${fieldShell} h-12 appearance-none pr-10`}
                required
              >
                {filteredCategories.length === 0 ? (
                  <option value="">No {draft.kind} categories yet</option>
                ) : null}
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.emoji} {category.name}
                  </option>
                ))}
                {draft.category &&
                !filteredCategories.some((category) => category.name === draft.category) ? (
                  <option value={draft.category}>{draft.category} (legacy)</option>
                ) : null}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
            </div>
          </Field>

          <Field label="Date" htmlFor="finance-date" required>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                id="finance-date"
                type="date"
                value={draft.occurredOn}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateDraft("occurredOn", event.target.value)
                }
                className={`${fieldShell} h-12 pl-10`}
                required
              />
            </div>
          </Field>

          <Field label="Note" htmlFor="finance-note">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-3 text-slate-400 dark:text-slate-500">
                <NotebookPen className="h-4 w-4" />
              </span>
              <textarea
                id="finance-note"
                rows={2}
                value={draft.description}
                placeholder="e.g. SM Supermarket weekly run"
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  updateDraft("description", event.target.value)
                }
                className={`${fieldShell} resize-none py-3 pl-10`}
              />
            </div>
          </Field>

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="safe-pb flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 pt-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-11 rounded-full px-5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className={`h-11 rounded-full bg-gradient-to-r ${accent} px-6 text-sm font-bold text-white shadow-soft transition active:scale-[0.98] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none`}
          >
            {isSaving ? "Saving…" : editing ? "Save changes" : "Add transaction"}
          </button>
        </footer>
      </form>
    </div>
  );
};
