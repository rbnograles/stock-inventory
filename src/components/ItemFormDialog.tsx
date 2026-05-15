/**
 * Handles create and edit flows in one mobile-first sheet-style dialog. The
 * form keeps all fields local until submit, which makes edits reversible and
 * offers saved user-owned locations as dropdown choices. Submit
 * failures are surfaced through the app-level toast so they stay readable on
 * compact mobile PWA screens.
 */
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Calendar, ChevronDown, MapPin, Package, Pencil, Sparkles, Tag, X } from "lucide-react";
import { CameraField } from "@/components/CameraField";
import { EMPTY_DRAFT, type InventoryDraft, type InventoryItem } from "@/types/inventory";
import type { Category } from "@/types/category";
import type { InventoryLocation } from "@/types/location";

interface ItemFormDialogProps {
  open: boolean;
  item?: InventoryItem;
  categories: Category[];
  locations: InventoryLocation[];
  onClose: () => void;
  onManageCategories?: () => void;
  onError?: (message: string) => void;
  onSubmit: (draft: InventoryDraft, item?: InventoryItem) => Promise<void>;
}

const itemToDraft = (item?: InventoryItem): InventoryDraft => {
  if (!item) return EMPTY_DRAFT;
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

const InputWithIcon = ({
  id,
  icon,
  className = "",
  wrapperClassName = "",
  ...props
}: {
  id: string;
  icon: ReactNode;
  wrapperClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={`relative ${wrapperClassName}`}>
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
      {icon}
    </span>
    <input id={id} {...props} className={`hs-input h-12 pl-10 ${className}`} />
  </div>
);

export const ItemFormDialog = ({
  open,
  item,
  categories,
  locations,
  onClose,
  onManageCategories,
  onError,
  onSubmit,
}: ItemFormDialogProps) => {
  const defaultCategory = categories[0]?.name ?? "Other";
  const [draft, setDraft] = useState<InventoryDraft>({ ...EMPTY_DRAFT, category: defaultCategory });
  const [isSaving, setIsSaving] = useState(false);
  const [locationIsCustom, setLocationIsCustom] = useState(false);
  const editing = Boolean(item);
  const title = editing ? "Edit item" : "Add item";
  const subtitle = editing ? "Update details, expiry, or quantity" : "Track a new household product";
  const knownLocationNames = useMemo(() => locations.map((location) => location.name), [locations]);
  const locationSelectValue = locationIsCustom || (locations.length === 0 && draft.location) ? "__new__" : draft.location;

  useEffect(() => {
    if (open) {
      const initial = itemToDraft(item);
      setDraft({
        ...initial,
        category: initial.category || defaultCategory,
        barcode: item?.barcode ?? "",
      });
      setLocationIsCustom(Boolean(initial.location));
    }
  }, [defaultCategory, item, open]);

  useEffect(() => {
    if (locationIsCustom && draft.location && knownLocationNames.includes(draft.location)) {
      setLocationIsCustom(false);
    }
  }, [draft.location, knownLocationNames, locationIsCustom]);

  useEffect(() => {
    if (!open) return undefined;
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

  const isValid = useMemo(() => draft.name.trim().length > 0 && draft.quantity >= 0, [draft]);

  const updateDraft = <Key extends keyof InventoryDraft>(key: Key, value: InventoryDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      onError?.("Item name and quantity are required.");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit(draft, item);
      onClose();
    } catch (submitError) {
      onError?.(submitError instanceof Error ? submitError.message : "Unable to save item.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="hs-modal-overlay">
      <button type="button" aria-label="Close dialog" className="hs-modal-backdrop" onClick={onClose} />
      <form onSubmit={handleSubmit} className="hs-modal-shell">
        <header className="hs-modal-header">
          <div className="flex items-center gap-3">
            <span className="hs-icon-badge bg-gradient-to-br from-teal-500 to-cyan-500">
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
                onFocus={(event) => event.target.select()}
                className="hs-input h-12"
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
                className="hs-input h-12 text-center"
              />
            </Field>
          </div>

          <Field
            label="Category"
            htmlFor="field-category"
            hint={
              onManageCategories ? (
                <button
                  type="button"
                  onClick={onManageCategories}
                  className="font-bold text-teal-600 hover:underline dark:text-teal-300"
                >
                  Manage categories
                </button>
              ) : undefined
            }
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Package className="h-4 w-4" />
              </span>
              <select
                id="field-category"
                value={draft.category}
                onChange={(event) => updateDraft("category", event.target.value)}
                className="hs-input h-12 appearance-none pl-10 pr-10"
              >
                {categories.length === 0 ? <option value="">No categories yet</option> : null}
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.emoji} {category.name}
                  </option>
                ))}
                {draft.category && !categories.some((category) => category.name === draft.category) ? (
                  <option value={draft.category}>{draft.category} (legacy)</option>
                ) : null}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
            </div>
          </Field>

          <Field label="Location" htmlFor="field-location">
            <div className="space-y-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <MapPin className="h-4 w-4" />
                </span>
                <select
                  id="field-location"
                  value={locationSelectValue}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLocationIsCustom(value === "__new__");
                    updateDraft("location", value === "__new__" ? "" : value);
                  }}
                  className="hs-input h-12 appearance-none pl-10 pr-10"
                >
                  <option value="">No location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                  <option value="__new__">Add new location</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
              </div>

              {locationIsCustom || locations.length === 0 ? (
                <InputWithIcon
                  id="field-location-new"
                  aria-label="New location"
                  icon={<MapPin className="h-4 w-4" />}
                  type="text"
                  placeholder="e.g. Kitchen shelf"
                  value={draft.location}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setLocationIsCustom(true);
                    updateDraft("location", event.target.value);
                  }}
                />
              ) : null}
            </div>
          </Field>

          <Field label="Expiry date" htmlFor="field-expiry" hint="Leave blank if the product has no expiry">
            <InputWithIcon
              id="field-expiry"
              icon={<Calendar className="h-4 w-4" />}
              type="date"
              value={draft.expiryDate}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateDraft("expiryDate", event.target.value)}
              className="hs-date-input"
              wrapperClassName="hs-date-input-wrap"
            />
          </Field>

          <Field label="Notes" htmlFor="field-notes">
            <textarea
              id="field-notes"
              rows={3}
              placeholder="Brand, recipe ideas, allergens…"
              value={draft.notes}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateDraft("notes", event.target.value)}
              className="hs-input resize-none py-3"
            />
          </Field>

          <CameraField value={draft.photoDataUrl} onChange={(value) => updateDraft("photoDataUrl", value)} />

        </div>

        <footer className="hs-modal-footer">
          <button type="button" onClick={onClose} disabled={isSaving} className="hs-btn-ghost h-11 px-5 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={!isValid || isSaving} className="hs-btn-primary h-11 px-6">
            {isSaving ? "Saving…" : editing ? "Save changes" : "Add item"}
          </button>
        </footer>
      </form>
    </div>
  );
};
