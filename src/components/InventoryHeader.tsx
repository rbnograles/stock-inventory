/**
 * Owns the sticky mobile header and utility actions. Keeping it separate from
 * the dashboard logic makes the app shell easy to adjust later for install
 * prompts, sync status, or account controls.
 */
import { IconButton } from "@/lib/material";
import { Moon, RefreshCw, Sun } from "lucide-react";

interface InventoryHeaderProps {
  darkMode: boolean;
  onRefresh: () => void;
  onToggleDarkMode: () => void;
}

export const InventoryHeader = ({ darkMode, onRefresh, onToggleDarkMode }: InventoryHeaderProps) => (
  <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
    <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">HomeStock</p>
        <h1 className="text-2xl font-black leading-tight">Inventory</h1>
      </div>
      <div className="flex items-center gap-1">
        <IconButton variant="text" color="blue-gray" aria-label="Refresh inventory" onClick={onRefresh}>
          <RefreshCw className="h-5 w-5 dark:text-white" aria-hidden="true" />
        </IconButton>
        <IconButton variant="text" color="blue-gray" aria-label="Toggle dark mode" onClick={onToggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5" />}
        </IconButton>
      </div>
    </div>
  </header>
);
