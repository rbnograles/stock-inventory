/**
 * Persistent bottom bar with four app-level destinations around a centered
 * contextual Add button. The middle action can float slightly while Inventory,
 * Finance, Insights, and Profile keep the navigation balanced.
 */
import { Boxes, Plus, TrendingUp, UserRound, Wallet } from "lucide-react";

export type AppView = "inventory" | "finance" | "insights" | "profile";

interface BottomNavProps {
  view: AppView;
  onChangeView: (next: AppView) => void;
  onAdd: () => void;
}

export const BottomNav = ({ view, onChangeView, onAdd }: BottomNavProps) => {
  const addLabel = view === "finance" ? "Add money" : "Add item";

  return (
    <nav
      aria-label="Primary navigation"
      className="safe-pb fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-3 pt-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"
    >
      <div className="relative mx-auto grid max-w-lg grid-cols-[1fr_1fr_72px_1fr_1fr] items-end gap-1">
        <TabButton
          active={view === "inventory"}
          onClick={() => onChangeView("inventory")}
          icon={<Boxes className="h-5 w-5" aria-hidden="true" />}
          label="Inventory"
        />

        <TabButton
          active={view === "finance"}
          onClick={() => onChangeView("finance")}
          icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
          label="Finance"
        />

        <span className="h-14" aria-hidden="true" />

        <button
          type="button"
          onClick={onAdd}
          aria-label={addLabel}
          className="absolute left-1/2 top-1 flex h-14 w-14 -translate-x-1/2 -translate-y-5 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 text-white shadow-soft ring-4 ring-white transition active:scale-95 hover:brightness-110 dark:ring-slate-950"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>

        <TabButton
          active={view === "insights"}
          onClick={() => onChangeView("insights")}
          icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
          label="Insights"
        />

        <TabButton
          active={view === "profile"}
          onClick={() => onChangeView("profile")}
          icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
          label="Profile"
        />
      </div>
    </nav>
  );
};

const TabButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`flex h-14 flex-col items-center justify-center gap-1 rounded-2xl transition active:scale-[0.98] ${
      active ? "text-teal-600 dark:text-teal-300" : "text-slate-500 dark:text-slate-400"
    }`}
  >
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
        active ? "bg-teal-100 dark:bg-teal-500/20" : ""
      }`}
    >
      {icon}
    </span>
    <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{label}</span>
  </button>
);
