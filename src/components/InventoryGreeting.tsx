/**
 * Compact welcome line above the inventory digest. Single row with a small
 * waving icon and a time-aware salutation that uses the user's display name
 * (set via Profile → name editor). Intentionally light so it doesn't compete
 * with the digest card directly below.
 */
import { Sparkles } from "lucide-react";

interface InventoryGreetingProps {
  displayName: string;
}

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Night check";
};

export const InventoryGreeting = ({ displayName }: InventoryGreetingProps) => (
  <p
    aria-label="Greeting"
    className="flex items-center gap-1.5 pb-2 px-1 text-sm font-bold hs-text-secondary"
  >
    <Sparkles className="h-3.5 w-3.5 flex-none text-teal-500 dark:text-teal-300" aria-hidden="true" />
    <span className="truncate">
      {timeGreeting()},{" "}
      <span className="capitalize text-slate-900 dark:text-white">{displayName}!</span>
    </span>
  </p>
);
