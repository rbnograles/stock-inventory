-- Adds operational expense funds and drawdown links to finance transactions.
-- A fund is the up-front expense taken from income; assigned drawdowns spend
-- against that fund without being counted again in cash-flow summaries.

alter table public.finance_transactions
  add column if not exists is_operational_fund boolean not null default false,
  add column if not exists operational_fund_id uuid references public.finance_transactions(id) on delete set null,
  add column if not exists operational_period_start date,
  add column if not exists operational_period_end date;

create index if not exists finance_transactions_operational_fund_idx
  on public.finance_transactions(operational_fund_id);

create index if not exists finance_transactions_operational_window_idx
  on public.finance_transactions(user_id, operational_period_start, operational_period_end)
  where is_operational_fund = true;

alter table public.finance_transactions
  drop constraint if exists finance_transactions_operational_kind_check;

alter table public.finance_transactions
  add constraint finance_transactions_operational_kind_check
  check (
    (
      is_operational_fund = false
      and (
        operational_fund_id is null
        or kind = 'expense'
      )
      and (
        operational_period_start is null
        or kind = 'expense'
      )
    )
    or (
      is_operational_fund = true
      and kind = 'expense'
      and operational_fund_id is null
      and operational_period_start is not null
      and operational_period_end is not null
      and operational_period_end >= operational_period_start
    )
  );
