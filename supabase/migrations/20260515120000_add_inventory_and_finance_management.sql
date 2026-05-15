-- Adds user-managed inventory categories plus finance categories/transactions.
-- These tables are intentionally user-scoped through auth.uid() so the React
-- app can manage household stock and personal cash flow without exposing rows
-- across accounts.

create extension if not exists pgcrypto;

alter table public.inventory_items
  drop constraint if exists inventory_items_category_check;

create table if not exists public.inventory_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) > 0),
  emoji text not null default 'box',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) > 0),
  emoji text not null default 'money',
  kind text not null check (kind in ('income', 'expense')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('income', 'expense')),
  amount numeric not null check (amount >= 0),
  category text not null check (char_length(trim(category)) > 0),
  description text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_categories enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_transactions enable row level security;

create index if not exists inventory_categories_user_id_idx
  on public.inventory_categories(user_id);

create unique index if not exists inventory_categories_user_name_idx
  on public.inventory_categories(user_id, lower(name));

create index if not exists finance_categories_user_id_idx
  on public.finance_categories(user_id);

create unique index if not exists finance_categories_user_kind_name_idx
  on public.finance_categories(user_id, kind, lower(name));

create index if not exists finance_transactions_user_date_idx
  on public.finance_transactions(user_id, occurred_on desc);

create index if not exists finance_transactions_user_kind_category_idx
  on public.finance_transactions(user_id, kind, category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inventory_categories_set_updated_at on public.inventory_categories;
create trigger inventory_categories_set_updated_at
before update on public.inventory_categories
for each row
execute function public.set_updated_at();

drop trigger if exists finance_categories_set_updated_at on public.finance_categories;
create trigger finance_categories_set_updated_at
before update on public.finance_categories
for each row
execute function public.set_updated_at();

drop trigger if exists finance_transactions_set_updated_at on public.finance_transactions;
create trigger finance_transactions_set_updated_at
before update on public.finance_transactions
for each row
execute function public.set_updated_at();

drop policy if exists "Users can read own inventory categories" on public.inventory_categories;
create policy "Users can read own inventory categories"
on public.inventory_categories
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own inventory categories" on public.inventory_categories;
create policy "Users can insert own inventory categories"
on public.inventory_categories
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own inventory categories" on public.inventory_categories;
create policy "Users can update own inventory categories"
on public.inventory_categories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own inventory categories" on public.inventory_categories;
create policy "Users can delete own inventory categories"
on public.inventory_categories
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own finance categories" on public.finance_categories;
create policy "Users can read own finance categories"
on public.finance_categories
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own finance categories" on public.finance_categories;
create policy "Users can insert own finance categories"
on public.finance_categories
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own finance categories" on public.finance_categories;
create policy "Users can update own finance categories"
on public.finance_categories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own finance categories" on public.finance_categories;
create policy "Users can delete own finance categories"
on public.finance_categories
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own finance transactions" on public.finance_transactions;
create policy "Users can read own finance transactions"
on public.finance_transactions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own finance transactions" on public.finance_transactions;
create policy "Users can insert own finance transactions"
on public.finance_transactions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own finance transactions" on public.finance_transactions;
create policy "Users can update own finance transactions"
on public.finance_transactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own finance transactions" on public.finance_transactions;
create policy "Users can delete own finance transactions"
on public.finance_transactions
for delete
to authenticated
using (auth.uid() = user_id);
