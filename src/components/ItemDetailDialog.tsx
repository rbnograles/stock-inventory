/**
 * Read-only preview sheet for a single inventory item. Opens when the user
 * taps a row, leads with the full product photo, and provides quick edit /
 * delete shortcuts so the form dialog stays out of the way until needed.
 */
import { useEffect } from "react";
import { Barcode, Calendar, MapPin, NotebookPen, Package, Pencil, Tag, Trash2, X } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { getExpiryLabel, getExpiryStatus } from "@/lib/expiry";
import type { InventoryCategory, InventoryItem } from "@/types/inventory";

interface ItemDetailDialogProps {
  open: boolean;
  item?: InventoryItem;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const heroTone: Record<InventoryCategory, string> = {
  Pantry: "from-amber-300 via-orange-300 to-rose-300 dark:from-amber-500/30 dark:via-orange-500/20 dark:to-rose-500/20",
  Refrigerated: "from-sky-300 via-cyan-300 to-teal-300 dark:from-sky-500/30 dark:via-cyan-500/20 dark:to-teal-500/20",
  Frozen: "from-cyan-200 via-sky-300 to-indigo-300 dark:from-cyan-500/30 dark:via-sky-500/20 dark:to-indigo-500/20",
  Medicine: "from-rose-300 via-pink-300 to-fuchsia-300 dark:from-rose-500/30 dark:via-pink-500/20 dark:to-fuchsia-500/20",
  Cleaning: "from-emerald-300 via-teal-300 to-cyan-300 dark:from-emerald-500/30 dark:via-teal-500/20 dark:to-cyan-500/20",
  "Personal Care": "from-fuchsia-300 via-purple-300 to-indigo-300 dark:from-fuchsia-500/30 dark:via-purple-500/20 dark:to-indigo-500/20",
  Other: "from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-700 dark:to-slate-800",
};

const MetaRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/60">
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export const ItemDetailDialog = ({ open, item, onClose, onEdit, onDelete }: ItemDetailDialogProps) => {
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
  const expiryLabel = getExpiryLabel(item);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[92svh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-soft animate-pop-in sm:rounded-3xl dark:border-slate-800 dark:bg-slate-900">
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${heroTone[item.category]}`}>
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
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/50 text-white backdrop-blur transition hover:bg-slate-950/70"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-950/70 dark:text-white">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              {item.category}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900 dark:text-white">
              {item.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={status} />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {expiryLabel}
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
            {item.barcode ? (
              <MetaRow
                icon={<Barcode className="h-4 w-4" aria-hidden="true" />}
                label="Barcode"
                value={item.barcode}
              />
            ) : null}
          </div>

          {item.notes ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
                Notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.notes}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="safe-pb flex items-center gap-2 border-t border-slate-100 bg-white px-5 pt-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700 transition active:scale-[0.98] hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-soft transition active:scale-[0.98] hover:brightness-110"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit item
          </button>
        </footer>
      </div>
    </div>
  );
};
