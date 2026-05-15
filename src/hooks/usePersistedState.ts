/**
 * Tiny wrapper around `useState` that mirrors the value into localStorage so it
 * survives full reloads. The optional `isValid` guard lets callers reject stale
 * or unexpected values (e.g. tab names that no longer exist) and fall back to
 * the initial value instead of crashing on bad data.
 */
import { useCallback, useEffect, useState } from "react";

export const usePersistedState = <T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => value is T,
) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return initialValue;
      const parsed = JSON.parse(stored) as unknown;
      if (isValid && !isValid(parsed)) return initialValue;
      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage may be unavailable (e.g. private browsing).
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset] as const;
};
