/**
 * Provides a small local quantity editor for inventory rows and cards. The
 * control lets Ryan stage plus/minus changes without immediately touching
 * Supabase, then saves the final number through the parent mutation so only
 * the changed item is persisted and refreshed in local state.
 */
import { useEffect, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

interface QuantitySaveControlProps {
  item: InventoryItem;
  onSaveQuantity: (item: InventoryItem, quantity: number) => Promise<void>;
  compact?: boolean;
}

export const QuantitySaveControl = ({
  item,
  onSaveQuantity,
  compact = false,
}: QuantitySaveControlProps) => {
  const [draftQuantity, setDraftQuantity] = useState(item.quantity);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isSaving) {
      setDraftQuantity(item.quantity);
    }
  }, [isSaving, item.quantity]);

  const isDirty = draftQuantity !== item.quantity;
  const canDecrement = draftQuantity > 0 && !isSaving;
  const buttonSize = compact ? "h-7 w-7" : "h-8 w-8";
  const valueWidth = compact ? "min-w-[1.5rem]" : "min-w-[1.75rem]";

  const adjustDraft = (delta: number) => {
    setDraftQuantity((current) => Math.max(0, Number((current + delta).toFixed(2))));
  };

  const saveQuantity = async () => {
    if (!isDirty || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onSaveQuantity(item, draftQuantity);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 rounded-full bg-slate-100 p-0.5 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
        <button
          type="button"
          aria-label={`Decrease ${item.name} quantity`}
          disabled={!canDecrement}
          onClick={() => adjustDraft(-1)}
          className={`${buttonSize} flex items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span
          className={`${valueWidth} text-center text-[12px] font-extrabold tabular-nums hs-text-primary`}
          aria-live="polite"
        >
          {draftQuantity}
        </span>
        <button
          type="button"
          aria-label={`Increase ${item.name} quantity`}
          disabled={isSaving}
          onClick={() => adjustDraft(1)}
          className={`${buttonSize} flex items-center justify-center rounded-full bg-teal-500 text-white shadow-sm transition active:scale-90 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {isDirty ? (
        <button
          type="button"
          aria-label={`Save ${item.name} quantity`}
          title="Save quantity"
          disabled={isSaving}
          onClick={() => void saveQuantity()}
          className={`${buttonSize} flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-300 transition hover:bg-emerald-400 active:scale-90 disabled:cursor-wait disabled:opacity-60 dark:ring-emerald-700`}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
};
