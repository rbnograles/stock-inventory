/**
 * Hero status card. Replaces the static summary strip and "consume soon"
 * banner with one tappable surface that shifts state and CTA based on what
 * needs the user's attention right now.
 */
import { ChevronRight, PartyPopper, Sparkles, TriangleAlert } from "lucide-react";
import { getExpiryStatus } from "@/lib/expiry";
import type { InventoryItem } from "@/types/inventory";

interface AttentionCardProps {
  items: InventoryItem[];
  totalUnits: number;
  attentionActive: boolean;
  onToggleAttention: () => void;
}

export const AttentionCard = ({
  items,
  totalUnits,
  attentionActive,
  onToggleAttention,
}: AttentionCardProps) => {
  const expired = items.filter((item) => getExpiryStatus(item.expiryDate) === "expired").length;
  const soon = items.filter((item) => getExpiryStatus(item.expiryDate) === "soon").length;
  const attention = expired + soon;

  const tone = expired > 0 ? "rose" : soon > 0 ? "amber" : "teal";

  const palette = {
    rose: {
      gradient: "from-rose-500 to-pink-500",
      icon: TriangleAlert,
      label: "Needs attention",
      value: String(attention),
      valueSuffix: attention === 1 ? "item" : "items",
      subtitle:
        expired > 0 && soon > 0
          ? `${expired} expired · ${soon} expiring soon`
          : expired > 0
            ? `${expired} expired`
            : `${soon} expiring soon`,
      cta: attentionActive ? "Showing only attention" : "Tap to review",
      showTrailing: true,
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      icon: Sparkles,
      label: "Use up soon",
      value: String(soon),
      valueSuffix: soon === 1 ? "item" : "items",
      subtitle: `Expiring within 14 days`,
      cta: attentionActive ? "Showing only attention" : "Tap to review",
      showTrailing: true,
    },
    teal: {
      gradient: "from-teal-500 to-cyan-500",
      icon: PartyPopper,
      label: "All caught up",
      value: "Nothing expiring",
      valueSuffix: "",
      subtitle: items.length === 0
        ? "Add your first item to get started"
        : `${items.length} item${items.length === 1 ? "" : "s"} · ${totalUnits} unit${totalUnits === 1 ? "" : "s"} on hand`,
      cta: "Keep up the streak",
      showTrailing: false,
    },
  }[tone];

  const Icon = palette.icon;
  const isInteractive = attention > 0;

  const inner = (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${palette.gradient} p-5 text-white shadow-soft transition-transform ${
        isInteractive ? "active:scale-[0.98]" : ""
      } ${attentionActive ? "ring-2 ring-white/60 ring-offset-2 ring-offset-teal-50 dark:ring-offset-slate-950" : ""}`}
    >
      <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <Icon className="h-7 w-7 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
            {palette.label}
          </p>
          <p className="flex items-baseline gap-1.5 text-2xl font-extrabold leading-tight text-white">
            <span>{palette.value}</span>
            {palette.valueSuffix ? (
              <span className="text-sm font-semibold text-white/85">{palette.valueSuffix}</span>
            ) : null}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-white/90">{palette.subtitle}</p>
        </div>
        {isInteractive ? (
          <ChevronRight
            className={`h-5 w-5 flex-none text-white/80 transition ${attentionActive ? "rotate-90" : ""}`}
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="relative mt-4 flex items-center justify-between text-xs font-semibold text-white/90">
        <span>{palette.cta}</span>
        {palette.showTrailing ? (
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            {items.length} total
          </span>
        ) : null}
      </div>
    </div>
  );

  if (!isInteractive) {
    return <section aria-label="Inventory status">{inner}</section>;
  }

  return (
    <button
      type="button"
      aria-pressed={attentionActive}
      aria-label={
        attentionActive
          ? "Clear attention filter and show all items"
          : `Show ${attention} item${attention === 1 ? "" : "s"} that need attention`
      }
      className="block w-full text-left"
      onClick={onToggleAttention}
    >
      {inner}
    </button>
  );
};
