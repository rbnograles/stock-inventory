/**
 * Provides the password input plus show/hide affordance used by Supabase auth.
 * Keeping the visibility toggle here avoids duplicating password UI behavior
 * and keeps the main auth screen focused on flow state.
 */
import { type ChangeEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/lib/material";

interface PasswordFieldProps {
  autoComplete?: string;
  label?: string;
  showPassword: boolean;
  value: string;
  onChange: (value: string) => void;
  onToggleShowPassword: () => void;
}

export const PasswordField = ({
  autoComplete,
  label = "Password",
  showPassword,
  value,
  onChange,
  onToggleShowPassword,
}: PasswordFieldProps) => (
  <div className="space-y-2">
    <Input
      crossOrigin=""
      icon={<LockKeyhole className="h-4 w-4" />}
      label={label}
      aria-label={label}
      autoComplete={autoComplete}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      required
    />
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300"
      onClick={onToggleShowPassword}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
      {showPassword ? "Hide password" : "Show password"}
    </button>
  </div>
);
