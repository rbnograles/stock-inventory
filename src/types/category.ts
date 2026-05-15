/**
 * Shared shape for user-defined inventory categories. Items reference categories
 * by name (text column) so existing rows keep working; this table just adds the
 * label + emoji metadata the UI uses to render and pick categories.
 */
export interface Category {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDraft {
  name: string;
  emoji: string;
}

export interface CategorySeed {
  name: string;
  emoji: string;
}

export const DEFAULT_CATEGORY_SEEDS: CategorySeed[] = [
  { name: "Pantry", emoji: "🥫" },
  { name: "Refrigerated", emoji: "🥬" },
  { name: "Frozen", emoji: "🧊" },
  { name: "Medicine", emoji: "💊" },
  { name: "Cleaning", emoji: "🧼" },
  { name: "Personal Care", emoji: "🧴" },
  { name: "Other", emoji: "📦" },
];
