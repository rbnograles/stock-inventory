/**
 * Handles create and edit flows in one mobile-first sheet-style dialog. The
 * form keeps all fields local until submit, which makes edits reversible and
 * lets scanned barcode/photo data flow into the draft without touching
 * IndexedDB early.
 */
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Barcode, Calendar, ChevronDown, MapPin, Package, Pencil, Sparkles, Tag, X } from "lucide-react";
import { CameraField } from "@/components/CameraField";
import { EMPTY_DRAFT, INVENTORY_CATEGORIES, type InventoryDraft, type InventoryItem } from "@/types/inventory";

interface ItemFormDialogProps {
  open: boolean;
  barcode: string;
  item?: InventoryItem;
  onClose: () => void;
  onClearBarcode: () => void;
  onSubmit: (draft: InventoryDraft, item?: InventoryItem) => Promise<void>;
}

const itemToDraft = (item?: InventoryItem): InventoryDraft => {
  if (!item) {
    return EMPTY_DRAFT;
  }

  return {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    barcode: item.barcode ?? "",
    location: item.location ?? "",
    expiryDate: item.expiryDate ?? "",
    notes: item.notes ?? "",
    photoDataUrl: item.photoDataUrl ?? "",
  };
};

const fieldLabel =
  "block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400";
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
    <label htmlFor={htmlFor} className={fieldLabel}>
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
    {children}
    {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
  </div>
);

const InputWithIcon = ({
  id,
  icon,
  ...props
}: {
  id: string;
  icon: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
      {icon}
    </span>
    <input id={id} {...props} className={`${fieldShell} h-12 pl-10`} />
  </div>
);

export const ItemFormDialog = ({
  open,
  barcode,
  item,
  onClose,
  onClearBarcode,
  onSubmit,
}: ItemFormDialogProps) => {
  const [draft, setDraft] = useState<InventoryDraft>(EMPTY_DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const editing = Boolean(item);
  const title = editing ? "Edit item" : "Add item";
  const subtitle = editing ? "Update details, expiry, or quantity" : "Track a new household product";

  useEffect(() => {
    if (open) {
      setDraft({ ...itemToDraft(item), barcode: item?.barcode ?? barcode });
      setError("");
    }
  }, [barcode, item, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, open]);

  const isValid = useMemo(() => draft.name.trim().length > 0 && draft.quantity >= 0, [draft]);

  const updateDraft = <Key extends keyof InventoryDraft>(key: Key, value: InventoryDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) {
      setError("Item name and quantity are required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onSubmit(draft, item);
      onClearBarcode();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save item.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) {
    return null;
  }

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
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-soft">
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
          <Field label="Product name" htmlFor="field-name" required>
            <InputWithIcon
              id="field-name"
              icon={<Tag className="h-4 w-4" />}
              type="text"
              placeholder="e.g. Oat milk"
              value={draft.name}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("name", event.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-[1fr_110px] gap-3">
            <Field label="Quantity" htmlFor="field-quantity" required>
              <input
                id="field-quantity"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={draft.quantity}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateDraft("quantity", Number(event.target.value))
                }
                className={`${fieldShell} h-12`}
                required
              />
            </Field>
            <Field label="Unit" htmlFor="field-unit">
              <input
                id="field-unit"
                type="text"
                placeholder="pcs"
                value={draft.unit}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("unit", event.target.value)}
                className={`${fieldShell} h-12 text-center`}
              />
            </Field>
          </div>

          <Field label="Category" htmlFor="field-category">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Package className="h-4 w-4" />
              </span>
              <select
                id="field-category"
                value={draft.category}
                onChange={(event) => updateDraft("category", event.target.value as InventoryDraft["category"])}
                className={`${fieldShell} h-12 appearance-none pl-10 pr-10`}
              >
                {INVENTORY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Barcode" htmlFor="field-barcode">
              <InputWithIcon
                id="field-barcode"
                icon={<Barcode className="h-4 w-4" />}
                type="text"
                placeholder="Scan or type"
                value={draft.barcode}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("barcode", event.target.value)}
              />
            </Field>
            <Field label="Location" htmlFor="field-location">
              <InputWithIcon
                id="field-location"
                icon={<MapPin className="h-4 w-4" />}
                type="text"
                placeholder="e.g. Kitchen shelf"
                value={draft.location}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("location", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Expiry date" htmlFor="field-expiry" hint="Leave blank if the product has no expiry">
            <InputWithIcon
              id="field-expiry"
              icon={<Calendar className="h-4 w-4" />}
              type="date"
              value={draft.expiryDate}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("expiryDate", event.target.value)}
            />
          </Field>

          <Field label="Notes" htmlFor="field-notes">
            <textarea
              id="field-notes"
              rows={3}
              placeholder="Brand, recipe ideas, allergens…"
              value={draft.notes}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateDraft("notes", event.target.value)}
              className={`${fieldShell} resize-none py-3`}
            />
          </Field>

          <CameraField value={draft.photoDataUrl} onChange={(value) => updateDraft("photoDataUrl", value)} />

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
            className="h-11 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 text-sm font-bold text-white shadow-soft transition active:scale-[0.98] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isSaving ? "Saving…" : editing ? "Save changes" : "Add item"}
          </button>
        </footer>
      </form>
    </div>
  );
};
