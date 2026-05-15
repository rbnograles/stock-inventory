/**
 * Wraps IndexedDB access behind a tiny repository API. This keeps React focused
 * on state transitions while the persistence layer handles offline durability,
 * first-run seeding, and future migrations in one place.
 */
import { openDB, type DBSchema } from "idb";
import { seedInventory } from "@/data/seedInventory";
import type { InventoryDraft, InventoryItem } from "@/types/inventory";

interface HomeStockDatabase extends DBSchema {
  items: {
    key: string;
    value: InventoryItem;
    indexes: {
      "by-category": string;
      "by-barcode": string;
      "by-expiry": string;
    };
  };
}

const DATABASE_NAME = "homestock-inventory";
const DATABASE_VERSION = 1;

const getDatabase = () =>
  openDB<HomeStockDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("items")) {
        const store = database.createObjectStore("items", { keyPath: "id" });
        store.createIndex("by-category", "category");
        store.createIndex("by-barcode", "barcode");
        store.createIndex("by-expiry", "expiryDate");
      }
    },
  });

const cleanOptional = (value: string) => value.trim() || undefined;

export const createInventoryItem = (draft: InventoryDraft): InventoryItem => {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
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

export const getInventoryItems = async () => {
  const database = await getDatabase();
  const items = await database.getAll("items");

  if (items.length > 0) {
    return items;
  }

  await Promise.all(seedInventory.map((item) => database.put("items", item)));
  return seedInventory;
};

export const saveInventoryItem = async (item: InventoryItem) => {
  const database = await getDatabase();
  await database.put("items", item);
};

export const deleteInventoryItem = async (id: string) => {
  const database = await getDatabase();
  await database.delete("items", id);
};
