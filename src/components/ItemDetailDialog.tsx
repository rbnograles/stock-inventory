/**
 * Read-only preview sheet for a single inventory item. Opens when the user
 * taps a row, leads with the full product photo, and reuses the shared expiry
 * tone rules so detail views match the dashboard urgency colors.
 */
import { useEffect } from "react";
import { Calendar, MapPin, NotebookPen, Package, Pencil, Trash2, X } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { getExpiryLabelParts, getExpiryStatus } from "@/lib/expiry";
import { emojiForCategory, toneForCategory } from "@/lib/categoryVisuals";
import type { Category } from "@/types/category";
import type { InventoryItem } from "@/types/inventory";

interface ItemDetailDialogProps {
  open: boolean;
  item?: InventoryItem;
  categories: Category[];
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const MetaRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 hs-tile-muted px-3.5 py-3">
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="hs-eyebrow-tight">{label}</p>
      <p className="break-words text-sm font-semibold hs-text-primary">{value}</p>
    </div>
  </div>
);

export const ItemDetailDialog = ({ open, item, categories, onClose, onEdit, onDelete }: ItemDetailDialogProps) => {
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

  if (!open || !item) {
    return null;
  }

  const status = getExpiryStatus(item.expiryDate);
  const expiryLabel = getExpiryLabelParts(item);
  const tone = toneForCategory(item.category);
  const categoryEmoji = emojiForCategory(item.category, categories);

  return (
    <div role="dialog" aria-modal="true" aria-label={item.name} className="hs-modal-overlay">
      <button type="button" aria-label="Close preview" className="hs-modal-backdrop" onClick={onClose} />
      <div className="hs-modal-shell">
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${tone.heroGradient}`}>
          {item.photoDataUrl ? (
            <img
              src={item.photoDataUrl}
              alt={item.name}
              className="max-h-[55svh] w-full object-contain"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center">
              <span className="text-7xl font-black text-white/80 drop-shadow-md">
                {item.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur transition hover:bg-slate-950/80"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-white">
              <span aria-hidden="true">{categoryEmoji}</span>
              {item.category}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold leading-tight hs-text-primary">{item.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={status} />
              <span className="text-sm font-semibold hs-text-secondary">
                {expiryLabel.prefix}
                {expiryLabel.distance ? <span className={expiryLabel.tone}>{expiryLabel.distance}</span> : null}
                {expiryLabel.suffix}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <MetaRow
              icon={<Package className="h-4 w-4" aria-hidden="true" />}
              label="Quantity"
              value={`${item.quantity} ${item.unit}`}
            />
            <MetaRow
              icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
              label="Expiry"
              value={item.expiryDate ? new Date(`${item.expiryDate}T00:00:00`).toLocaleDateString() : "Not set"}
            />
            {item.location ? (
              <MetaRow
                icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
                label="Location"
                value={item.location}
              />
            ) : null}
          </div>

          {item.notes ? (
            <div className="mt-3 hs-tile-muted px-4 py-3">
              <p className="flex items-center gap-2 hs-eyebrow-tight">
                <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
                Notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium hs-text-secondary">{item.notes}</p>
            </div>
          ) : null}
        </div>

        <footer className="hs-modal-footer">
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="hs-btn h-11 flex-1 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
          <button type="button" onClick={() => onEdit(item)} className="hs-btn-primary h-11 flex-[2]">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit item
          </button>
        </footer>
      </div>
    </div>
  );
};
