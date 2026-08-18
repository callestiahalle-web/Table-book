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

-- Public read-only reference for converting household measures to grams in
-- the custom-recipe nutrition calculator. Values are intentionally marked as
-- approximate: an exact kitchen scale measurement always takes precedence.
create table if not exists public.product_portion_weights (
  id bigint generated always as identity primary key,
  canonical_name text not null,
  aliases text[] not null default '{}'::text[],
  unit_code text not null,
  unit_label text not null,
  grams numeric(8,2) not null,
  note text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint product_portion_weights_name_not_blank check (length(btrim(canonical_name)) > 0),
  constraint product_portion_weights_unit_allowed check (unit_code in ('piece','tablespoon','teaspoon','slice','clove','milliliter','wedge')),
  constraint product_portion_weights_grams_positive check (grams > 0),
  constraint product_portion_weights_name_unit_unique unique (canonical_name, unit_code)
);

-- Keep an existing installation in sync when new household units are added.
alter table public.product_portion_weights
  drop constraint if exists product_portion_weights_unit_allowed;
alter table public.product_portion_weights
  add constraint product_portion_weights_unit_allowed
  check (unit_code in ('piece','tablespoon','teaspoon','slice','clove','milliliter','wedge'));

alter table public.product_portion_weights enable row level security;

revoke all on table public.product_portion_weights from public, anon, authenticated;
grant select on table public.product_portion_weights to anon, authenticated;

drop policy if exists "Anyone can read product portion weights" on public.product_portion_weights;
create policy "Anyone can read product portion weights"
on public.product_portion_weights
for select
to anon, authenticated
using (true);

with seed(canonical_name,aliases,unit_code,unit_label,grams,note,sort_order) as (
  values
    ('куриное яйцо',array['яйцо','яйца']::text[],'piece','шт.',50,'масса без скорлупы',10),
    ('перепелиное яйцо',array['перепелиные яйца']::text[],'piece','шт.',10,'масса без скорлупы',20),
    ('картофель',array['картошка']::text[],'piece','шт.',150,'средний клубень',30),
    ('морковь',array[]::text[],'piece','шт.',100,'средний корнеплод',40),
    ('репчатый лук',array['лук','луковица']::text[],'piece','шт.',100,'средняя луковица',50),
    ('чеснок',array['зубчик чеснока']::text[],'clove','зубчик',5,'очищенный зубчик',60),
    ('томат',array['помидор']::text[],'piece','шт.',120,'средний плод',70),
    ('огурец',array[]::text[],'piece','шт.',100,'средний плод',80),
    ('болгарский перец',array['сладкий перец']::text[],'piece','шт.',160,'очищенный плод',90),
    ('кабачок',array['цуккини']::text[],'piece','шт.',200,'небольшой плод',100),
    ('баклажан',array[]::text[],'piece','шт.',300,'средний плод',110),
    ('авокадо',array[]::text[],'piece','шт.',150,'мякоть среднего плода',120),
    ('яблоко',array[]::text[],'piece','шт.',180,'средний плод без сердцевины',130),
    ('банан',array[]::text[],'piece','шт.',120,'мякоть среднего плода',140),
    ('лимон',array[]::text[],'piece','шт.',120,'средний плод',150),
    ('лайм',array[]::text[],'piece','шт.',70,'средний плод',160),
    ('куриная грудка',array['филе куриной грудки','куриное филе']::text[],'piece','шт.',180,'среднее филе',170),
    ('белый хлеб',array['тостовый хлеб']::text[],'slice','ломтик',30,'стандартный ломтик',180),
    ('ржаной хлеб',array['чёрный хлеб']::text[],'slice','ломтик',35,'стандартный ломтик',190),
    ('твёрдый сыр',array['сыр']::text[],'slice','ломтик',20,'тонкий ломтик',200),
    ('растительное масло',array['подсолнечное масло','масло растительное']::text[],'tablespoon','ст. л.',14,'',210),
    ('растительное масло',array['подсолнечное масло','масло растительное']::text[],'teaspoon','ч. л.',5,'',220),
    ('оливковое масло',array['масло оливковое']::text[],'tablespoon','ст. л.',14,'',230),
    ('оливковое масло',array['масло оливковое']::text[],'teaspoon','ч. л.',5,'',240),
    ('сливочное масло',array['масло сливочное']::text[],'tablespoon','ст. л.',14,'размягчённое',250),
    ('сливочное масло',array['масло сливочное']::text[],'teaspoon','ч. л.',5,'размягчённое',260),
    ('сахар',array['сахарный песок']::text[],'tablespoon','ст. л.',20,'без горки',270),
    ('сахар',array['сахарный песок']::text[],'teaspoon','ч. л.',5,'без горки',280),
    ('соль',array['поваренная соль']::text[],'tablespoon','ст. л.',18,'мелкая, без горки',290),
    ('соль',array['поваренная соль']::text[],'teaspoon','ч. л.',6,'мелкая, без горки',300),
    ('пшеничная мука',array['мука']::text[],'tablespoon','ст. л.',25,'без горки',310),
    ('пшеничная мука',array['мука']::text[],'teaspoon','ч. л.',8,'без горки',320),
    ('овсяные хлопья',array['геркулес']::text[],'tablespoon','ст. л.',12,'сухие хлопья',330),
    ('рис',array['сухой рис']::text[],'tablespoon','ст. л.',20,'сухая крупа',340),
    ('гречневая крупа',array['гречка']::text[],'tablespoon','ст. л.',20,'сухая крупа',350),
    ('манная крупа',array['манка']::text[],'tablespoon','ст. л.',16,'без горки',360),
    ('сметана',array[]::text[],'tablespoon','ст. л.',25,'',370),
    ('сметана',array[]::text[],'teaspoon','ч. л.',8,'',380),
    ('майонез',array[]::text[],'tablespoon','ст. л.',25,'',390),
    ('майонез',array[]::text[],'teaspoon','ч. л.',8,'',400),
    ('натуральный йогурт',array['йогурт']::text[],'tablespoon','ст. л.',20,'',410),
    ('натуральный йогурт',array['йогурт']::text[],'teaspoon','ч. л.',7,'',420),
    ('мёд',array['мед']::text[],'tablespoon','ст. л.',21,'',430),
    ('мёд',array['мед']::text[],'teaspoon','ч. л.',7,'',440),
    ('томатная паста',array[]::text[],'tablespoon','ст. л.',30,'',450),
    ('томатная паста',array[]::text[],'teaspoon','ч. л.',10,'',460),
    ('соевый соус',array[]::text[],'tablespoon','ст. л.',15,'',470),
    ('соевый соус',array[]::text[],'teaspoon','ч. л.',5,'',480),
    ('кетчуп',array[]::text[],'tablespoon','ст. л.',25,'',490),
    ('кетчуп',array[]::text[],'teaspoon','ч. л.',8,'',500),
    ('горчица',array[]::text[],'tablespoon','ст. л.',25,'',510),
    ('горчица',array[]::text[],'teaspoon','ч. л.',5,'',520),
    ('молоко',array[]::text[],'tablespoon','ст. л.',15,'',530),
    ('молоко',array[]::text[],'teaspoon','ч. л.',5,'',540),
    ('сливки',array[]::text[],'tablespoon','ст. л.',15,'',550),
    ('творог',array[]::text[],'tablespoon','ст. л.',20,'',560),
    ('варёный рис',array['рис варёный']::text[],'tablespoon','ст. л.',25,'',570),
    ('картофельное пюре',array['пюре']::text[],'tablespoon','ст. л.',25,'',580),
    ('рубленые орехи',array['орехи']::text[],'tablespoon','ст. л.',10,'',590),
    ('вода',array['питьевая вода']::text[],'milliliter','мл',1,'приблизительная масса 1 мл',600),
    ('молоко',array[]::text[],'milliliter','мл',1.03,'средняя плотность',610),
    ('сливки',array[]::text[],'milliliter','мл',1,'зависит от жирности',620),
    ('кефир',array[]::text[],'milliliter','мл',1.03,'средняя плотность',630),
    ('растительное масло',array['подсолнечное масло','масло растительное']::text[],'milliliter','мл',0.92,'средняя плотность',640),
    ('оливковое масло',array['масло оливковое']::text[],'milliliter','мл',0.91,'средняя плотность',650),
    ('соевый соус',array[]::text[],'milliliter','мл',1.16,'средняя плотность',660),
    ('мёд',array['мед']::text[],'milliliter','мл',1.42,'жидкий мёд',670),
    ('уксус',array['столовый уксус','яблочный уксус']::text[],'milliliter','мл',1.01,'средняя плотность',680),
    ('кокосовое молоко',array[]::text[],'milliliter','мл',1.01,'средняя плотность',690),
    ('бульон',array['мясной бульон','куриный бульон','овощной бульон']::text[],'milliliter','мл',1,'приблизительная масса',700),
    ('томатный сок',array[]::text[],'milliliter','мл',1.04,'средняя плотность',710),
    ('лимон',array[]::text[],'wedge','долька',15,'примерно 1/8 среднего плода',720),
    ('лайм',array[]::text[],'wedge','долька',9,'примерно 1/8 среднего плода',730),
    ('яблоко',array[]::text[],'wedge','долька',22,'примерно 1/8 среднего плода без сердцевины',740),
    ('томат',array['помидор']::text[],'wedge','долька',15,'примерно 1/8 среднего плода',750)
)
insert into public.product_portion_weights (
  canonical_name, aliases, unit_code, unit_label, grams, note, sort_order
)
select canonical_name, aliases, unit_code, unit_label, grams, note, sort_order
from seed
on conflict (canonical_name, unit_code) do update
set aliases = excluded.aliases,
    unit_label = excluded.unit_label,
    grams = excluded.grams,
    note = excluded.note,
    sort_order = excluded.sort_order,
    updated_at = now();

-- Verified public food references used by both the web app and the packaged
-- Android app. They are read-only for clients; only migrations can change them.
create table if not exists public.food_nutrition_reference (
  canonical_name text primary key,
  aliases text[] not null default '{}'::text[],
  kcal numeric(10,3) not null,
  protein numeric(10,3) not null,
  fat numeric(10,3) not null,
  carbs numeric(10,3) not null,
  fdc_id bigint not null unique,
  data_type text not null,
  dataset_release date not null,
  source_name text not null default 'USDA FoodData Central',
  source_url text not null default 'https://fdc.nal.usda.gov/',
  updated_at timestamptz not null default now(),
  constraint food_nutrition_name_not_blank check (length(btrim(canonical_name)) > 0),
  constraint food_nutrition_values_nonnegative check (kcal >= 0 and protein >= 0 and fat >= 0 and carbs >= 0)
);

alter table public.food_nutrition_reference enable row level security;
revoke all on table public.food_nutrition_reference from public, anon, authenticated;
grant select on table public.food_nutrition_reference to anon, authenticated;
drop policy if exists "Anyone can read food nutrition reference" on public.food_nutrition_reference;
create policy "Anyone can read food nutrition reference"
on public.food_nutrition_reference for select to anon, authenticated using (true);

insert into public.food_nutrition_reference
  (canonical_name,aliases,kcal,protein,fat,carbs,fdc_id,data_type,dataset_release)
values
  ('яблоко',array['яблоки','яблоко гала']::text[],54.9,0.133,0.15,14.8,1750341,'Foundation','2026-04-30'),
  ('банан',array['бананы']::text[],97,0.74,0.29,23,1105314,'Foundation','2026-04-30'),
  ('говяжий фарш 90/10',array['говяжий фарш','фарш из говядины']::text[],190,18.2,12.8,0,2514743,'Foundation','2026-04-30'),
  ('морковь',array['морковка']::text[],45,0.941,0.351,10.3,2258586,'Foundation','2026-04-30'),
  ('фета',array['сыр фета']::text[],273,19.7,19.1,5.58,2259796,'Foundation','2026-04-30'),
  ('куриная грудка',array['курица','куриное филе','филе куриной грудки','грудка куриная']::text[],112,22.5,1.93,0,2646170,'Foundation','2026-04-30'),
  ('огурец',array['огурцы']::text[],13.9,0.625,0.178,2.95,2346406,'Foundation','2026-04-30'),
  ('куриное яйцо',array['яйцо','яйца','яйцо куриное']::text[],148,12.4,9.96,0.96,748967,'Foundation','2026-04-30'),
  ('пшеничная мука',array['мука','мука пшеничная','мука общего назначения']::text[],358,13.1,1.48,73.2,789951,'Foundation','2026-04-30'),
  ('чеснок',array['зубчик чеснока','зубчики чеснока']::text[],143,6.62,0.38,28.2,1104647,'Foundation','2026-04-30'),
  ('молоко цельное',array['молоко','цельное молоко']::text[],60,3.27,3.2,4.63,746782,'Foundation','2026-04-30'),
  ('овсяные хлопья',array['овсянка','геркулес','хлопья овсяные']::text[],379,13.5,5.89,68.7,2346396,'Foundation','2026-04-30'),
  ('репчатый лук',array['лук','луковица','лук репчатый']::text[],38,0.83,0.05,8.61,790646,'Foundation','2026-04-30'),
  ('арахисовая паста',array['паста арахисовая','арахисовое масло']::text[],589,24,49.4,22.7,2262072,'Foundation','2026-04-30'),
  ('свиная вырезка',array['свинина','вырезка свиная']::text[],125,21.6,3.9,0,2646169,'Foundation','2026-04-30'),
  ('картофель',array['картошка','картофель очищенный']::text[],71.6,1.81,0.264,16,2346403,'Foundation','2026-04-30'),
  ('рис белый сухой',array['рис','белый рис','рис длиннозёрный','рис длиннозерный']::text[],370,7.04,1.03,80.3,2512381,'Foundation','2026-04-30'),
  ('томат',array['помидор','помидоры','томаты','томат рома']::text[],19,0.696,0.425,3.84,1999634,'Foundation','2026-04-30'),
  ('натуральный йогурт',array['йогурт','йогурт натуральный','йогурт без добавок']::text[],77.3,3.82,4.48,5.57,2259793,'Foundation','2026-04-30'),
  ('кабачок',array['кабачки','цуккини']::text[],17,1.21,0.32,3.11,169291,'SR Legacy','2018-04-01'),
  ('оливковое масло',array['масло оливковое','оливковое масло extra virgin']::text[],884,0,100,0,171413,'SR Legacy','2018-04-01'),
  ('лосось атлантический',array['лосось','сёмга','семга','филе лосося']::text[],142,19.8,6.34,0,173686,'SR Legacy','2018-04-01'),
  ('мёд',array['мед']::text[],304,0.3,0,82.4,169640,'SR Legacy','2018-04-01'),
  ('сахар',array['сахарный песок','сахар белый']::text[],387,0,0,100,169655,'SR Legacy','2018-04-01')
on conflict (canonical_name) do update set
  aliases=excluded.aliases,kcal=excluded.kcal,protein=excluded.protein,fat=excluded.fat,
  carbs=excluded.carbs,fdc_id=excluded.fdc_id,data_type=excluded.data_type,
  dataset_release=excluded.dataset_release,source_name=excluded.source_name,
  source_url=excluded.source_url,updated_at=now();

create table if not exists public.food_storage_reference (
  canonical_name text primary key,
  aliases text[] not null default '{}'::text[],
  fridge_days_min smallint not null,
  fridge_days_max smallint not null,
  note text not null default '',
  source_name text not null default 'USDA FoodKeeper',
  source_url text not null default 'https://www.foodsafety.gov/keep-food-safe/foodkeeper-app',
  updated_at timestamptz not null default now(),
  constraint food_storage_name_not_blank check (length(btrim(canonical_name)) > 0),
  constraint food_storage_days_valid check (fridge_days_min >= 0 and fridge_days_max >= fridge_days_min)
);

alter table public.food_storage_reference enable row level security;
revoke all on table public.food_storage_reference from public, anon, authenticated;
grant select on table public.food_storage_reference to anon, authenticated;
drop policy if exists "Anyone can read food storage reference" on public.food_storage_reference;
create policy "Anyone can read food storage reference"
on public.food_storage_reference for select to anon, authenticated using (true);

insert into public.food_storage_reference
  (canonical_name,aliases,fridge_days_min,fridge_days_max,note)
values
  ('сырая птица',array['курица','куриная грудка','куриное филе','индейка','утка']::text[],1,2,'Храните при 4 °C или ниже; для более позднего дня недели заморозьте.'),
  ('сырая рыба и морепродукты',array['лосось','сёмга','семга','рыба','креветки','мидии','кальмар','тунец','треска']::text[],1,2,'Покупайте максимально близко ко дню приготовления.'),
  ('мясной фарш',array['говяжий фарш','свиной фарш','фарш','рубленое мясо']::text[],1,2,'Храните при 4 °C или ниже.'),
  ('сырое мясо куском',array['говядина','свинина','свиная вырезка','телятина','баранина','стейк']::text[],3,5,'Соблюдайте срок на упаковке и холодовую цепь.'),
  ('яйца',array['куриное яйцо','яйцо','яйца']::text[],21,35,'Храните в холодильнике в заводской упаковке.'),
  ('молочные продукты',array['молоко','сливки','йогурт','кефир','творог','сметана']::text[],3,7,'После вскрытия ориентируйтесь на маркировку производителя.'),
  ('мягкий сыр',array['моцарелла','фета','брынза','рикотта']::text[],3,7,'После вскрытия держите в холодильнике и учитывайте рассол.'),
  ('зелень и листовые овощи',array['зелень','базилик','петрушка','укроп','кинза','салат','шпинат']::text[],2,5,'Не мойте заранее, если это ускоряет увядание.'),
  ('грибы',array['грибы','шампиньоны','вешенки']::text[],3,5,'Храните сухими в воздухопроницаемой упаковке.'),
  ('ягоды',array['клубника','малина','черника','смородина','ягоды']::text[],2,4,'Переберите и мойте непосредственно перед использованием.'),
  ('нежные овощи',array['кабачок','цуккини','огурец','томат','помидор','баклажан','болгарский перец']::text[],4,7,'Проверьте зрелость: очень спелые плоды используйте раньше.'),
  ('корнеплоды',array['морковь','свёкла','свекла','редис']::text[],7,21,'Удалите ботву и храните в овощном отсеке.'),
  ('готовые блюда',array['готовое блюдо','суп','бульон','рагу']::text[],3,4,'Охладите в течение двух часов и храните закрытым.')
on conflict (canonical_name) do update set
  aliases=excluded.aliases,fridge_days_min=excluded.fridge_days_min,
  fridge_days_max=excluded.fridge_days_max,note=excluded.note,
  source_name=excluded.source_name,source_url=excluded.source_url,updated_at=now();
