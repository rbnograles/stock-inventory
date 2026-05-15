/**
 * Defines the shared inventory contract for the PWA. The item shape is kept
 * storage-friendly so IndexedDB can persist products offline, while still
 * carrying enough metadata for expiry decisions, barcode lookup, and photos.
 */
export type ExpiryStatus = "expired" | "soon" | "healthy" | "unknown";

export type InventoryCategory =
  | "Pantry"
  | "Refrigerated"
  | "Frozen"
  | "Medicine"
  | "Cleaning"
  | "Personal Care"
  | "Other";

export interface InventoryItem {
  id: string;
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

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  "Pantry",
  "Refrigerated",
  "Frozen",
  "Medicine",
  "Cleaning",
  "Personal Care",
  "Other",
];

export const EMPTY_DRAFT: InventoryDraft = {
  name: "",
  category: "Pantry",
  quantity: 1,
  unit: "pcs",
  barcode: "",
  location: "",
  expiryDate: "",
  notes: "",
  photoDataUrl: "",
};
