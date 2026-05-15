/**
 * Tracks client-side password reset email cooldowns. Supabase enforces the real
 * backend limit; this local timer prevents repeated taps and turns raw provider
 * throttling into a clear wait state for the user.
 */
const STORAGE_KEY = "homestock.passwordResetCooldownUntil";
const RESET_COOLDOWN_MS = 60 * 1000;

export const getPasswordResetCooldown = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  const cooldownUntil = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
};

export const startPasswordResetCooldown = () => {
  if (typeof window === "undefined") {
    return getPasswordResetCooldown();
  }

  window.localStorage.setItem(STORAGE_KEY, String(Date.now() + RESET_COOLDOWN_MS));
  return getPasswordResetCooldown();
};
