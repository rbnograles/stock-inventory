/**
 * Single inventory row tuned for thumb use. The photo + text area opens the
 * preview, while quantity edits are staged locally and saved with one tap so
 * small stock changes do not force the whole dashboard to reload.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { QuantitySaveControl } from "@/components/QuantitySaveControl";
import { StatusPill } from "@/components/StatusPill";
import { getExpiryLabelParts, getExpiryStatus } from "@/lib/expiry";
import { emojiForCategory, toneForCategory } from "@/lib/categoryVisuals";
import type { Category } from "@/types/category";
import type { InventoryItem } from "@/types/inventory";

interface InventoryRowProps {
  item: InventoryItem;
  categories: Category[];
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onSaveQuantity: (item: InventoryItem, quantity: number) => Promise<void>;
}

export const InventoryRow = ({ item, categories, onView, onEdit, onDelete, onSaveQuantity }: InventoryRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointer = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [menuOpen]);

  const status = getExpiryStatus(item.expiryDate);
  const expiryLabel = getExpiryLabelParts(item);
  const initials = useMemo(() => item.name.slice(0, 2).toUpperCase(), [item.name]);
  const tone = toneForCategory(item.category);
  const categoryEmoji = emojiForCategory(item.category, categories);

  return (
    <article className={`flex items-center gap-3 px-3 py-2.5 ${menuOpen ? "relative z-20" : ""}`}>
      <button
        type="button"
        aria-label={`Open ${item.name} details`}
        onClick={() => onView(item)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition active:scale-[0.99]"
      >
        {item.photoDataUrl ? (
          <img
            className="h-12 w-12 flex-none rounded-xl object-cover"
            src={item.photoDataUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <div
            className={`relative flex h-12 w-12 flex-none items-center justify-center rounded-xl text-sm font-extrabold ${tone.avatarBg} ${tone.avatarText}`}
          >
            {initials}
            <span
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
              aria-hidden="true"
            >
              {categoryEmoji}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900 dark:text-white">
            {item.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <StatusPill status={status} />
            <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {expiryLabel.prefix}
              {expiryLabel.distance ? <span className={`font-bold ${expiryLabel.tone}`}>{expiryLabel.distance}</span> : null}
              {expiryLabel.suffix}
            </span>
          </div>
        </div>
      </button>

      <div className="flex flex-none items-center gap-1">
        <QuantitySaveControl item={item} onSaveQuantity={onSaveQuantity} />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label={`More actions for ${item.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
            onClick={() => setMenuOpen((open) => !open)}
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
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(item);
                }}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit details
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(item);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete item
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};
