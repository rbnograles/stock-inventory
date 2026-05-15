/**
 * Adds a small client-side throttle for repeated failed sign-in attempts. This
 * does not replace Supabase's server-side rate limits; it gives the mobile UI a
 * clear cooldown state and reduces accidental rapid retries from one browser.
 */
interface LoginRateLimitRecord {
  attempts: number;
  lockedUntil: number;
  windowStartedAt: number;
}

export interface LoginRateLimitState {
  attemptsRemaining: number;
  isLocked: boolean;
  secondsUntilUnlock: number;
}

const STORAGE_KEY = "homestock.loginRateLimit";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 5 * 60 * 1000;

const emptyRecord = (): LoginRateLimitRecord => ({
  attempts: 0,
  lockedUntil: 0,
  windowStartedAt: Date.now(),
});

const readRecord = (): LoginRateLimitRecord => {
  if (typeof window === "undefined") {
    return emptyRecord();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyRecord();
    }

    const parsed = JSON.parse(raw) as Partial<LoginRateLimitRecord>;
    return {
      attempts: Number(parsed.attempts ?? 0),
      lockedUntil: Number(parsed.lockedUntil ?? 0),
      windowStartedAt: Number(parsed.windowStartedAt ?? Date.now()),
    };
  } catch {
    return emptyRecord();
  }
};

const writeRecord = (record: LoginRateLimitRecord) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
};

const normalizeRecord = (record: LoginRateLimitRecord) => {
  const now = Date.now();

  if (record.lockedUntil > now) {
    return record;
  }

  if (now - record.windowStartedAt > WINDOW_MS || record.lockedUntil > 0) {
    return emptyRecord();
  }

  return record;
};

export const getLoginRateLimitState = (): LoginRateLimitState => {
  const record = normalizeRecord(readRecord());
  const now = Date.now();
  const secondsUntilUnlock = Math.max(0, Math.ceil((record.lockedUntil - now) / 1000));

  return {
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - record.attempts),
    isLocked: secondsUntilUnlock > 0,
    secondsUntilUnlock,
  };
};

export const recordLoginFailure = () => {
  const record = normalizeRecord(readRecord());
  const nextAttempts = record.attempts + 1;
  const lockedUntil = nextAttempts >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0;

  writeRecord({
    attempts: nextAttempts,
    lockedUntil,
    windowStartedAt: record.windowStartedAt,
  });

  return getLoginRateLimitState();
};

export const clearLoginRateLimit = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
