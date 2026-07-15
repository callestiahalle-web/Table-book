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

-- User edits of built-in recipes are stored separately from the catalogue.
-- The application always keeps the built-in recipe as the immutable original
-- and deletes this row when the user chooses "Reset to original".
create table if not exists public.user_recipe_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  recipe_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_id),
  constraint user_recipe_overrides_recipe_id_not_blank check (length(btrim(recipe_id)) > 0),
  constraint user_recipe_overrides_recipe_data_object check (jsonb_typeof(recipe_data) = 'object')
);

alter table public.user_recipe_overrides enable row level security;

revoke all on table public.user_recipe_overrides from anon, authenticated;
grant select, insert, update, delete on table public.user_recipe_overrides to authenticated;

drop policy if exists "Users can read own recipe overrides" on public.user_recipe_overrides;
drop policy if exists "Users can insert own recipe overrides" on public.user_recipe_overrides;
drop policy if exists "Users can update own recipe overrides" on public.user_recipe_overrides;
drop policy if exists "Users can delete own recipe overrides" on public.user_recipe_overrides;

create policy "Users can read own recipe overrides"
on public.user_recipe_overrides
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own recipe overrides"
on public.user_recipe_overrides
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own recipe overrides"
on public.user_recipe_overrides
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own recipe overrides"
on public.user_recipe_overrides
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Public short links for user-created recipes.
-- The table is never exposed directly through the Data API. A public reader
-- can fetch only one non-revoked snapshot when it knows its random code, while
-- authenticated owners create, inspect and revoke their own links through RPC.
create table if not exists public.shared_recipe_links (
  id uuid primary key default extensions.gen_random_uuid(),
  share_code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_recipe_id text not null,
  recipe_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint shared_recipe_links_code_format check (share_code ~ '^[A-Za-z0-9_-]{12}$'),
  constraint shared_recipe_links_recipe_id_not_blank check (length(btrim(source_recipe_id)) between 1 and 220),
  constraint shared_recipe_links_recipe_data_object check (jsonb_typeof(recipe_data) = 'object')
);

create unique index if not exists shared_recipe_links_one_active_per_recipe
on public.shared_recipe_links (owner_id, source_recipe_id)
where revoked_at is null;

alter table public.shared_recipe_links enable row level security;

revoke all on table public.shared_recipe_links from public, anon, authenticated;

drop policy if exists "Block direct access to shared recipe links" on public.shared_recipe_links;
create policy "Block direct access to shared recipe links"
on public.shared_recipe_links
as restrictive
for all
to public
using (false)
with check (false);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.create_shared_recipe_impl(
  p_recipe_id text,
  p_recipe_data jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_recipe_id text := pg_catalog.btrim(p_recipe_id);
  v_share_code text;
  v_attempt integer := 0;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if v_recipe_id is null or pg_catalog.length(v_recipe_id) not between 1 and 220 then
    raise exception using errcode = '22023', message = 'Invalid recipe id';
  end if;
  if p_recipe_data is null
     or pg_catalog.jsonb_typeof(p_recipe_data) is distinct from 'object'
     or coalesce(pg_catalog.length(pg_catalog.btrim(p_recipe_data ->> 'title')), 0) = 0
     or pg_catalog.jsonb_typeof(p_recipe_data -> 'ingredients') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_recipe_data -> 'steps') is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Invalid recipe snapshot';
  end if;
  if pg_catalog.pg_column_size(p_recipe_data) > 131072 then
    raise exception using errcode = '22001', message = 'Recipe snapshot is too large';
  end if;

  select link.share_code
    into v_share_code
    from public.shared_recipe_links as link
   where link.owner_id = v_user_id
     and link.source_recipe_id = v_recipe_id
     and link.revoked_at is null
   limit 1
   for update;

  if v_share_code is not null then
    update public.shared_recipe_links
       set recipe_data = p_recipe_data,
           updated_at = pg_catalog.now()
     where owner_id = v_user_id
       and source_recipe_id = v_recipe_id
       and revoked_at is null;
    return v_share_code;
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_share_code := pg_catalog.translate(
      pg_catalog.rtrim(pg_catalog.encode(extensions.gen_random_bytes(9), 'base64'), '='),
      '+/',
      '-_'
    );
    begin
      insert into public.shared_recipe_links (
        share_code,
        owner_id,
        source_recipe_id,
        recipe_data
      ) values (
        v_share_code,
        v_user_id,
        v_recipe_id,
        p_recipe_data
      );
      return v_share_code;
    exception
      when unique_violation then
        select link.share_code
          into v_share_code
          from public.shared_recipe_links as link
         where link.owner_id = v_user_id
           and link.source_recipe_id = v_recipe_id
           and link.revoked_at is null
         limit 1;
        if v_share_code is not null then
          update public.shared_recipe_links
             set recipe_data = p_recipe_data,
                 updated_at = pg_catalog.now()
           where owner_id = v_user_id
             and source_recipe_id = v_recipe_id
             and revoked_at is null;
          return v_share_code;
        end if;
        if v_attempt >= 8 then
          raise exception using errcode = '55000', message = 'Could not create a unique share code';
        end if;
    end;
  end loop;
end;
$$;

create or replace function private.get_shared_recipe_impl(p_share_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_jwt_role text := auth.role();
  v_recipe_data jsonb;
begin
  if v_jwt_role is distinct from 'anon' and v_jwt_role is distinct from 'authenticated' then
    raise exception using errcode = '42501', message = 'Public recipe access requires an API role';
  end if;
  select link.recipe_data
    into v_recipe_data
    from public.shared_recipe_links as link
   where link.share_code = p_share_code
     and link.revoked_at is null
     and pg_catalog.length(p_share_code) = 12
   limit 1;
  return v_recipe_data;
end;
$$;

create or replace function private.get_my_shared_recipe_code_impl(p_recipe_id text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_share_code text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  select link.share_code
    into v_share_code
    from public.shared_recipe_links as link
   where link.owner_id = v_user_id
     and link.source_recipe_id = pg_catalog.btrim(p_recipe_id)
     and link.revoked_at is null
   limit 1;
  return v_share_code;
end;
$$;

create or replace function private.revoke_shared_recipe_impl(p_recipe_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  update public.shared_recipe_links
     set revoked_at = pg_catalog.now(),
         updated_at = pg_catalog.now()
   where owner_id = v_user_id
     and source_recipe_id = pg_catalog.btrim(p_recipe_id)
     and revoked_at is null;
  return found;
end;
$$;

create or replace function public.create_shared_recipe(
  p_recipe_id text,
  p_recipe_data jsonb
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.create_shared_recipe_impl(p_recipe_id, p_recipe_data)
$$;

create or replace function public.get_shared_recipe(p_share_code text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_shared_recipe_impl(p_share_code)
$$;

create or replace function public.get_my_shared_recipe_code(p_recipe_id text)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_my_shared_recipe_code_impl(p_recipe_id)
$$;

create or replace function public.revoke_shared_recipe(p_recipe_id text)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.revoke_shared_recipe_impl(p_recipe_id)
$$;

revoke execute on function private.create_shared_recipe_impl(text, jsonb) from public, anon, authenticated;
revoke execute on function private.get_shared_recipe_impl(text) from public, anon, authenticated;
revoke execute on function private.get_my_shared_recipe_code_impl(text) from public, anon, authenticated;
revoke execute on function private.revoke_shared_recipe_impl(text) from public, anon, authenticated;

revoke execute on function public.create_shared_recipe(text, jsonb) from public, anon, authenticated;
revoke execute on function public.get_shared_recipe(text) from public, anon, authenticated;
revoke execute on function public.get_my_shared_recipe_code(text) from public, anon, authenticated;
revoke execute on function public.revoke_shared_recipe(text) from public, anon, authenticated;

grant execute on function public.create_shared_recipe(text, jsonb) to authenticated;
grant execute on function public.get_shared_recipe(text) to anon, authenticated;
grant execute on function public.get_my_shared_recipe_code(text) to authenticated;
grant execute on function public.revoke_shared_recipe(text) to authenticated;

grant execute on function private.create_shared_recipe_impl(text, jsonb) to authenticated;
grant execute on function private.get_shared_recipe_impl(text) to anon, authenticated;
grant execute on function private.get_my_shared_recipe_code_impl(text) to authenticated;
grant execute on function private.revoke_shared_recipe_impl(text) to authenticated;
