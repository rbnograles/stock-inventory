/**
 * Coordinates saved inventory locations for the signed-in user. The hook keeps
 * the picker options fresh, creates new labels when an item uses one, and
 * patches local state so adding or deleting a location does not require a page
 * reload.
 */
import { useCallback, useEffect, useState } from "react";
import { deleteInventoryLocation, ensureInventoryLocation, getInventoryLocations } from "@/lib/locationStore";
import type { InventoryLocation } from "@/types/location";

export const useInventoryLocations = (userId?: string) => {
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLocations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLocations(await getInventoryLocations());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load locations.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ensureLocation = useCallback(
    async (name: string) => {
      if (!userId || !name.trim()) {
        return null;
      }

      const saved = await ensureInventoryLocation(name, userId);

      if (saved) {
        setLocations((current) => {
          const exists = current.some((location) => location.id === saved.id || location.name === saved.name);
          const next = exists
            ? current.map((location) => (location.id === saved.id || location.name === saved.name ? saved : location))
            : [...current, saved];

          return next.sort((a, b) => a.name.localeCompare(b.name));
        });
      }

      return saved;
    },
    [userId],
  );

  const removeLocation = useCallback(
    async (name: string) => {
      if (!userId || !name.trim()) {
        return;
      }

      await deleteInventoryLocation(name, userId);
      setLocations((current) => current.filter((location) => location.name !== name));
    },
    [userId],
  );

  return {
    locations,
    isLoading,
    error,
    refresh,
    ensureLocation,
    removeLocation,
  };
};
