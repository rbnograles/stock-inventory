/**
 * Coordinates the authenticated Supabase inventory lifecycle for the UI. The
 * hook keeps dashboard state simple while mutations patch the affected local
 * rows after Supabase confirms the write, avoiding full dashboard reloads for
 * small edits like quantity changes or location cleanup.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearInventoryLocation,
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
      setItems(await getInventoryItems(userId));
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
      setItems((currentItems) => {
        if (!current) {
          return [item, ...currentItems];
        }

        return currentItems.map((entry) => (entry.id === item.id ? item : entry));
      });
      return item;
    },
    [userId],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await deleteInventoryItem(id);
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    },
    [],
  );

  const saveQuantity = useCallback(
    async (item: InventoryItem, quantity: number) => {
      const nextQuantity = Math.max(0, Number(Number(quantity).toFixed(2)));
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
      setItems((currentItems) => currentItems.map((entry) => (entry.id === updated.id ? updated : entry)));
    },
    [],
  );

  const clearLocation = useCallback(
    async (location: string) => {
      if (!userId || !location.trim()) {
        return;
      }

      await clearInventoryLocation(location, userId);
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.location?.trim() === location.trim()
            ? { ...item, location: undefined, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
    },
    [userId],
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
    saveQuantity,
    clearLocation,
  };
};
