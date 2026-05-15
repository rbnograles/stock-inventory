/**
 * Handles Supabase password-reset email requests and their local cooldown. The
 * hook turns backend throttling into friendly UI state while keeping AuthScreen
 * focused on rendering and mode changes.
 */
import { useState } from "react";
import {
  getPasswordResetCooldown,
  startPasswordResetCooldown,
} from "@/lib/passwordResetRateLimit";
import { supabase } from "@/lib/supabaseClient";

export const usePasswordResetRequest = () => {
  const [cooldownSeconds, setCooldownSeconds] = useState(getPasswordResetCooldown);

  const sendResetLink = async (email: string) => {
    const cooldown = getPasswordResetCooldown();

    if (cooldown > 0) {
      setCooldownSeconds(cooldown);
      return {
        ok: false,
        message: `Please wait ${cooldown} seconds before requesting another reset link.`,
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    const nextCooldown = startPasswordResetCooldown();
    setCooldownSeconds(nextCooldown);

    if (error) {
      return {
        ok: false,
        message: error.message.toLowerCase().includes("rate limit")
          ? "Too many reset emails were requested. Please wait a while before trying again."
          : error.message,
      };
    }

    return {
      ok: true,
      message: "Password reset link sent. Check your email.",
    };
  };

  return {
    cooldownSeconds,
    sendResetLink,
  };
};
