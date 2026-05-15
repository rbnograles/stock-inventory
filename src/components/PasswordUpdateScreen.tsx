/**
 * Lets a user complete a Supabase password-recovery session or update an
 * already signed-in account password. Keeping this separate from login avoids
 * reset-email throttles when the user has an active session.
 */
import { type FormEvent, useState } from "react";
import { CheckCircle2, KeyRound, PackageCheck } from "lucide-react";
import { PasswordField } from "@/components/PasswordField";
import { Button } from "@/lib/material";
import { supabase } from "@/lib/supabaseClient";

interface PasswordUpdateScreenProps {
  onComplete: () => void;
}

export const PasswordUpdateScreen = ({ onComplete }: PasswordUpdateScreenProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Password updated. You can continue to HomeStock.");
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
            <h1 className="text-2xl font-black">Set new password</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Choose a fresh password for your signed-in HomeStock account. No reset email needed.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <PasswordField
            autoComplete="new-password"
            label="New password"
            showPassword={showPassword}
            value={password}
            onChange={setPassword}
            onToggleShowPassword={() => setShowPassword((current) => !current)}
          />
          <PasswordField
            autoComplete="new-password"
            label="Confirm password"
            showPassword={showPassword}
            value={confirmPassword}
            onChange={setConfirmPassword}
            onToggleShowPassword={() => setShowPassword((current) => !current)}
          />
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
          {message ? (
            <Button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-teal-600 shadow-soft"
              onClick={onComplete}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-teal-600 shadow-soft"
              disabled={isSubmitting}
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          )}
        </form>
      </section>
    </main>
  );
};
