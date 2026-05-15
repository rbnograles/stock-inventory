/**
 * Presents the mobile-first Supabase login, registration, and password reset
 * flow. The screen keeps account access lightweight while surfacing missing
 * config, auth errors, rate-limit cooldowns, and the reason sign-in matters:
 * every item is saved to the user's Supabase-backed household inventory.
 */
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Mail, PackageCheck, RotateCcw, UserPlus } from "lucide-react";
import { AuthModeActions } from "@/components/AuthModeActions";
import { PasswordField } from "@/components/PasswordField";
import { Button, Input } from "@/lib/material";
import { clearLoginRateLimit, getLoginRateLimitState, recordLoginFailure } from "@/lib/authRateLimit";
import { usePasswordResetRequest } from "@/hooks/usePasswordResetRequest";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type AuthMode = "sign-in" | "sign-up" | "reset-password";

interface AuthScreenProps {
  initialError?: string | null;
  initialMode?: AuthMode;
  onClearInitialError?: () => void;
}

export const AuthScreen = ({
  initialError,
  initialMode = "sign-in",
  onClearInitialError,
}: AuthScreenProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimit, setRateLimit] = useState(getLoginRateLimitState);
  const { cooldownSeconds: resetCooldownSeconds, sendResetLink } = usePasswordResetRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const isSignUp = mode === "sign-up";
  const isPasswordReset = mode === "reset-password";
  const title = isPasswordReset ? "Reset password" : isSignUp ? "Create account" : "Welcome back";
  const submitLabel = isPasswordReset
    ? resetCooldownSeconds > 0
      ? `Wait ${resetCooldownSeconds}s`
      : "Send reset link"
    : isSignUp
      ? "Create account"
      : "Sign in";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured yet. Add your URL and anon key to .env.");
      return;
    }
    const latestRateLimit = getLoginRateLimitState();
    setRateLimit(latestRateLimit);

    if (!isSignUp && !isPasswordReset && latestRateLimit.isLocked) {
      setError(`Too many failed attempts. Try again in ${latestRateLimit.secondsUntilUnlock} seconds.`);
      return;
    }
    setIsSubmitting(true);
    setError("");
    setMessage("");

    if (isPasswordReset) {
      const result = await sendResetLink(email);

      if (result.ok) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }

      setIsSubmitting(false);
      return;
    }
    const authRequest = isSignUp
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password });
    const { error: authError } = await authRequest;

    if (authError) {
      if (!isSignUp) {
        setRateLimit(recordLoginFailure());
      }

      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    if (!isSignUp) {
      clearLoginRateLimit();
      setRateLimit(getLoginRateLimitState());
    }

    setMessage(isSignUp ? "Account created. Check your email if confirmation is enabled." : "Signed in.");
    setIsSubmitting(false);
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-vibe-light px-4 py-8 text-slate-900 dark:bg-vibe-dark dark:text-white">
      <section className="w-full max-w-sm space-y-6 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="space-y-3 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-soft">
            <PackageCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
              HomeStock
            </p>
            <h1 className="text-2xl font-black">{title}</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isPasswordReset
              ? "Enter your email and we'll send a secure reset link."
              : "Sign in to store your household inventory securely in Supabase."}
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then restart Vite.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            crossOrigin=""
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            aria-label="Email"
            autoComplete="username"
            type="email"
            value={email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
            required
          />
          {!isPasswordReset ? (
            <PasswordField
              autoComplete={isSignUp ? "new-password" : "current-password"}
              showPassword={showPassword}
              value={password}
              onChange={setPassword}
              onToggleShowPassword={() => setShowPassword((current) => !current)}
            />
          ) : null}
          {!isSignUp && !isPasswordReset && rateLimit.attemptsRemaining < 5 ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
              {rateLimit.isLocked
                ? `Too many failed attempts. Try again in ${rateLimit.secondsUntilUnlock} seconds.`
                : `${rateLimit.attemptsRemaining} sign-in attempt${
                    rateLimit.attemptsRemaining === 1 ? "" : "s"
                  } remaining before cooldown.`}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-2xl border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-100">
              {message}
            </p>
          ) : null}
          <Button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-teal-600 shadow-soft"
            disabled={
              isSubmitting ||
              !isSupabaseConfigured ||
              (!isSignUp && !isPasswordReset && rateLimit.isLocked) ||
              (isPasswordReset && resetCooldownSeconds > 0)
            }
          >
            {isSignUp ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : null}
            {isPasswordReset ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : null}
            {isSubmitting ? "Please wait..." : submitLabel}
          </Button>
        </form>

        <AuthModeActions
          mode={mode}
          onModeChange={setMode}
          onClearMessages={() => {
            setError("");
            setMessage("");
            onClearInitialError?.();
          }}
        />
      </section>
    </main>
  );
};
