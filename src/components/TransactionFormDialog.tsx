/**
 * Create / edit dialog for a finance transaction. Mirrors the inventory form
 * dialog patterns: stacked labels, rounded inputs, sticky footer, mobile sheet
 * presentation, and proper dark-mode contrast.
 */
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, Coins, MinusCircle, NotebookPen, Pencil, PlusCircle, Sparkles, Wallet, X } from "lucide-react";
import { defaultOperationalPeriodEnd } from "@/lib/financeOperational";
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
  operationalFunds: Transaction[];
  initialOperationalFundId?: string;
  onClose: () => void;
  onManageCategories?: () => void;
  onSubmit: (draft: TransactionDraft, current?: Transaction) => Promise<void>;
}

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
    <label htmlFor={htmlFor} className="hs-field-label">
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
    {children}
    {hint ? <p className="text-xs hs-text-muted">{hint}</p> : null}
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
    isOperationalFund: entry.isOperationalFund,
    operationalFundId: entry.operationalFundId ?? "",
    operationalPeriodStart: entry.operationalPeriodStart ?? entry.occurredOn,
    operationalPeriodEnd:
      entry.operationalPeriodEnd ?? defaultOperationalPeriodEnd(entry.operationalPeriodStart ?? entry.occurredOn),
  };
};

export const TransactionFormDialog = ({
  open,
  transaction,
  categories,
  operationalFunds,
  initialOperationalFundId,
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
  const assignableOperationalFunds = useMemo(
    () => operationalFunds.filter((fund) => fund.id !== transaction?.id),
    [operationalFunds, transaction?.id],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const initial = transactionToDraft(transaction);
    const fallbackCategory = categories.find((entry) => entry.kind === initial.kind)?.name ?? "";
    const presetFund = !transaction && initialOperationalFundId
      ? operationalFunds.find((fund) => fund.id === initialOperationalFundId)
      : undefined;
    setDraft({
      ...initial,
      kind: presetFund ? "expense" : initial.kind,
      category: initial.category || fallbackCategory,
      operationalFundId: presetFund?.id ?? initial.operationalFundId,
      operationalPeriodStart: initial.operationalPeriodStart || initial.occurredOn,
      operationalPeriodEnd:
        initial.operationalPeriodEnd || defaultOperationalPeriodEnd(initial.operationalPeriodStart || initial.occurredOn),
    });
    setError("");
  }, [categories, initialOperationalFundId, open, operationalFunds, transaction]);

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

  const updateOccurredOn = (value: string) => {
    setDraft((current) => ({
      ...current,
      occurredOn: value,
      operationalPeriodStart: current.isOperationalFund ? value : current.operationalPeriodStart,
      operationalPeriodEnd: current.isOperationalFund
        ? defaultOperationalPeriodEnd(value)
        : current.operationalPeriodEnd,
    }));
  };

  const switchKind = (kind: TransactionKind) => {
    setDraft((current) => {
      const fallback = categories.find((entry) => entry.kind === kind);
      return {
        ...current,
        kind,
        isOperationalFund: false,
        operationalFundId: "",
        operationalPeriodStart: "",
        operationalPeriodEnd: "",
        category:
          categories.some((entry) => entry.kind === kind && entry.name === current.category)
            ? current.category
            : fallback?.name ?? "",
      };
    });
  };

  const toggleOperationalFund = (checked: boolean) => {
    setDraft((current) => {
      const start = current.operationalPeriodStart || current.occurredOn;
      return {
        ...current,
        isOperationalFund: checked,
        operationalFundId: "",
        operationalPeriodStart: checked ? start : "",
        operationalPeriodEnd: checked
          ? current.operationalPeriodEnd || defaultOperationalPeriodEnd(start)
          : "",
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
    <div role="dialog" aria-modal="true" aria-label={title} className="hs-modal-overlay">
      <button type="button" aria-label="Close dialog" className="hs-modal-backdrop" onClick={onClose} />

      <form onSubmit={handleSubmit} className="hs-modal-shell">
        <header className="hs-modal-header">
          <div className="flex items-center gap-3">
            <span className={`hs-icon-badge bg-gradient-to-br ${accent}`}>
              {editing ? <Pencil className="h-5 w-5" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div className="leading-tight">
              <h2 className="text-lg font-extrabold hs-text-primary">{title}</h2>
              <p className="text-xs hs-text-muted">{subtitle}</p>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="hs-btn-icon">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="hs-modal-body">
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
                placeholder="0.00"
                value={draft.amount === 0 ? "" : draft.amount}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const raw = event.target.value;
                  updateDraft("amount", raw === "" ? 0 : Number(raw));
                }}
                onFocus={(event) => event.target.select()}
                className={`hs-input h-14 pl-10 text-2xl font-extrabold`}
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
                className={`hs-input h-12 appearance-none pr-10`}
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
            <div className="hs-date-input-wrap relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                id="finance-date"
                type="date"
                value={draft.occurredOn}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateOccurredOn(event.target.value)}
                className="hs-input hs-date-input h-12 pl-10"
                required
              />
            </div>
          </Field>

          {draft.kind === "expense" ? (
            <section className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={draft.isOperationalFund}
                  onChange={(event) => toggleOperationalFund(event.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-extrabold hs-text-primary">
                    <Wallet className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
                    Mark as operational fund
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold hs-text-muted">
                    Use this when you set aside two weeks of spending money from income.
                  </span>
                </span>
              </label>

              {draft.isOperationalFund ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Starts" htmlFor="operational-start" required>
                    <input
                      id="operational-start"
                      type="date"
                      value={draft.operationalPeriodStart}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          operationalPeriodStart: event.target.value,
                          operationalPeriodEnd: defaultOperationalPeriodEnd(event.target.value),
                        }))
                      }
                      className="hs-input h-12 max-w-[13.5rem] pr-2 text-sm"
                    />
                  </Field>
                  <Field label="Ends" htmlFor="operational-end" required>
                    <input
                      id="operational-end"
                      type="date"
                      value={draft.operationalPeriodEnd}
                      onChange={(event) => updateDraft("operationalPeriodEnd", event.target.value)}
                      className="hs-input h-12 max-w-[13.5rem] pr-2 text-sm"
                    />
                  </Field>
                </div>
              ) : assignableOperationalFunds.length > 0 ? (
                <Field label="Spend from operational fund" htmlFor="operational-fund">
                  <div className="relative">
                    <select
                      id="operational-fund"
                      value={draft.operationalFundId}
                      onChange={(event) => updateDraft("operationalFundId", event.target.value)}
                      className="hs-input h-12 appearance-none pr-10"
                    >
                      <option value="">Do not assign</option>
                      {assignableOperationalFunds.map((fund) => (
                        <option key={fund.id} value={fund.id}>
                          {fund.category} · {fund.occurredOn}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      aria-hidden="true"
                    />
                  </div>
                </Field>
              ) : (
                <p className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold hs-text-muted dark:bg-slate-900">
                  Mark an expense as an operational fund first, then assign daily expenses to it.
                </p>
              )}
            </section>
          ) : null}

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
                className={`hs-input resize-none py-3 pl-10`}
              />
            </div>
          </Field>

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="hs-modal-footer">
          <button type="button" onClick={onClose} disabled={isSaving} className="hs-btn-ghost h-11 px-5 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className={`hs-btn h-11 px-6 bg-gradient-to-r ${accent} text-white shadow-soft hover:brightness-110 disabled:shadow-none`}
          >
            {isSaving ? "Saving…" : editing ? "Save changes" : "Add transaction"}
          </button>
        </footer>
      </form>
    </div>
  );
};
