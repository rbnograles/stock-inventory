/**
 * Centralizes expiry math so the dashboard, detail rows, and summary counters
 * stay consistent. Using day-level comparisons avoids time-of-day surprises
 * when Ryan adds items from mobile browsers in different locales, while the
 * display copy rounds those distances into month-based labels for easier
 * household planning.
 */
import type { ExpiryStatus, InventoryItem } from "@/types/inventory";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_DISPLAY_MONTH = 30;
const SOON_THRESHOLD_DAYS = 14;

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
  return `${months} month${months === 1 ? "" : "s"}`;
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
