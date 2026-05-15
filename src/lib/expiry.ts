/**
 * Centralizes expiry math so the dashboard, detail rows, and summary counters
 * stay consistent. Using day-level comparisons avoids time-of-day surprises
 * when Ryan adds items from mobile browsers in different locales, while the
 * display copy and urgency colors turn expiry distances into quick scan cues.
 */
import type { ExpiryStatus, InventoryItem } from "@/types/inventory";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_DISPLAY_MONTH = 30;
const SOON_THRESHOLD_DAYS = 14;
const WARNING_MONTH_LIMIT = 4;
const YEAR_LABEL_MONTH_LIMIT = 12;

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getDaysUntilExpiry = (expiryDate?: string) => {
  if (!expiryDate) {
    return null;
  }

  const expiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) {
    return null;
  }

  return Math.ceil((expiry.getTime() - startOfToday().getTime()) / MS_PER_DAY);
};

export const getExpiryStatus = (expiryDate?: string): ExpiryStatus => {
  const days = getDaysUntilExpiry(expiryDate);

  if (days === null) {
    return "unknown";
  }

  if (days < 0) {
    return "expired";
  }

  if (days <= SOON_THRESHOLD_DAYS) {
    return "soon";
  }

  return "healthy";
};

export const formatExpiryMonthDistance = (days: number) => {
  const months = Math.max(1, Math.ceil(Math.abs(days) / DAYS_PER_DISPLAY_MONTH));

  if (months <= YEAR_LABEL_MONTH_LIMIT) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearLabel = `${years} year${years === 1 ? "" : "s"}`;

  if (remainingMonths === 0) {
    return yearLabel;
  }

  return `${yearLabel} and ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`;
};

export const getExpiryLabelTone = (expiryDate?: string) => {
  const days = getDaysUntilExpiry(expiryDate);

  if (days === null) {
    return "text-slate-500 dark:text-slate-400";
  }

  if (days <= 0) {
    return "text-rose-600 dark:text-rose-300";
  }

  const months = Math.max(1, Math.ceil(days / DAYS_PER_DISPLAY_MONTH));

  if (months <= 1) {
    return "text-rose-600 dark:text-rose-300";
  }

  if (months <= WARNING_MONTH_LIMIT) {
    return "text-orange-600 dark:text-orange-300";
  }

  return "text-emerald-600 dark:text-emerald-300";
};

export const getExpiryLabel = (item: InventoryItem) => {
  const days = getDaysUntilExpiry(item.expiryDate);

  if (days === null) {
    return "No expiry date";
  }

  if (days < 0) {
    return `Expired ${formatExpiryMonthDistance(days)} ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  return `Use within ${formatExpiryMonthDistance(days)}`;
};

export const getExpiryLabelParts = (item: InventoryItem) => {
  const days = getDaysUntilExpiry(item.expiryDate);

  if (days === null) {
    return { prefix: "No expiry date", distance: "", suffix: "", tone: getExpiryLabelTone(item.expiryDate) };
  }

  if (days < 0) {
    return {
      prefix: "Expired ",
      distance: formatExpiryMonthDistance(days),
      suffix: " ago",
      tone: getExpiryLabelTone(item.expiryDate),
    };
  }

  if (days === 0) {
    return { prefix: "Expires today", distance: "", suffix: "", tone: getExpiryLabelTone(item.expiryDate) };
  }

  return {
    prefix: "Use within ",
    distance: formatExpiryMonthDistance(days),
    suffix: "",
    tone: getExpiryLabelTone(item.expiryDate),
  };
};

export const sortByExpiryPriority = (items: InventoryItem[]) =>
  [...items].sort((a, b) => {
    const aDays = getDaysUntilExpiry(a.expiryDate);
    const bDays = getDaysUntilExpiry(b.expiryDate);

    if (aDays === null && bDays === null) {
      return a.name.localeCompare(b.name);
    }

    if (aDays === null) {
      return 1;
    }

    if (bDays === null) {
      return -1;
    }

    return aDays - bDays || a.name.localeCompare(b.name);
  });
