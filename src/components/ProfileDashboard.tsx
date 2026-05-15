/**
 * Provides the account and app-control workspace after removing the top navbar.
 * It keeps password reset, category managers, theme switching, and sign-out in
 * one bottom-tab destination so every control remains reachable on mobile.
 */
import { KeyRound, LogOut, Moon, Sun, Tag, UserRound, WalletCards } from "lucide-react";

interface ProfileDashboardProps {
  darkMode: boolean;
  email?: string;
  inventoryCategoryCount: number;
  financeCategoryCount: number;
  onChangePassword: () => void;
  onManageInventoryCategories: () => void;
  onManageFinanceCategories: () => void;
  onSignOut: () => void;
  onToggleDarkMode: () => void;
}

export const ProfileDashboard = ({
  darkMode,
  email,
  inventoryCategoryCount,
  financeCategoryCount,
  onChangePassword,
  onManageInventoryCategories,
  onManageFinanceCategories,
  onSignOut,
  onToggleDarkMode,
}: ProfileDashboardProps) => (
  <div className="space-y-4">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-900 p-5 text-white shadow-soft dark:from-slate-900 dark:via-slate-950 dark:to-teal-950">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 flex-none items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
          <UserRound className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Profile
          </p>
          <h1 className="truncate text-2xl font-extrabold">Ryan's HomeStock</h1>
          {email ? <p className="truncate text-sm font-medium text-white/75">{email}</p> : null}
        </div>
      </div>
    </section>

    <section className="space-y-2" aria-label="Profile controls">
      <ControlButton
        icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
        title="Reset password"
        detail="Open the secure password update flow"
        onClick={onChangePassword}
      />
      <ControlButton
        icon={<Tag className="h-5 w-5" aria-hidden="true" />}
        title="Inventory categories"
        detail={`${inventoryCategoryCount} stock buckets`}
        onClick={onManageInventoryCategories}
      />
      <ControlButton
        icon={<WalletCards className="h-5 w-5" aria-hidden="true" />}
        title="Finance categories"
        detail={`${financeCategoryCount} income and expense buckets`}
        onClick={onManageFinanceCategories}
      />
      <ControlButton
        icon={darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
        title={darkMode ? "Light mode" : "Dark mode"}
        detail={darkMode ? "Switch to the brighter app theme" : "Switch to the low-light app theme"}
        onClick={onToggleDarkMode}
      />
      <ControlButton
        danger
        icon={<LogOut className="h-5 w-5" aria-hidden="true" />}
        title="Sign out"
        detail="Leave this device signed out"
        onClick={onSignOut}
      />
    </section>
  </div>
);

const ControlButton = ({
  danger,
  detail,
  icon,
  onClick,
  title,
}: {
  danger?: boolean;
  detail: string;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-card transition active:scale-[0.99] dark:bg-slate-900 ${
      danger
        ? "border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/30"
        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70"
    }`}
  >
    <span
      className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl ${
        danger
          ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
          : "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"
      }`}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className={`block text-sm font-extrabold ${danger ? "text-rose-700 dark:text-rose-200" : "text-slate-900 dark:text-white"}`}>
        {title}
      </span>
      <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
        {detail}
      </span>
    </span>
  </button>
);
