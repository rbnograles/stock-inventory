/**
 * Small currency helpers. Uses the user's locale + a configurable currency
 * code via env so the app is friendly for non-USD users without needing a full
 * i18n layer yet.
 */
const CURRENCY = (import.meta.env.VITE_CURRENCY as string | undefined) ?? "USD";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatMoney = (value: number) => currencyFormatter.format(value || 0);
export const formatCompactMoney = (value: number) => compactFormatter.format(value || 0);
