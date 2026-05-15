/**
 * Provides the account and app-control workspace after removing the top navbar.
 * It keeps password reset, category managers, theme switching, and sign-out in
 * one bottom-tab destination so every control remains reachable on mobile.
 */
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, CircleDollarSign, KeyRound, LogOut, Moon, Pencil, Sun, Tag, UserRound, WalletCards, X } from "lucide-react";
import { CURRENCY_OPTIONS } from "@/lib/money";

interface ProfileDashboardProps {
  darkMode: boolean;
  email?: string;
  displayName: string;
  storedDisplayName: string;
  inventoryCategoryCount: number;
  financeCategoryCount: number;
  currency: string;
  onCurrencyChange: (code: string) => void;
  onChangePassword: () => void;
  onSaveDisplayName: (name: string) => Promise<void>;
  onManageInventoryCategories: () => void;
  onManageFinanceCategories: () => void;
  onSignOut: () => void;
  onToggleDarkMode: () => void;
}

export const ProfileDashboard = ({
  darkMode,
  email,
  displayName,
  storedDisplayName,
  inventoryCategoryCount,
  financeCategoryCount,
  currency,
  onCurrencyChange,
  onChangePassword,
  onSaveDisplayName,
  onManageInventoryCategories,
  onManageFinanceCategories,
  onSignOut,
  onToggleDarkMode,
}: ProfileDashboardProps) => {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(storedDisplayName);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const activeCurrency = CURRENCY_OPTIONS.find((option) => option.code === currency);

  useEffect(() => {
    if (editingName) {
      setDraftName(storedDisplayName);
      setNameError(null);
      requestAnimationFrame(() => nameInputRef.current?.select());
    }
  }, [editingName, storedDisplayName]);

  const cancelNameEdit = () => {
    if (savingName) return;
    setEditingName(false);
    setNameError(null);
  };

  const submitName = async () => {
    if (savingName) return;
    setSavingName(true);
    setNameError(null);
    try {
      await onSaveDisplayName(draftName);
      setEditingName(false);
    } catch (error) {
      setNameError(error instanceof Error ? error.message : "Could not save name");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="space-y-4 mt-2">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 p-5 text-white shadow-soft">
        <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-3xl bg-white/25 text-white backdrop-blur ring-1 ring-white/30">
            <UserRound className="h-8 w-8" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">Profile</p>
            {editingName ? (
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={draftName}
                  maxLength={60}
                  placeholder="Your name"
                  aria-label="Display name"
                  onChange={(event) => setDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void submitName();
                    } else if (event.key === "Escape") {
                      cancelNameEdit();
                    }
                  }}
                  disabled={savingName}
                  className="min-w-0 flex-1 rounded-xl bg-white/20 px-3 py-1.5 text-lg font-extrabold text-white placeholder:text-white/60 ring-1 ring-white/30 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/70 disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label="Save name"
                  onClick={() => void submitName()}
                  disabled={savingName}
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-teal-700 shadow-sm transition disabled:opacity-60"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Cancel"
                  onClick={cancelNameEdit}
                  disabled={savingName}
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition disabled:opacity-60"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="group mt-0.5 flex w-full items-center gap-1.5 text-left"
              >
                <h1 className="truncate text-2xl font-extrabold capitalize">{displayName}</h1>
                <Pencil
                  className="h-3.5 w-3.5 flex-none text-white/70 opacity-0 transition group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="sr-only">Edit display name</span>
              </button>
            )}
            {nameError ? (
              <p className="mt-1 truncate text-xs font-semibold text-rose-100">{nameError}</p>
            ) : email ? (
              <p className="truncate text-sm font-medium text-white/85">{email}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-label="Account">
        <p className="px-1 hs-eyebrow">Account</p>
        <div className="mt-2 hs-surface hs-divider">
          <ControlButton
            icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
            title="Reset password"
            detail="Open the secure password update flow"
            onClick={onChangePassword}
          />
          <ControlButton
            icon={darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            title={darkMode ? "Light mode" : "Dark mode"}
            detail={darkMode ? "Switch to the brighter app theme" : "Switch to the low-light app theme"}
            onClick={onToggleDarkMode}
          />
        </div>
      </section>

      <section aria-label="Workspace">
        <p className="px-1 hs-eyebrow">Workspace</p>
        <div className="mt-2 hs-surface hs-divider">
          <ControlButton
            icon={<Tag className="h-5 w-5" aria-hidden="true" />}
            title="Inventory categories"
            detail={`${inventoryCategoryCount} stock bucket${inventoryCategoryCount === 1 ? "" : "s"}`}
            onClick={onManageInventoryCategories}
          />
          <ControlButton
            icon={<WalletCards className="h-5 w-5" aria-hidden="true" />}
            title="Finance categories"
            detail={`${financeCategoryCount} income and expense bucket${financeCategoryCount === 1 ? "" : "s"}`}
            onClick={onManageFinanceCategories}
          />
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
              <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <label htmlFor="profile-currency" className="block text-sm font-extrabold hs-text-primary">
                Currency
              </label>
              <p className="block truncate text-xs font-medium hs-text-muted">
                {activeCurrency ? `${activeCurrency.symbol} ${activeCurrency.label}` : "Set how amounts are formatted"}
              </p>
            </div>
            <div className="relative flex-none">
              <select
                id="profile-currency"
                value={currency}
                onChange={(event) => onCurrencyChange(event.target.value)}
                aria-label="Display currency"
                className="h-10 appearance-none rounded-xl bg-slate-100 pl-3 pr-9 text-sm font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Session">
        <p className="px-1 hs-eyebrow">Session</p>
        <div className="mt-2 hs-surface hs-divider">
          <ControlButton
            danger
            icon={<LogOut className="h-5 w-5" aria-hidden="true" />}
            title="Sign out"
            detail="Leave this device signed out"
            onClick={onSignOut}
          />
        </div>
      </section>
    </div>
  );
};

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
    className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-slate-100/60 dark:active:bg-slate-800/60"
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
      <span className={`block text-sm font-extrabold ${danger ? "text-rose-700 dark:text-rose-200" : "hs-text-primary"}`}>
        {title}
      </span>
      <span className="block truncate text-xs font-medium hs-text-muted">{detail}</span>
    </span>
    <ChevronRight className="h-4 w-4 flex-none text-slate-400 dark:text-slate-500" aria-hidden="true" />
  </button>
);
