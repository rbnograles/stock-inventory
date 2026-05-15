/**
 * Coordinates the inventory list lifecycle for the UI. The hook exposes simple
 * save/delete callbacks, refreshes the IndexedDB snapshot after each mutation,
 * and preserves a clear loading/error state for the mobile dashboard.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  saveInventoryItem,
  updateInventoryItem,
} from "@/lib/inventoryStore";
import type { InventoryDraft, InventoryItem } from "@/types/inventory";

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setItems(await getInventoryItems());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveDraft = useCallback(
    async (draft: InventoryDraft, current?: InventoryItem) => {
      const item = current ? updateInventoryItem(current, draft) : createInventoryItem(draft);
      await saveInventoryItem(item);
      await refresh();
      return item;
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await deleteInventoryItem(id);
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
  };
};
