/**
 * Provides a small starter dataset for a brand-new installation. The seed data
 * makes the first launch useful immediately and demonstrates expiry states
 * without requiring Ryan to add products before seeing the dashboard.
 */
import type { InventoryItem } from "@/types/inventory";

const now = new Date();

const dateInDays = (days: number) => {
  const date = new Date(now);
  date.setDate(now.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const seedInventory: InventoryItem[] = [
  {
    id: "seed-rice",
    userId: "seed-user",
    name: "Jasmine Rice",
    category: "Pantry",
    quantity: 1,
    unit: "sack",
    barcode: "4800016640017",
    location: "Kitchen shelf",
    expiryDate: dateInDays(80),
    notes: "Keep dry after opening.",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "seed-yogurt",
    userId: "seed-user",
    name: "Greek Yogurt",
    category: "Refrigerated",
    quantity: 3,
    unit: "cups",
    barcode: "9300657012342",
    location: "Fridge top shelf",
    expiryDate: dateInDays(5),
    notes: "Consume for breakfast first.",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "seed-vitamins",
    userId: "seed-user",
    name: "Vitamin C",
    category: "Medicine",
    quantity: 24,
    unit: "tabs",
    location: "Medicine box",
    expiryDate: dateInDays(180),
    notes: "Check stock when below 10 tablets.",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];
