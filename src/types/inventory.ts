/**
 * Defines the shared inventory contract for the PWA. The item shape mirrors
 * the Supabase-backed inventory table while preserving UI-friendly camelCase
 * names for expiry decisions, saved locations, quantity updates, and photos.
 *
 * Categories are user-defined and stored on items as plain text. The display
 * label + emoji come from the `inventory_categories` table.
 */
export type ExpiryStatus = "expired" | "soon" | "healthy" | "unknown";

export type InventoryCategory = string;

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  barcode?: string;
  location?: string;
  expiryDate?: string;
  notes?: string;
  photoDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDraft {
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  barcode: string;
  location: string;
  expiryDate: string;
  notes: string;
  photoDataUrl: string;
}

export const EMPTY_DRAFT: InventoryDraft = {
  name: "",
  category: "Pantry",
  quantity: 0,
  unit: "pcs",
  barcode: "",
  location: "",
  expiryDate: "",
  notes: "",
  photoDataUrl: "",
};
