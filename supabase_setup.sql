-- Table book / Supabase setup
-- 1) Email and password accounts are handled by Supabase Auth.
--    Supabase stores users in the auth schema and stores passwords only as hashes.
-- 2) This table stores only this app's state and user recipes for each authenticated user.

create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  my_recipes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_state enable row level security;

drop policy if exists "Users can read own app state" on public.user_app_state;
drop policy if exists "Users can insert own app state" on public.user_app_state;
drop policy if exists "Users can update own app state" on public.user_app_state;

create policy "Users can read own app state"
on public.user_app_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own app state"
on public.user_app_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own app state"
on public.user_app_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Calendar days are stored separately from the profile snapshot.
-- The client loads only the month that the user opens, so old months stay
-- available without being transferred on every sign-in or profile update.
create table if not exists public.user_meal_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  meal_day jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, meal_date),
  constraint user_meal_days_meal_day_object check (jsonb_typeof(meal_day) = 'object')
);

alter table public.user_meal_days enable row level security;

-- New Supabase projects can keep public-schema tables outside the Data API
-- until privileges are granted explicitly.
revoke all on table public.user_meal_days from anon, authenticated;
grant select, insert, update, delete on table public.user_meal_days to authenticated;

drop policy if exists "Users can read own meal days" on public.user_meal_days;
drop policy if exists "Users can insert own meal days" on public.user_meal_days;
drop policy if exists "Users can update own meal days" on public.user_meal_days;
drop policy if exists "Users can delete own meal days" on public.user_meal_days;

create policy "Users can read own meal days"
on public.user_meal_days
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own meal days"
on public.user_meal_days
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own meal days"
on public.user_meal_days
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own meal days"
on public.user_meal_days
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- One-time, idempotent migration from the previous JSON calendar.
insert into public.user_meal_days (user_id, meal_date, meal_day, updated_at)
select state.user_id, entry.key::date, entry.value, state.updated_at
from public.user_app_state as state
cross join lateral jsonb_each(coalesce(state.app_state->'mealPlan', '{}'::jsonb)) as entry
where entry.key ~ '^\d{4}-\d{2}-\d{2}$'
  and jsonb_typeof(entry.value) = 'object'
on conflict (user_id, meal_date) do update
set meal_day = excluded.meal_day,
    updated_at = greatest(public.user_meal_days.updated_at, excluded.updated_at);

update public.user_app_state
set app_state = app_state - 'mealPlan' - 'mealPlanUpdatedAt'
where app_state ? 'mealPlan' or app_state ? 'mealPlanUpdatedAt';
