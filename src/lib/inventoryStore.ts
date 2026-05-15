/**
 * Wraps Supabase inventory persistence behind a small repository API. The UI
 * can keep working with camelCase item objects while this module handles table
 * mapping, authenticated ownership, and the `{ ok, message, data }`-style
 * operational boundary expected from the project.
 */
import { supabase } from "@/lib/supabaseClient";
import type { InventoryDraft, InventoryItem } from "@/types/inventory";

interface InventoryRow {
  id: string;
  user_id: string;
  name: string;
  category: InventoryItem["category"];
  quantity: number;
  unit: string;
  barcode: string | null;
  location: string | null;
  expiry_date: string | null;
  notes: string | null;
  photo_data_url: string | null;
  created_at: string;
  updated_at: string;
}

const cleanOptional = (value: string) => value.trim() || undefined;
const cleanNullable = (value: string | undefined) => value?.trim() || null;

const generateId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const mapRowToItem = (row: InventoryRow): InventoryItem => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  category: row.category,
  quantity: Number(row.quantity || 0),
  unit: row.unit,
  barcode: row.barcode ?? undefined,
  location: row.location ?? undefined,
  expiryDate: row.expiry_date ?? undefined,
  notes: row.notes ?? undefined,
  photoDataUrl: row.photo_data_url ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const draftToPayload = (draft: InventoryDraft) => ({
  name: draft.name.trim(),
  category: draft.category,
  quantity: Math.max(0, Number(draft.quantity) || 0),
  unit: draft.unit.trim() || "pcs",
  barcode: cleanNullable(draft.barcode),
  location: cleanNullable(draft.location),
  expiry_date: cleanNullable(draft.expiryDate),
  notes: cleanNullable(draft.notes),
  photo_data_url: cleanNullable(draft.photoDataUrl),
});

export const createInventoryItem = (draft: InventoryDraft, userId: string): InventoryItem => {
  const timestamp = new Date().toISOString();

  return {
    id: generateId(),
    userId,
    name: draft.name.trim(),
    category: draft.category,
    quantity: Math.max(0, Number(draft.quantity) || 0),
    unit: draft.unit.trim() || "pcs",
    barcode: cleanOptional(draft.barcode),
    location: cleanOptional(draft.location),
    expiryDate: cleanOptional(draft.expiryDate),
    notes: cleanOptional(draft.notes),
    photoDataUrl: cleanOptional(draft.photoDataUrl),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const updateInventoryItem = (
  current: InventoryItem,
  draft: InventoryDraft,
): InventoryItem => ({
  ...current,
  name: draft.name.trim(),
  category: draft.category,
  quantity: Math.max(0, Number(draft.quantity) || 0),
  unit: draft.unit.trim() || "pcs",
  barcode: cleanOptional(draft.barcode),
  location: cleanOptional(draft.location),
  expiryDate: cleanOptional(draft.expiryDate),
  notes: cleanOptional(draft.notes),
  photoDataUrl: cleanOptional(draft.photoDataUrl),
  updatedAt: new Date().toISOString(),
});

export const getInventoryItems = async (userId: string) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as InventoryRow[]).map(mapRowToItem);
};

export const saveInventoryItem = async (item: InventoryItem) => {
  const payload = {
    id: item.id,
    user_id: item.userId,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    barcode: item.barcode ?? null,
    location: item.location ?? null,
    expiry_date: item.expiryDate ?? null,
    notes: item.notes ?? null,
    photo_data_url: item.photoDataUrl ?? null,
  };

  const { error } = await supabase.from("inventory_items").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const saveInventoryDraft = async (
  draft: InventoryDraft,
  userId: string,
  current?: InventoryItem,
) => {
  if (current) {
    const { data, error } = await supabase
      .from("inventory_items")
      .update({
        ...draftToPayload(draft),
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRowToItem(data as InventoryRow);
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      id: generateId(),
      user_id: userId,
      ...draftToPayload(draft),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToItem(data as InventoryRow);
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};
