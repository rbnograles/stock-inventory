/**
 * Resolves display metadata (emoji + accent tone) for an inventory category
 * name. Because categories are user-defined, color tones are picked from a
 * fixed palette using a stable hash of the category name so the same category
 * always renders the same way without storing color on the DB row.
 */
import type { Category } from "@/types/category";

export interface CategoryTone {
  avatarBg: string;
  avatarText: string;
  heroGradient: string;
}

const tonePalette: CategoryTone[] = [
  {
    avatarBg: "bg-amber-100 dark:bg-amber-500/15",
    avatarText: "text-amber-700 dark:text-amber-300",
    heroGradient:
      "from-amber-300 via-orange-300 to-rose-300 dark:from-amber-500/30 dark:via-orange-500/20 dark:to-rose-500/20",
  },
  {
    avatarBg: "bg-sky-100 dark:bg-sky-500/15",
    avatarText: "text-sky-700 dark:text-sky-300",
    heroGradient:
      "from-sky-300 via-cyan-300 to-teal-300 dark:from-sky-500/30 dark:via-cyan-500/20 dark:to-teal-500/20",
  },
  {
    avatarBg: "bg-cyan-100 dark:bg-cyan-500/15",
    avatarText: "text-cyan-700 dark:text-cyan-300",
    heroGradient:
      "from-cyan-200 via-sky-300 to-indigo-300 dark:from-cyan-500/30 dark:via-sky-500/20 dark:to-indigo-500/20",
  },
  {
    avatarBg: "bg-rose-100 dark:bg-rose-500/15",
    avatarText: "text-rose-700 dark:text-rose-300",
    heroGradient:
      "from-rose-300 via-pink-300 to-fuchsia-300 dark:from-rose-500/30 dark:via-pink-500/20 dark:to-fuchsia-500/20",
  },
  {
    avatarBg: "bg-emerald-100 dark:bg-emerald-500/15",
    avatarText: "text-emerald-700 dark:text-emerald-300",
    heroGradient:
      "from-emerald-300 via-teal-300 to-cyan-300 dark:from-emerald-500/30 dark:via-teal-500/20 dark:to-cyan-500/20",
  },
  {
    avatarBg: "bg-fuchsia-100 dark:bg-fuchsia-500/15",
    avatarText: "text-fuchsia-700 dark:text-fuchsia-300",
    heroGradient:
      "from-fuchsia-300 via-purple-300 to-indigo-300 dark:from-fuchsia-500/30 dark:via-purple-500/20 dark:to-indigo-500/20",
  },
  {
    avatarBg: "bg-violet-100 dark:bg-violet-500/15",
    avatarText: "text-violet-700 dark:text-violet-300",
    heroGradient:
      "from-violet-300 via-indigo-300 to-sky-300 dark:from-violet-500/30 dark:via-indigo-500/20 dark:to-sky-500/20",
  },
  {
    avatarBg: "bg-teal-100 dark:bg-teal-500/15",
    avatarText: "text-teal-700 dark:text-teal-300",
    heroGradient:
      "from-teal-300 via-cyan-300 to-sky-300 dark:from-teal-500/30 dark:via-cyan-500/20 dark:to-sky-500/20",
  },
];

const fallbackTone: CategoryTone = {
  avatarBg: "bg-slate-200 dark:bg-slate-700",
  avatarText: "text-slate-700 dark:text-slate-200",
  heroGradient:
    "from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-700 dark:to-slate-800",
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const toneForCategory = (name: string): CategoryTone => {
  if (!name) {
    return fallbackTone;
  }
  return tonePalette[hashString(name) % tonePalette.length];
};

export const emojiForCategory = (name: string, categories: Category[]): string => {
  const match = categories.find((category) => category.name === name);
  return match?.emoji ?? "📦";
};
