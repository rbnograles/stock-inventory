/**
 * Coordinates the authenticated Supabase inventory lifecycle for the UI. The
 * hook keeps dashboard state simple while every mutation refreshes the user's
 * server-backed stock list and preserves clear loading/error feedback.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteInventoryItem,
  getInventoryItems,
  saveInventoryItem,
  saveInventoryDraft,
  updateInventoryItem,
} from "@/lib/inventoryStore";
import type { InventoryDraft, InventoryItem } from "@/types/inventory";

export const useInventory = (userId?: string) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setItems(await getInventoryItems());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveDraft = useCallback(
    async (draft: InventoryDraft, current?: InventoryItem) => {
      if (!userId) {
        throw new Error("Please sign in before saving inventory items.");
      }

      const item = await saveInventoryDraft(draft, userId, current);
      await refresh();
      return item;
    },
    [refresh, userId],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await deleteInventoryItem(id);
      await refresh();
    },
    [refresh],
  );

  const adjustQuantity = useCallback(
    async (item: InventoryItem, delta: number) => {
      const nextQuantity = Math.max(0, Number((item.quantity + delta).toFixed(2)));
      const draft: InventoryDraft = {
        name: item.name,
        category: item.category,
        quantity: nextQuantity,
        unit: item.unit,
        barcode: item.barcode ?? "",
        location: item.location ?? "",
        expiryDate: item.expiryDate ?? "",
        notes: item.notes ?? "",
        photoDataUrl: item.photoDataUrl ?? "",
      };
      const updated = updateInventoryItem(item, draft);
      await saveInventoryItem(updated);
      await refresh();
    },
    [refresh],
  );

  const totalUnits = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );

  return {
    items,
    totalUnits,
    isLoading,
    error,
    refresh,
    saveDraft,
    removeItem,
    adjustQuantity,
  };
};
