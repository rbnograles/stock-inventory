/**
 * Per-tab loading skeletons. Each one mirrors the real layout closely enough
 * that the page doesn't reflow when data arrives — so the user sees motion in
 * the right places without a layout shift. Built from a single `Block` primitive
 * (a pulsing rounded rectangle) plus tab-specific composition wrappers.
 */
import type { CSSProperties } from "react";

const Block = ({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => (
  <span
    aria-hidden="true"
    style={style}
    className={`block animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800 ${className}`}
  />
);

const SectionShell = ({ children }: { children: React.ReactNode }) => (
  <section className="hs-surface p-4">{children}</section>
);

const HeroShell = ({ children }: { children: React.ReactNode }) => (
  <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-200 via-slate-200 to-slate-300 p-4 shadow-soft dark:from-slate-800 dark:via-slate-800 dark:to-slate-700">
    <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl dark:bg-white/5" />
    <span className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-white/15 blur-2xl dark:bg-white/5" />
    <div className="relative">{children}</div>
  </section>
);

const DigestRowSkeleton = () => (
  <li className="flex items-center gap-3 px-2 py-2">
    <Block className="h-10 w-10 flex-none rounded-2xl" />
    <div className="flex-1 space-y-1.5">
      <Block className="h-2.5 w-1/3 rounded-full" />
      <Block className="h-3 w-2/3 rounded-full" />
    </div>
    <Block className="h-3 w-3 flex-none rounded-full" />
  </li>
);

const ItemRowSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-2.5">
    <Block className="h-11 w-11 flex-none rounded-2xl" />
    <div className="flex-1 space-y-1.5">
      <Block className="h-3 w-3/5 rounded-full" />
      <Block className="h-2.5 w-2/5 rounded-full" />
    </div>
    <Block className="h-3 w-12 flex-none rounded-full" />
  </div>
);

const ChipSkeleton = ({ width }: { width: number }) => (
  <Block className="h-9 flex-none rounded-full" style={{ width: `${width}px` }} />
);

/* ──────────────── Inventory ──────────────── */

export const InventorySkeleton = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading inventory"
    className="space-y-5 mt-2"
  >
    <Block className="h-3.5 w-40 rounded-full" />

    <SectionShell>
      <div className="flex items-center justify-between">
        <Block className="h-3 w-24 rounded-full" />
        <Block className="h-5 w-20 rounded-full" />
      </div>
      <ul className="mt-3 space-y-1">
        <DigestRowSkeleton />
        <DigestRowSkeleton />
        <DigestRowSkeleton />
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <Block className="h-3 w-32 rounded-full" />
      </div>
    </SectionShell>

    <div className="space-y-2">
      <Block className="h-11 w-full rounded-2xl" />
      <div className="-mx-4 flex gap-2 overflow-hidden px-4">
        <ChipSkeleton width={80} />
        <ChipSkeleton width={110} />
        <ChipSkeleton width={90} />
        <ChipSkeleton width={120} />
      </div>
    </div>

    {[0, 1].map((idx) => (
      <section key={idx} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Block className="h-3 w-28 rounded-full" />
          <Block className="h-3 w-10 rounded-full" />
        </div>
        <div className="hs-surface hs-divider">
          <ItemRowSkeleton />
          <ItemRowSkeleton />
          <ItemRowSkeleton />
        </div>
      </section>
    ))}
  </div>
);

/* ──────────────── Finance ──────────────── */

export const FinanceSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading finance" className="space-y-4 mt-2">
    <HeroShell>
      <div className="flex items-center justify-between">
        <Block className="h-8 w-8 rounded-full" />
        <Block className="h-3 w-28 rounded-full" />
        <Block className="h-8 w-8 rounded-full" />
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        <Block className="h-11 w-11 flex-none rounded-2xl" />
        <div className="flex-1 space-y-1.5">
          <Block className="h-2.5 w-20 rounded-full" />
          <Block className="h-6 w-3/4 rounded-full" />
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        <Block className="h-12 rounded-xl" />
        <Block className="h-12 rounded-xl" />
      </div>
    </HeroShell>

    <SectionShell>
      <Block className="h-3 w-40 rounded-full" />
      <ul className="mt-3 space-y-2.5">
        {[60, 80, 70].map((width, idx) => (
          <li key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Block className="h-3 w-32 rounded-full" />
              <Block className="h-3 w-16 rounded-full" />
            </div>
            <Block className="h-1.5 rounded-full" style={{ width: `${width}%` }} />
          </li>
        ))}
      </ul>
    </SectionShell>

    <div className="flex items-center gap-2">
      <Block className="h-12 flex-1 rounded-2xl" />
      <Block className="h-12 w-24 flex-none rounded-2xl" />
    </div>

    <div className="-mx-4 flex gap-2 overflow-hidden px-4">
      <ChipSkeleton width={90} />
      <ChipSkeleton width={70} />
      <ChipSkeleton width={100} />
      <ChipSkeleton width={80} />
    </div>

    {[0, 1].map((idx) => (
      <section key={idx} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Block className="h-3 w-24 rounded-full" />
          <Block className="h-3 w-12 rounded-full" />
        </div>
        <div className="hs-surface hs-divider">
          <ItemRowSkeleton />
          <ItemRowSkeleton />
        </div>
      </section>
    ))}
  </div>
);

/* ──────────────── Insights ──────────────── */

export const InsightsSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading insights" className="space-y-5 mt-2">
    <HeroShell>
      <div className="flex items-center gap-3">
        <Block className="h-14 w-14 flex-none rounded-2xl" />
        <div className="flex-1 space-y-1.5">
          <Block className="h-2.5 w-32 rounded-full" />
          <Block className="h-6 w-3/4 rounded-full" />
          <Block className="h-3 w-1/2 rounded-full" />
        </div>
      </div>
    </HeroShell>

    <SectionShell>
      <div className="flex items-center justify-between">
        <Block className="h-4 w-32 rounded-full" />
        <Block className="h-3 w-20 rounded-full" />
      </div>
      <Block className="mt-4 h-8 w-32 rounded-full" />
      <Block className="mt-3 h-2.5 w-full rounded-full" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Block className="h-9 rounded-xl" />
        <Block className="h-9 rounded-xl" />
        <Block className="h-9 rounded-xl" />
        <Block className="h-9 rounded-xl" />
      </div>
    </SectionShell>

    <SectionShell>
      <div className="flex items-center justify-between">
        <Block className="h-4 w-28 rounded-full" />
        <Block className="h-3 w-20 rounded-full" />
      </div>
      <Block className="mt-4 h-8 w-40 rounded-full" />
      <Block className="mt-3 h-2.5 w-full rounded-full" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Block className="h-12 rounded-xl" />
        <Block className="h-12 rounded-xl" />
      </div>
    </SectionShell>

    <SectionShell>
      <Block className="h-4 w-32 rounded-full" />
      <ul className="mt-4 space-y-3">
        {[60, 80, 45, 70].map((width, idx) => (
          <li key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Block className="h-3 w-28 rounded-full" />
              <Block className="h-3 w-16 rounded-full" />
            </div>
            <Block className="h-1.5 rounded-full" style={{ width: `${width}%` }} />
          </li>
        ))}
      </ul>
    </SectionShell>
  </div>
);

/* ──────────────── Profile ──────────────── */

export const ProfileSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading profile" className="space-y-4 mt-2">
    <HeroShell>
      <div className="flex items-center gap-4">
        <Block className="h-16 w-16 flex-none rounded-3xl" />
        <div className="flex-1 space-y-1.5">
          <Block className="h-2.5 w-16 rounded-full" />
          <Block className="h-6 w-2/3 rounded-full" />
          <Block className="h-3 w-1/2 rounded-full" />
        </div>
      </div>
    </HeroShell>

    {[0, 1, 2].map((section) => (
      <div key={section} className="space-y-2">
        <Block className="ml-1 h-3 w-20 rounded-full" />
        <SectionShell>
          {[0, 1].map((row) => (
            <div key={row} className="flex items-center gap-3 py-2">
              <Block className="h-11 w-11 flex-none rounded-2xl" />
              <div className="flex-1 space-y-1.5">
                <Block className="h-3 w-2/5 rounded-full" />
                <Block className="h-2.5 w-3/5 rounded-full" />
              </div>
              <Block className="h-4 w-4 flex-none rounded-full" />
            </div>
          ))}
        </SectionShell>
      </div>
    ))}
  </div>
);
