-- Adds user-owned reusable inventory locations.
-- Item rows keep their plain-text location for backward compatibility, while
-- this table powers the app's location dropdown without exposing one user's
-- saved places to another.

create extension if not exists pgcrypto;

create table if not exists public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_locations enable row level security;

create index if not exists inventory_locations_user_id_idx
  on public.inventory_locations(user_id);

create unique index if not exists inventory_locations_user_name_idx
  on public.inventory_locations(user_id, name);

drop trigger if exists inventory_locations_set_updated_at on public.inventory_locations;
create trigger inventory_locations_set_updated_at
before update on public.inventory_locations
for each row
execute function public.set_updated_at();

insert into public.inventory_locations (user_id, name)
select distinct user_id, trim(location)
from public.inventory_items
where location is not null
  and char_length(trim(location)) > 0
on conflict do nothing;

drop policy if exists "Users can read own inventory locations" on public.inventory_locations;
create policy "Users can read own inventory locations"
on public.inventory_locations
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own inventory locations" on public.inventory_locations;
create policy "Users can insert own inventory locations"
on public.inventory_locations
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own inventory locations" on public.inventory_locations;
create policy "Users can update own inventory locations"
on public.inventory_locations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own inventory locations" on public.inventory_locations;
create policy "Users can delete own inventory locations"
on public.inventory_locations
for delete
to authenticated
using (auth.uid() = user_id);
