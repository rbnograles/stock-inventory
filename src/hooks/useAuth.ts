/**
 * Owns Supabase auth session state for the PWA. Centralizing session loading,
 * password-recovery link handling, auth changes, and sign-out keeps the
 * dashboard focused while every data request can rely on the active user.
 */
import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const isResetPasswordRoute = () =>
  typeof window !== "undefined" && window.location.pathname === "/reset-password";

const getAuthUrlError = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return hashParams.get("error_description") ?? searchParams.get("error_description");
};

const clearAuthUrl = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState(null, "", isResetPasswordRoute() ? "/reset-password" : "/");
};

const returnToAppRoot = () => {
  if (typeof window !== "undefined" && isResetPasswordRoute()) {
    window.history.replaceState(null, "", "/");
  }
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [prefersResetPassword, setPrefersResetPassword] = useState(isResetPasswordRoute);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadSession = async () => {
      const authUrlError = getAuthUrlError();

      if (authUrlError) {
        setError(authUrlError);
        setPrefersResetPassword(true);
        clearAuthUrl();
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (_event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
        setPrefersResetPassword(false);
        setError(null);
        clearAuthUrl();
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    void loadSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
    setPrefersResetPassword(false);
    returnToAppRoot();
  }, []);

  const signOut = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
    }
  }, []);

  const updateDisplayName = useCallback(async (displayName: string) => {
    const trimmed = displayName.trim();
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { display_name: trimmed || null },
    });

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (data.user) {
      setUser(data.user);
    }
  }, []);

  return {
    session,
    user,
    isPasswordRecovery,
    prefersResetPassword,
    isLoading,
    error,
    clearError,
    clearPasswordRecovery,
    signOut,
    updateDisplayName,
  };
};
