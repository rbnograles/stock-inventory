/**
 * Adds a lightweight welcome line above the inventory status card. It gives
 * the dashboard a human entry point after the top navbar was removed, while
 * keeping the working surface focused on stock state and quick actions.
 */
import { Sparkles } from "lucide-react";

interface InventoryGreetingProps {
  email?: string;
  itemCount: number;
  totalUnits: number;
}

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Still checking stock, Ryan?";
  if (hour < 12) return "Good morning, Ryan";
  if (hour < 17) return "Good afternoon, Ryan";
  if (hour < 22) return "Good evening, Ryan";
  return "Night stock check, Ryan";
};

const shortEmail = (email?: string) => email?.split("@")[0] ?? "HomeStock";

export const InventoryGreeting = ({ email, itemCount, totalUnits }: InventoryGreetingProps) => (
  <section className="flex items-center justify-between gap-3 px-1 pt-1" aria-label="Inventory greeting">
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
        {shortEmail(email)}
      </p>
      <h1 className="truncate text-2xl font-extrabold leading-tight text-slate-950 dark:text-white">
        {timeGreeting()}
      </h1>
      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
        {itemCount} product{itemCount === 1 ? "" : "s"} tracked · {totalUnits} unit
        {totalUnits === 1 ? "" : "s"} on hand
      </p>
    </div>
    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-teal-100 text-teal-700 shadow-card dark:bg-teal-500/15 dark:text-teal-300">
      <Sparkles className="h-5 w-5" aria-hidden="true" />
    </span>
  </section>
);
