/**
 * Sticky app shell header. A friendly greeting, account indicator, sign-out,
 * and theme toggle keep authenticated inventory controls close but compact.
 */
import { IconButton } from "@/lib/material";
import { KeyRound, LogOut, Moon, Sparkles, Sun } from "lucide-react";

interface InventoryHeaderProps {
  darkMode: boolean;
  email?: string;
  onChangePassword: () => void;
  onSignOut: () => void;
  onToggleDarkMode: () => void;
}

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Late night snack?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Night owl";
};

export const InventoryHeader = ({
  darkMode,
  email,
  onChangePassword,
  onSignOut,
  onToggleDarkMode,
}: InventoryHeaderProps) => (
  <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
    <div className="safe-pt mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-soft">
          <Sparkles className="h-5 w-5 animate-float-slow" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
            HomeStock
          </p>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white">
            {greeting()}
          </h1>
          {email ? (
            <p className="max-w-[12rem] truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {email}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconButton
          variant="text"
          aria-label="Change password"
          onClick={onChangePassword}
          className="rounded-full"
        >
          <KeyRound className="h-5 w-5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
        </IconButton>
        <IconButton variant="text" aria-label="Sign out" onClick={onSignOut} className="rounded-full">
          <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
        </IconButton>
        <IconButton
          variant="text"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleDarkMode}
          className="rounded-full"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-amber-300" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" aria-hidden="true" />
          )}
        </IconButton>
      </div>
    </div>
  </header>
);
