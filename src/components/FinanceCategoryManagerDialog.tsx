/**
 * Manager for finance categories. Same UX patterns as the inventory category
 * manager, but with an income/expense toggle and a kind-aware emoji palette.
 */
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Check, MinusCircle, Pencil, Plus, PlusCircle, Sparkles, Trash2, Wallet, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type {
  FinanceCategory,
  FinanceCategoryDraft,
  TransactionKind,
} from "@/types/finance";

interface FinanceCategoryManagerDialogProps {
  open: boolean;
  categories: FinanceCategory[];
  error: string | null;
  onClose: () => void;
  onCreate: (draft: FinanceCategoryDraft) => Promise<FinanceCategory>;
  onUpdate: (id: string, draft: FinanceCategoryDraft) => Promise<FinanceCategory>;
  onDelete: (id: string) => Promise<void>;
}

const EMOJI_INCOME = ["💼", "🎁", "💸", "💰", "🏦", "📈", "🪙", "🤝", "↩️", "🧾"];
const EMOJI_EXPENSE = ["🛒", "🏠", "⚡", "🚗", "🍽️", "🎬", "💊", "🛍️", "📦", "✈️", "📱", "🐶", "🪥", "👕", "🎓"];

const fieldShell =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

const emptyDraft: FinanceCategoryDraft = { name: "", emoji: "💸", kind: "expense" };

export const FinanceCategoryManagerDialog = ({
  open,
  categories,
  error,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: FinanceCategoryManagerDialogProps) => {
  const [draft, setDraft] = useState<FinanceCategoryDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<FinanceCategory | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setDraft(emptyDraft);
    setEditingId(undefined);
    setLocalError("");

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

  const isValid = useMemo(() => draft.name.trim().length > 0, [draft.name]);
  const editingCategory = useMemo(
    () => categories.find((entry) => entry.id === editingId),
    [categories, editingId],
  );

  const incomeCategories = categories.filter((entry) => entry.kind === "income");
  const expenseCategories = categories.filter((entry) => entry.kind === "expense");

  if (!open) return null;

  const startEdit = (category: FinanceCategory) => {
    setEditingId(category.id);
    setDraft({ name: category.name, emoji: category.emoji, kind: category.kind });
    setLocalError("");
  };

  const resetDraft = () => {
    setEditingId(undefined);
    setDraft(emptyDraft);
    setLocalError("");
  };

  const switchKind = (kind: TransactionKind) => {
    setDraft((current) => ({
      ...current,
      kind,
      emoji: current.emoji === "💸" || current.emoji === "💰"
        ? kind === "income"
          ? "💰"
          : "💸"
        : current.emoji,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setLocalError("Name is required.");
      return;
    }
    setIsSubmitting(true);
    setLocalError("");
    try {
      if (editingId) {
        await onUpdate(editingId, draft);
      } else {
        await onCreate(draft);
      }
      resetDraft();
    } catch (submitError) {
      setLocalError(submitError instanceof Error ? submitError.message : "Unable to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(pendingDelete.id);
      if (editingId === pendingDelete.id) resetDraft();
      setPendingDelete(undefined);
    } catch (deleteError) {
      setLocalError(deleteError instanceof Error ? deleteError.message : "Unable to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  const palette = draft.kind === "income" ? EMOJI_INCOME : EMOJI_EXPENSE;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Manage finance categories"
        className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
      >
        <button
          type="button"
          aria-label="Close manager"
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative flex max-h-[92svh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-soft animate-pop-in sm:rounded-3xl dark:border-slate-800 dark:bg-slate-900">
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-soft">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Finance categories</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organize income and expense buckets
                </p>
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
            <form
              onSubmit={handleSubmit}
              className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {editingId ? `Editing ${editingCategory?.name ?? ""}` : "New category"}
                </p>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetDraft}
                    className="text-xs font-bold text-teal-600 hover:underline dark:text-teal-300"
                  >
                    Add new instead
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <button
                  type="button"
                  aria-pressed={draft.kind === "expense"}
                  onClick={() => switchKind("expense")}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                    draft.kind === "expense"
                      ? "bg-rose-500 text-white shadow-sm"
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
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                    draft.kind === "income"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <PlusCircle className="h-4 w-4" aria-hidden="true" />
                  Income
                </button>
              </div>

              <div className="grid grid-cols-[72px_1fr] gap-3">
                <label className="space-y-1.5">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Emoji
                  </span>
                  <input
                    type="text"
                    value={draft.emoji}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setDraft((current) => ({ ...current, emoji: event.target.value.slice(0, 4) }))
                    }
                    className={`${fieldShell} h-12 text-center text-2xl`}
                    aria-label="Category emoji"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Name
                  </span>
                  <input
                    type="text"
                    value={draft.name}
                    placeholder={draft.kind === "income" ? "e.g. Freelance" : "e.g. Coffee"}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    className={`${fieldShell} h-12`}
                    required
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Quick pick
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {palette.map((emoji) => {
                    const active = draft.emoji === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setDraft((current) => ({ ...current, emoji }))}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl transition active:scale-95 ${
                          active
                            ? "bg-teal-500 text-white shadow-soft"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {localError || error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                  {localError || error}
                </p>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-5 text-sm font-bold text-white shadow-soft transition active:scale-[0.98] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingId ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Save changes
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add category
                    </>
                  )}
                </button>
              </div>
            </form>

            <CategoryGroup
              title="Income"
              tone="emerald"
              categories={incomeCategories}
              editingId={editingId}
              onStartEdit={startEdit}
              onRequestDelete={(category) => setPendingDelete(category)}
            />
            <CategoryGroup
              title="Expense"
              tone="rose"
              categories={expenseCategories}
              editingId={editingId}
              onStartEdit={startEdit}
              onRequestDelete={(category) => setPendingDelete(category)}
            />
          </div>

          <footer className="safe-pb flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 pt-3 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full px-5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Done
            </button>
          </footer>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        tone="danger"
        title="Delete category?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed. Existing transactions keep the label.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep it"
        busy={isDeleting}
        onCancel={() => !isDeleting && setPendingDelete(undefined)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
};

const CategoryGroup = ({
  title,
  tone,
  categories,
  editingId,
  onStartEdit,
  onRequestDelete,
}: {
  title: string;
  tone: "emerald" | "rose";
  categories: FinanceCategory[];
  editingId?: string;
  onStartEdit: (category: FinanceCategory) => void;
  onRequestDelete: (category: FinanceCategory) => void;
}) => {
  const dot = tone === "emerald" ? "bg-emerald-500" : "bg-rose-500";

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
        {title} ({categories.length})
      </p>
      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
          No {title.toLowerCase()} categories yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {categories.map((category) => {
            const isEditing = editingId === category.id;
            return (
              <li
                key={category.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isEditing ? "bg-teal-50/50 dark:bg-teal-500/5" : ""
                }`}
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
                  {category.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{category.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartEdit(category)}
                  aria-label={`Edit ${category.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onRequestDelete(category)}
                  aria-label={`Delete ${category.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
