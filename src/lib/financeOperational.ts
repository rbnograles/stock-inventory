/**
 * Operational expense helpers. A fund transaction is the money set aside from
 * income for a short operating period; assigned expense transactions draw down
 * that fund and do not count again in cash-flow totals.
 */
import type { Transaction } from "@/types/finance";

export const OPERATIONAL_PERIOD_DAYS = 14;

export interface OperationalFundSummary {
  fund: Transaction;
  spent: number;
  remaining: number;
  percentUsed: number;
  drawdowns: Transaction[];
}

const addDaysIso = (iso: string, days: number) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const defaultOperationalPeriodEnd = (startIso: string) =>
  addDaysIso(startIso, OPERATIONAL_PERIOD_DAYS - 1);

export const isOperationalDrawdown = (transaction: Transaction) =>
  transaction.kind === "expense" && Boolean(transaction.operationalFundId);

export const countsAgainstCashFlow = (transaction: Transaction) =>
  transaction.kind === "income" || !isOperationalDrawdown(transaction);

export const getOperationalFundSummaries = (
  transactions: Transaction[],
  referenceIso = new Date().toISOString().slice(0, 10),
): OperationalFundSummary[] => {
  const funds = transactions
    .filter((entry) => entry.kind === "expense" && entry.isOperationalFund)
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));

  return funds.map((fund) => {
    const drawdowns = transactions.filter((entry) => entry.operationalFundId === fund.id);
    const spent = drawdowns.reduce((sum, entry) => sum + entry.amount, 0);
    const remaining = Math.max(0, fund.amount - spent);
    const percentUsed = fund.amount > 0 ? Math.min(100, Math.round((spent / fund.amount) * 100)) : 0;
    const start = fund.operationalPeriodStart ?? fund.occurredOn;
    const end = fund.operationalPeriodEnd ?? defaultOperationalPeriodEnd(start);
    return {
      fund: { ...fund, operationalPeriodStart: start, operationalPeriodEnd: end },
      spent,
      remaining,
      percentUsed,
      drawdowns,
    };
  }).filter(({ fund }) => (fund.operationalPeriodEnd ?? fund.occurredOn) >= referenceIso);
};
