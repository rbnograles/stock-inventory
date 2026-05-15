/**
 * Centralizes how the app derives a human display name from a Supabase user.
 * The user can edit it via Profile, which writes `display_name` into auth
 * metadata; older rows / first-time users fall back to the email prefix.
 */
import type { User } from "@supabase/supabase-js";

export const getDisplayName = (user: User | null | undefined): string => {
  if (!user) return "HomeStock";
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const candidates = [metadata?.display_name, metadata?.full_name, metadata?.name];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  if (user.email) return user.email.split("@")[0];
  return "HomeStock";
};

export const getStoredDisplayName = (user: User | null | undefined): string => {
  if (!user) return "";
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const value = metadata?.display_name;
  return typeof value === "string" ? value : "";
};
