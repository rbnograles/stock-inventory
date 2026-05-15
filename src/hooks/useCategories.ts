/**
 * Coordinates the authenticated Supabase categories lifecycle for the UI.
 * Auto-seeds the default category set on first login so the dashboard always
 * has a working picker even for fresh accounts.
 */
import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  seedDefaultCategories,
  updateCategory,
} from "@/lib/categoriesStore";
import type { Category, CategoryDraft } from "@/types/category";
import { DEFAULT_CATEGORY_SEEDS } from "@/types/category";

export const useCategories = (userId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let list = await getCategories();

      if (list.length === 0) {
        list = await seedDefaultCategories(DEFAULT_CATEGORY_SEEDS, userId);
      }

      setCategories(list);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addCategory = useCallback(
    async (draft: CategoryDraft) => {
      if (!userId) {
        throw new Error("Please sign in before managing categories.");
      }

      const sortOrder = categories.length;
      const created = await createCategory(draft, userId, sortOrder);
      setCategories((current) => [...current, created]);
      return created;
    },
    [categories.length, userId],
  );

  const editCategory = useCallback(async (id: string, draft: CategoryDraft) => {
    const updated = await updateCategory(id, draft);
    setCategories((current) => current.map((category) => (category.id === id ? updated : category)));
    return updated;
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    await deleteCategory(id);
    setCategories((current) => current.filter((category) => category.id !== id));
  }, []);

  return {
    categories,
    isLoading,
    error,
    refresh,
    addCategory,
    editCategory,
    removeCategory,
  };
};
