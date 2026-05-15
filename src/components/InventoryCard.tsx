/**
 * Grid-view variant of the inventory row. Pairs a larger image area on top
 * with compact metadata and a staged quantity save control, keeping card edits
 * quick while avoiding a full inventory reload for each plus/minus tap.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { QuantitySaveControl } from "@/components/QuantitySaveControl";
import { getExpiryLabelParts, getExpiryStatus } from "@/lib/expiry";
import { emojiForCategory, toneForCategory } from "@/lib/categoryVisuals";
import type { Category } from "@/types/category";
import type { ExpiryStatus, InventoryItem } from "@/types/inventory";

interface InventoryCardProps {
  item: InventoryItem;
  categories: Category[];
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onSaveQuantity: (item: InventoryItem, quantity: number) => Promise<void>;
}

const statusBadge: Record<ExpiryStatus, { bg: string; text: string; label: string }> = {
  expired: {
    bg: "bg-rose-100/95 dark:bg-rose-500/30",
    text: "text-rose-700 dark:text-rose-100",
    label: "Expired",
  },
  soon: {
    bg: "bg-amber-100/95 dark:bg-amber-500/30",
    text: "text-amber-800 dark:text-amber-100",
    label: "Soon",
  },
  healthy: {
    bg: "bg-emerald-100/95 dark:bg-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-100",
    label: "Fresh",
  },
  unknown: {
    bg: "bg-slate-100/95 dark:bg-slate-800/80",
    text: "text-slate-700 dark:text-slate-200",
    label: "No date",
  },
};

export const InventoryCard = ({
  item,
  categories,
  onView,
  onEdit,
  onDelete,
  onSaveQuantity,
}: InventoryCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handler = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [menuOpen]);

  const status = getExpiryStatus(item.expiryDate);
  const tone = toneForCategory(item.category);
  const categoryEmoji = emojiForCategory(item.category, categories);
  const initials = useMemo(() => item.name.slice(0, 2).toUpperCase(), [item.name]);
  const badge = statusBadge[status];
  const expiryLabel = getExpiryLabelParts(item);

  return (
    <article className={`relative ${menuOpen ? "z-20" : ""}`}>
      <div className="hs-surface overflow-hidden">
        <button
          type="button"
          onClick={() => onView(item)}
          aria-label={`Open ${item.name} details`}
          className="block w-full text-left transition active:scale-[0.99]"
        >
          <div className="relative">
            {item.photoDataUrl ? (
              <img
                className="aspect-square w-full object-cover"
                src={item.photoDataUrl}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className={`relative flex aspect-square w-full items-center justify-center ${tone.avatarBg}`}>
                <span className={`text-4xl font-extrabold ${tone.avatarText}`}>{initials}</span>
              </div>
            )}

            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-white">
              <span aria-hidden="true">{categoryEmoji}</span>
              <span className="max-w-[64px] truncate">{item.category}</span>
            </span>

            <span className={`absolute right-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>

          <div className="space-y-0.5 px-3 pt-3">
            <h3 className="line-clamp-2 min-h-[2.2em] text-[13px] font-bold leading-tight hs-text-primary">
              {item.name}
            </h3>
            <p className="truncate text-[11px] font-medium hs-text-muted">
              {expiryLabel.prefix}
              {expiryLabel.distance ? <span className={`font-bold ${expiryLabel.tone}`}>{expiryLabel.distance}</span> : null}
              {expiryLabel.suffix}
            </p>
          </div>
        </button>

        <div className="flex items-center justify-between gap-1 px-3 pb-3 pt-2">
          <QuantitySaveControl item={item} compact onSaveQuantity={onSaveQuantity} />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label={`More actions for ${item.name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
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
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(item);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit details
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(item);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete item
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};
