/**
 * Manager for finance categories. Same UX patterns as the inventory category
 * manager, but with an income/expense toggle and a kind-aware emoji palette.
 */
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, MinusCircle, Pencil, Plus, PlusCircle, Sparkles, Trash2, Wallet, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { normalizeEmojiInput } from "@/lib/emoji";
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

const EMOJI_INCOME = [
  "💼", "🎁", "💸", "💰", "🏦", "📈", "🪙", "🤝", "↩️", "🧾",
  "💳", "🏧", "🧑‍💻", "🛠️", "🏪", "🏡", "🚚", "🎨", "📚", "🏆",
  "⭐", "🎯", "📦", "🪴", "💎", "🧧",
];
const EMOJI_EXPENSE = [
  "🛒", "🏠", "⚡", "🚗", "⛽", "🍽️", "☕", "🎬", "💊", "🛍️",
  "📦", "✈️", "🏨", "📱", "💻", "🐶", "🐱", "🪥", "👕", "🎓",
  "🏋️", "🎮", "🧾", "💳", "🚌", "🚕", "🍼", "🎁", "🧰", "🧹",
];

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
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
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
      <div role="dialog" aria-modal="true" aria-label="Manage finance categories" className="hs-modal-overlay">
        <button type="button" aria-label="Close manager" className="hs-modal-backdrop" onClick={onClose} />

        <div className="hs-modal-shell">
          <header className="hs-modal-header">
            <div className="flex items-center gap-3">
              <span className="hs-icon-badge bg-gradient-to-br from-teal-500 to-emerald-500">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <h2 className="text-lg font-extrabold hs-text-primary">Finance categories</h2>
                <p className="text-xs hs-text-muted">Organize income and expense buckets</p>
              </div>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="hs-btn-icon">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="hs-modal-body">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className={`space-y-3 rounded-3xl border p-4 transition ${
                editingId
                  ? "border-teal-300 bg-teal-50/70 ring-4 ring-teal-500/10 dark:border-teal-700 dark:bg-teal-500/10"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 hs-eyebrow">
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
                  <span className="hs-field-label">
                    Emoji
                  </span>
                  <input
                    type="text"
                    value={draft.emoji}
                    placeholder="🙂"
                    autoComplete="off"
                    inputMode="text"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setDraft((current) => ({ ...current, emoji: normalizeEmojiInput(event.target.value) }))
                    }
                    className={`hs-input h-12 text-center text-2xl`}
                    aria-label="Category emoji"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="hs-field-label">
                    Name
                  </span>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={draft.name}
                    placeholder={draft.kind === "income" ? "e.g. Freelance" : "e.g. Coffee"}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    className={`hs-input h-12`}
                    required
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 hs-eyebrow">
                  Quick pick
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {palette.map((emoji) => {
                    const active = draft.emoji === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        aria-label={`Use ${emoji} emoji`}
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
                  className="hs-btn h-11 px-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-soft hover:brightness-110"
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

          <footer className="hs-modal-footer">
            <button type="button" onClick={onClose} className="hs-btn-ghost h-11 px-5">
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
      <p className="flex items-center gap-2 px-1 hs-eyebrow">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
        {title} ({categories.length})
      </p>
      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
          No {title.toLowerCase()} categories yet.
        </p>
      ) : (
        <ul className="hs-divider hs-tile overflow-hidden">
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
                  className="hs-btn-icon"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onRequestDelete(category)}
                  aria-label={`Delete ${category.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
