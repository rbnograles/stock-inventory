/**
 * Segmented control for switching the inventory list between row and card
 * layouts. Kept as a tiny standalone piece so the dashboard can drop it next
 * to filter affordances without coupling state to InventoryControls.
 */
import { LayoutGrid, Rows3 } from "lucide-react";
import type { InventoryViewMode } from "@/components/CategorySection";

interface ViewToggleProps {
  mode: InventoryViewMode;
  onChange: (next: InventoryViewMode) => void;
}

export const ViewToggle = ({ mode, onChange }: ViewToggleProps) => (
  <div
    role="radiogroup"
    aria-label="Inventory view"
    className="inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
  >
    <ToggleButton
      active={mode === "list"}
      onClick={() => onChange("list")}
      label="List view"
      icon={<Rows3 className="h-4 w-4" aria-hidden="true" />}
    />
    <ToggleButton
      active={mode === "cards"}
      onClick={() => onChange("cards")}
      label="Card view"
      icon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}
    />
  </div>
);

const ToggleButton = ({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    aria-label={label}
    onClick={onClick}
    className={`flex h-7 w-8 items-center justify-center rounded-full transition ${
      active
        ? "bg-teal-500 text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    }`}
  >
    {icon}
  </button>
);
