/**
 * Subscribes a component to the active display currency. The underlying store
 * lives in `lib/money.ts` (module-level + localStorage); this hook wraps it so
 * a change re-renders every consumer. Currency rarely changes, so the simple
 * top-level state in App is sufficient — no context provider needed.
 */
import { useCallback, useState } from "react";
import { getCurrency, setCurrency } from "@/lib/money";

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState<string>(getCurrency);

  const updateCurrency = useCallback((code: string) => {
    setCurrency(code);
    setCurrencyState(getCurrency());
  }, []);

  return { currency, setCurrency: updateCurrency };
};
