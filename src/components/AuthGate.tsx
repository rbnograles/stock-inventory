/**
 * Routes authentication edge states before the inventory dashboard renders.
 * Keeping recovery, expired-link, loading, and signed-out states here prevents
 * `App` from growing while preserving stable hook order in the parent.
 */
import type { ReactNode } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { PasswordUpdateScreen } from "@/components/PasswordUpdateScreen";

interface AuthGateProps {
  authError: string | null;
  authLoading: boolean;
  children: ReactNode;
  isPasswordRecovery: boolean;
  passwordUpdateRequested: boolean;
  prefersResetPassword: boolean;
  userPresent: boolean;
  onClearError: () => void;
  onClearPasswordRecovery: () => void;
}

export const AuthGate = ({
  authError,
  authLoading,
  children,
  isPasswordRecovery,
  passwordUpdateRequested,
  prefersResetPassword,
  userPresent,
  onClearError,
  onClearPasswordRecovery,
}: AuthGateProps) => {
  if (authLoading) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-vibe-light text-sm font-bold text-slate-500 dark:bg-vibe-dark dark:text-slate-300">
        Loading account...
      </div>
    );
  }

  if (userPresent && (isPasswordRecovery || passwordUpdateRequested || prefersResetPassword)) {
    return <PasswordUpdateScreen onComplete={onClearPasswordRecovery} />;
  }

  if (authError && prefersResetPassword) {
    return (
      <AuthScreen
        initialError={authError}
        initialMode="sign-in"
        onClearInitialError={onClearError}
      />
    );
  }

  if (!userPresent) {
    return (
      <AuthScreen
        initialError={prefersResetPassword ? "Sign in first to change your password directly. Use forgot password only if you cannot sign in." : undefined}
        initialMode="sign-in"
        onClearInitialError={onClearError}
      />
    );
  }

  return <>{children}</>;
};
