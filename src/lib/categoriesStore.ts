/**
 * Supabase repository for user-defined inventory categories. Mirrors the small
 * camelCase boundary the UI prefers while RLS keeps reads/writes scoped to the
 * authenticated user.
 */
import { supabase } from "@/lib/supabaseClient";
import type { Category, CategoryDraft, CategorySeed } from "@/types/category";

interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const mapRowToCategory = (row: CategoryRow): Category => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  emoji: row.emoji,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("inventory_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as CategoryRow[]).map(mapRowToCategory);
};

export const createCategory = async (draft: CategoryDraft, userId: string, sortOrder: number) => {
  const { data, error } = await supabase
    .from("inventory_categories")
    .insert({
      user_id: userId,
      name: draft.name.trim(),
      emoji: draft.emoji.trim() || "📦",
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToCategory(data as CategoryRow);
};

export const updateCategory = async (id: string, draft: CategoryDraft) => {
  const { data, error } = await supabase
    .from("inventory_categories")
    .update({
      name: draft.name.trim(),
      emoji: draft.emoji.trim() || "📦",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToCategory(data as CategoryRow);
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from("inventory_categories").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const seedDefaultCategories = async (seeds: CategorySeed[], userId: string) => {
  const payload = seeds.map((seed, index) => ({
    user_id: userId,
    name: seed.name,
    emoji: seed.emoji,
    sort_order: index,
  }));

  const { data, error } = await supabase
    .from("inventory_categories")
    .insert(payload)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data as CategoryRow[]).map(mapRowToCategory);
};
