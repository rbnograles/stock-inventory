/**
 * Single inventory row tuned for thumb use. The photo + text area is a tap
 * target that opens the edit dialog; quantity is bumped in place with the
 * compact stepper; the overflow menu hosts low-frequency actions like Delete.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { getExpiryLabel, getExpiryStatus } from "@/lib/expiry";
import type { InventoryCategory, InventoryItem } from "@/types/inventory";

interface InventoryRowProps {
  item: InventoryItem;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustQuantity: (item: InventoryItem, delta: number) => void;
}

const avatarTone: Record<InventoryCategory, { bg: string; text: string }> = {
  Pantry: {
    bg: "bg-amber-100 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-300",
  },
  Refrigerated: {
    bg: "bg-sky-100 dark:bg-sky-500/15",
    text: "text-sky-700 dark:text-sky-300",
  },
  Frozen: {
    bg: "bg-cyan-100 dark:bg-cyan-500/15",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  Medicine: {
    bg: "bg-rose-100 dark:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-300",
  },
  Cleaning: {
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  "Personal Care": {
    bg: "bg-fuchsia-100 dark:bg-fuchsia-500/15",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  Other: {
    bg: "bg-slate-200 dark:bg-slate-700",
    text: "text-slate-700 dark:text-slate-200",
  },
};

export const InventoryRow = ({ item, onView, onEdit, onDelete, onAdjustQuantity }: InventoryRowProps) => {
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
  const expiryLabel = getExpiryLabel(item);
  const canDecrement = item.quantity > 0;
  const initials = useMemo(() => item.name.slice(0, 2).toUpperCase(), [item.name]);
  const tone = avatarTone[item.category];

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
            className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl text-sm font-extrabold ${tone.bg} ${tone.text}`}
          >
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900 dark:text-white">
            {item.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <StatusPill status={status} />
            <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {expiryLabel}
            </span>
          </div>
        </div>
      </button>

      <div className="flex flex-none items-center gap-1">
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
          <button
            type="button"
            aria-label={`Decrease ${item.name} quantity`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
            disabled={!canDecrement}
            onClick={() => onAdjustQuantity(item, -1)}
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-[1.75rem] text-center text-[13px] font-extrabold tabular-nums text-slate-900 dark:text-white">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label={`Increase ${item.name} quantity`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm transition active:scale-90 hover:bg-teal-400"
            onClick={() => onAdjustQuantity(item, 1)}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

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
