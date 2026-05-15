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
      value: attention,
      subtitle:
        expired > 0 && soon > 0
          ? `${expired} expired · ${soon} expiring soon`
          : expired > 0
            ? `${expired} item${expired === 1 ? "" : "s"} expired`
            : `${soon} expiring soon`,
      cta: attentionActive ? "Showing only attention items" : "Tap to review",
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      icon: Sparkles,
      label: "Use up soon",
      value: soon,
      subtitle: `${soon} item${soon === 1 ? "" : "s"} expiring within 14 days`,
      cta: attentionActive ? "Showing only attention items" : "Tap to review",
    },
    teal: {
      gradient: "from-teal-500 to-cyan-500",
      icon: PartyPopper,
      label: "Fresh & stocked",
      value: items.length,
      subtitle: `${totalUnits} unit${totalUnits === 1 ? "" : "s"} on hand · all looking good`,
      cta: "Keep up the streak",
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
          <p className="text-3xl font-extrabold leading-none text-white">{palette.value}</p>
          <p className="mt-1 truncate text-sm font-medium text-white/90">{palette.subtitle}</p>
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
        <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
          {items.length} tracked
        </span>
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
