/**
 * Currency helpers. The active currency is read from localStorage so users can
 * switch currencies at runtime from Profile. Falls back to `VITE_CURRENCY`
 * (env-supplied default), then USD. Components subscribe via the `useCurrency`
 * hook so a change re-renders every consumer of `formatMoney`.
 */
const STORAGE_KEY = "homestock-currency";
const DEFAULT_CURRENCY = ((import.meta.env.VITE_CURRENCY as string | undefined) ?? "USD").toUpperCase();

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "PHP", symbol: "₱", label: "Philippine Peso" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CAD", symbol: "$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "$", label: "Australian Dollar" },
  { code: "SGD", symbol: "$", label: "Singapore Dollar" },
  { code: "HKD", symbol: "$", label: "Hong Kong Dollar" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "MYR", symbol: "RM", label: "Malaysian Ringgit" },
  { code: "THB", symbol: "฿", label: "Thai Baht" },
  { code: "IDR", symbol: "Rp", label: "Indonesian Rupiah" },
  { code: "VND", symbol: "₫", label: "Vietnamese Dong" },
];

const isSupported = (code: string) => CURRENCY_OPTIONS.some((entry) => entry.code === code);

const initialCurrency = (() => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isSupported(stored)) return stored;
  } catch {
    // localStorage may be unavailable (e.g. private browsing).
  }
  return isSupported(DEFAULT_CURRENCY) ? DEFAULT_CURRENCY : "USD";
})();

let activeCurrency = initialCurrency;
let currencyFormatter = makeFormatter(activeCurrency);
let compactFormatter = makeCompactFormatter(activeCurrency);

function makeFormatter(code: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  });
}

function makeCompactFormatter(code: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

export const getCurrency = () => activeCurrency;

export const setCurrency = (code: string) => {
  const next = code.toUpperCase();
  if (!isSupported(next) || next === activeCurrency) return;
  activeCurrency = next;
  currencyFormatter = makeFormatter(next);
  compactFormatter = makeCompactFormatter(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore persistence failures; in-memory state still updates.
  }
};

export const formatMoney = (value: number) => currencyFormatter.format(value || 0);
export const formatCompactMoney = (value: number) => compactFormatter.format(value || 0);
