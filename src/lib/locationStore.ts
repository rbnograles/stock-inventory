/**
 * Wraps Supabase persistence for user-owned inventory locations. Keeping this
 * repository small mirrors the category store pattern and uses a select-first
 * insert flow so saving a reused location does not depend on fragile upsert
 * conflict metadata in Supabase. Deleting removes the saved picker option;
 * item rows are cleared separately by the inventory repository.
 */
import { supabase } from "@/lib/supabaseClient";
import type { InventoryLocation } from "@/types/location";

interface LocationRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const mapRowToLocation = (row: LocationRow): InventoryLocation => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getInventoryLocations = async () => {
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as LocationRow[]).map(mapRowToLocation);
};

export const ensureInventoryLocation = async (name: string, userId: string) => {
  const cleanName = name.trim();

  if (!cleanName) {
    return null;
  }

  const { data: existing, error: findError } = await supabase
    .from("inventory_locations")
    .select("*")
    .eq("user_id", userId)
    .eq("name", cleanName)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (existing) {
    return mapRowToLocation(existing as LocationRow);
  }

  const { data, error } = await supabase
    .from("inventory_locations")
    .insert({
      user_id: userId,
      name: cleanName,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToLocation(data as LocationRow);
};

export const deleteInventoryLocation = async (name: string, userId: string) => {
  const cleanName = name.trim();

  if (!cleanName) {
    return;
  }

  const { error } = await supabase
    .from("inventory_locations")
    .delete()
    .eq("user_id", userId)
    .eq("name", cleanName);

  if (error) {
    throw new Error(error.message);
  }
};
