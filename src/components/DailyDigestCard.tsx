/**
 * "Today's check-in" — replaces the always-on Attention hero with up to three
 * actionable digest rows that adapt to the actual inventory state, then a
 * compact stats footer. The card always renders: urgent states become tap
 * targets, empty stock becomes onboarding, and healthy inventory gets an
 * all-clear row so the dashboard never has a missing daily checkpoint.
 */
import { type ReactNode } from "react";
import { ChevronRight, Plus, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { emojiForCategory, toneForCategory } from "@/lib/categoryVisuals";
import { getExpiryLabel, getExpiryStatus, sortByExpiryPriority } from "@/lib/expiry";
import type { Category } from "@/types/category";
import type { InventoryItem } from "@/types/inventory";

interface DailyDigestCardProps {
  items: InventoryItem[];
  totalUnits: number;
  categories: Category[];
  attentionActive: boolean;
  isLoading?: boolean;
  onToggleAttention: () => void;
  onOpenItem: (item: InventoryItem) => void;
  onAddItem: () => void;
}

type DigestEntry =
  | { id: string; kind: "expired-summary"; count: number }
  | { id: string; kind: "missing-expiry"; count: number }
  | { id: string; kind: "item"; item: InventoryItem; eyebrow: string };

const buildDigest = (items: InventoryItem[]): DigestEntry[] => {
  const entries: DigestEntry[] = [];
  const expired = items.filter((item) => getExpiryStatus(item.expiryDate) === "expired");
  const soon = items.filter((item) => getExpiryStatus(item.expiryDate) === "soon");
  const noExpiry = items.filter((item) => !item.expiryDate);

  if (expired.length > 0) {
    entries.push({ id: "expired", kind: "expired-summary", count: expired.length });
  }

  const soonest = sortByExpiryPriority(soon).slice(0, 2);
  for (const item of soonest) {
    if (entries.length >= 3) break;
    entries.push({ id: `soon:${item.id}`, kind: "item", item, eyebrow: "Use soon" });
  }

  if (entries.length < 3 && noExpiry.length > 0 && items.length > 1) {
    entries.push({ id: "missing", kind: "missing-expiry", count: noExpiry.length });
  }

  return entries.slice(0, 3);
};

export const DailyDigestCard = ({
  items,
  totalUnits,
  categories,
  attentionActive,
  isLoading = false,
  onToggleAttention,
  onOpenItem,
  onAddItem,
}: DailyDigestCardProps) => {
  const totalItems = items.length;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (totalItems === 0) {
    return <OnboardingCard onAddItem={onAddItem} />;
  }

  const digest = buildDigest(items);
  const expired = items.filter((item) => getExpiryStatus(item.expiryDate) === "expired").length;
  const soon = items.filter((item) => getExpiryStatus(item.expiryDate) === "soon").length;

  return (
    <section className="hs-surface px-5 pb-4 pt-5 mb-2" aria-label="Today's check-in">
      <header className="flex items-center justify-between gap-2">
        <p className="hs-eyebrow">Today's check-in</p>
        <StatusBadge expired={expired} soon={soon} />
      </header>

      <ul className="mt-3 space-y-1">
        {digest.length === 0 ? (
          <DigestSummaryRow
            icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            tint="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            title="All clear for today"
            subtitle="No expired or use-soon items need review"
            onClick={onAddItem}
          />
        ) : (
          digest.map((entry) => {
            if (entry.kind === "expired-summary") {
              return (
                <DigestSummaryRow
                  key={entry.id}
                  icon={<TriangleAlert className="h-5 w-5" aria-hidden="true" />}
                  tint="bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                  title={`${entry.count} item${entry.count === 1 ? "" : "s"} expired`}
                  subtitle={attentionActive ? "Tap again to clear the filter" : "Tap to review and clean up"}
                  onClick={onToggleAttention}
                />
              );
            }

            if (entry.kind === "missing-expiry") {
              return (
                <DigestSummaryRow
                  key={entry.id}
                  icon={<Plus className="h-5 w-5" aria-hidden="true" />}
                  tint="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  title={`Add expiry to ${entry.count} item${entry.count === 1 ? "" : "s"}`}
                  subtitle="Helps surface what to use first"
                  onClick={() => {
                    const target = items.find((item) => !item.expiryDate);
                    if (target) onOpenItem(target);
                  }}
                />
              );
            }

            return (
              <DigestItemRow
                key={entry.id}
                item={entry.item}
                eyebrow={entry.eyebrow}
                categories={categories}
                onClick={() => onOpenItem(entry.item)}
              />
            );
          })
        )}
      </ul>
    </section>
  );
};

/* — Sub-rows — */

const StatusBadge = ({ expired, soon }: { expired: number; soon: number }) => {
  if (expired > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
        {expired} expired
      </span>
    );
  }
  if (soon > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
        {soon} soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      All clear
    </span>
  );
};

const LoadingSkeleton = () => (
  <div
    aria-busy="true"
    aria-label="Loading inventory"
    className="hs-surface flex items-center gap-3 px-4 py-4"
  >
    <span className="h-10 w-10 flex-none animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
    <div className="flex-1 space-y-2">
      <span className="block h-3 w-1/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
      <span className="block h-3 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
    </div>
  </div>
);

const DigestSummaryRow = ({
  icon,
  tint,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  tint: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition active:scale-[0.99] hover:bg-slate-50 dark:hover:bg-slate-800/40"
    >
      <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${tint}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold hs-text-primary">{title}</p>
        <p className="truncate text-xs font-medium hs-text-muted">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 flex-none text-slate-400 dark:text-slate-500" aria-hidden="true" />
    </button>
  </li>
);

const DigestItemRow = ({
  item,
  eyebrow,
  categories,
  onClick,
}: {
  item: InventoryItem;
  eyebrow: string;
  categories: Category[];
  onClick: () => void;
}) => {
  const tone = toneForCategory(item.category);
  const categoryEmoji = emojiForCategory(item.category, categories);
  const initials = item.name.slice(0, 2).toUpperCase();
  const status = getExpiryStatus(item.expiryDate);
  const dateCopy = getExpiryLabel(item);

  const statusDot =
    status === "expired"
      ? "bg-rose-500"
      : status === "soon"
        ? "bg-amber-500"
        : status === "healthy"
          ? "bg-emerald-500"
          : "bg-slate-400";

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition active:scale-[0.99] hover:bg-slate-50 dark:hover:bg-slate-800/40"
      >
        {item.photoDataUrl ? (
          <img className="h-10 w-10 flex-none rounded-2xl object-cover" src={item.photoDataUrl} alt="" loading="lazy" />
        ) : (
          <div className={`relative flex h-10 w-10 flex-none items-center justify-center rounded-2xl text-xs font-extrabold ${tone.avatarBg} ${tone.avatarText}`}>
            {initials}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700" aria-hidden="true">
              {categoryEmoji}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600 dark:text-teal-300">
            {eyebrow}
          </p>
          <p className="truncate text-sm font-bold hs-text-primary">{item.name}</p>
          <p className="flex items-center gap-1.5 truncate text-xs font-medium hs-text-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
            {dateCopy}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 flex-none text-slate-400 dark:text-slate-500" aria-hidden="true" />
      </button>
    </li>
  );
};

const OnboardingCard = ({ onAddItem }: { onAddItem: () => void }) => (
  <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 p-5 text-white shadow-soft">
    <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
    <span className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
    <div className="relative flex items-center gap-3">
      <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/25 ring-1 ring-white/30 backdrop-blur">
        <Sparkles className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">Welcome</p>
        <h2 className="text-xl font-extrabold leading-tight">Start your pantry</h2>
        <p className="mt-0.5 text-sm font-medium text-white/85">
          Add your first item to begin tracking expiry, location, and quantity.
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onAddItem}
      className="relative mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-teal-700 shadow-sm transition active:scale-[0.98] hover:bg-white/90"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add first item
    </button>
  </section>
);

const Dot = () => <span aria-hidden="true">·</span>;
