-- Creates Ryan's authenticated HomeStock inventory table.
-- Rows belong to Supabase Auth users through user_id and RLS keeps every
-- household inventory private to the signed-in account.

create extension if not exists pgcrypto;

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) > 0),
  category text not null check (
    category in (
      'Pantry',
      'Refrigerated',
      'Frozen',
      'Medicine',
      'Cleaning',
      'Personal Care',
      'Other'
    )
  ),
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null default 'pcs',
  barcode text,
  location text,
  expiry_date date,
  notes text,
  photo_data_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_items enable row level security;

create index if not exists inventory_items_user_id_idx
  on public.inventory_items(user_id);

create index if not exists inventory_items_user_category_idx
  on public.inventory_items(user_id, category);

create index if not exists inventory_items_user_expiry_idx
  on public.inventory_items(user_id, expiry_date);

create index if not exists inventory_items_user_barcode_idx
  on public.inventory_items(user_id, barcode)
  where barcode is not null;

create or replace function public.set_inventory_items_updated_at()
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

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;

create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row
execute function public.set_inventory_items_updated_at();

drop policy if exists "Users can read own inventory items" on public.inventory_items;
create policy "Users can read own inventory items"
on public.inventory_items
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own inventory items" on public.inventory_items;
create policy "Users can insert own inventory items"
on public.inventory_items
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own inventory items" on public.inventory_items;
create policy "Users can update own inventory items"
on public.inventory_items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own inventory items" on public.inventory_items;
create policy "Users can delete own inventory items"
on public.inventory_items
for delete
to authenticated
using (auth.uid() = user_id);
