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
    ('морковь',array['морковка','мокровь']::text[],'piece','шт.',100,'средний корнеплод',40),
    ('репчатый лук',array['лук','луковица']::text[],'piece','шт.',100,'средняя луковица',50),
    ('чеснок',array['зубчик чеснока']::text[],'clove','зубчик',5,'очищенный зубчик',60),
    ('томат',array['помидор']::text[],'piece','шт.',120,'средний плод',70),
    ('огурец',array[]::text[],'piece','шт.',100,'средний плод',80),
    ('болгарский перец',array['сладкий перец','красный сладкий перец','красный болгарский перец','перец красный болгарский','перец болгарский красный','болгарский красный перец','перец сладкий красный','сладкий красный перец','красный перец болгарский']::text[],'piece','шт.',160,'очищенный плод',90),
    ('кабачок',array['цуккини']::text[],'piece','шт.',200,'небольшой плод',100),
    ('баклажан',array[]::text[],'piece','шт.',300,'средний плод',110),
    ('авокадо',array[]::text[],'piece','шт.',150,'мякоть среднего плода',120),
    ('яблоко',array[]::text[],'piece','шт.',180,'средний плод без сердцевины',130),
    ('банан',array[]::text[],'piece','шт.',120,'мякоть среднего плода',140),
    ('груша',array[]::text[],'piece','шт.',178,'средний плод без сердцевины',141),
    ('персик',array[]::text[],'piece','шт.',150,'мякоть среднего плода без косточки',142),
    ('абрикос',array[]::text[],'piece','шт.',35,'мякоть среднего плода без косточки',143),
    ('нектарин',array[]::text[],'piece','шт.',140,'мякоть среднего плода без косточки',144),
    ('слива',array[]::text[],'piece','шт.',65,'мякоть среднего плода без косточки',145),
    ('киви',array[]::text[],'piece','шт.',70,'мякоть среднего плода',146),
    ('хурма',array[]::text[],'piece','шт.',168,'средний плод без чашелистиков',147),
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
    ('кокосовое молоко',array['кокосовое молоко Aroy-D','Aroy-D кокосовое молоко','кокосовое молоко Aroy D','Aroy D кокосовое молоко']::text[],'milliliter','мл',1.01,'средняя плотность',690),
    ('бульон',array['мясной бульон','куриный бульон','овощной бульон']::text[],'milliliter','мл',1,'приблизительная масса',700),
    ('томатный сок',array[]::text[],'milliliter','мл',1.04,'средняя плотность',710),
    ('лимон',array[]::text[],'wedge','долька',15,'примерно 1/8 среднего плода',720),
    ('лайм',array[]::text[],'wedge','долька',9,'примерно 1/8 среднего плода',730),
    ('яблоко',array[]::text[],'wedge','долька',22,'примерно 1/8 среднего плода без сердцевины',740),
    ('томат',array['помидор']::text[],'wedge','долька',15,'примерно 1/8 среднего плода',750),
    ('зелёный лук',array['зеленый лук']::text[],'piece','стебель',15,'средний стебель с белой частью',760),
    ('петрушка',array[]::text[],'piece','пучок',30,'небольшой пучок без упаковки',770),
    ('кинза',array[]::text[],'piece','пучок',30,'небольшой пучок без упаковки',780),
    ('мята',array[]::text[],'piece','пучок',20,'небольшой пучок',790),
    ('нори',array['ким','лист нори']::text[],'piece','лист',2.5,'стандартный лист для роллов',800),
    ('крабовые палочки',array['сурими']::text[],'piece','шт.',25,'средняя палочка',810),
    ('рисовые клёцки тток',array['тток']::text[],'piece','шт.',20,'средняя палочка тток',820),
    ('рисовая бумага',array[]::text[],'piece','лист',10,'сухой лист диаметром около 22 см',830),
    ('кимчи',array['кимчхи']::text[],'tablespoon','ст. л.',20,'нарезанное кимчи с небольшим количеством рассола',840),
    ('кочуджан',array['кочудян']::text[],'tablespoon','ст. л.',20,'без горки',850),
    ('кочуджан',array['кочудян']::text[],'teaspoon','ч. л.',7,'без горки',860),
    ('рыбный соус',array[]::text[],'tablespoon','ст. л.',18,'',870),
    ('рыбный соус',array[]::text[],'teaspoon','ч. л.',6,'',880),
    ('рыбный соус',array[]::text[],'milliliter','мл',1.2,'средняя плотность',890),
    ('кунжут',array['семена кунжута']::text[],'tablespoon','ст. л.',9,'без горки',900),
    ('кунжут',array['семена кунжута']::text[],'teaspoon','ч. л.',3,'без горки',910),
    ('сухие дрожжи',array['дрожжи']::text[],'teaspoon','ч. л.',3.1,'активные сухие дрожжи без горки',920)
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
  ('морковь',array['морковка','мокровь']::text[],45,0.941,0.351,10.3,2258586,'Foundation','2026-04-30'),
  ('фета',array['сыр фета']::text[],273,19.7,19.1,5.58,2259796,'Foundation','2026-04-30'),
  ('куриная грудка',array['курица','куриное филе','филе куриной грудки','грудка куриная']::text[],112,22.5,1.93,0,2646170,'Foundation','2026-04-30'),
  ('огурец',array['огурцы']::text[],13.9,0.625,0.178,2.95,2346406,'Foundation','2026-04-30'),
  ('куриное яйцо',array['яйцо','яйца','яйцо куриное']::text[],148,12.4,9.96,0.96,748967,'Foundation','2026-04-30'),
  ('пшеничная мука',array['мука','мука пшеничная','мука общего назначения']::text[],358,13.1,1.48,73.2,789951,'Foundation','2026-04-30'),
  ('чеснок',array['зубчик чеснока','зубчики чеснока']::text[],143,6.62,0.38,28.2,1104647,'Foundation','2026-04-30'),
  ('молоко цельное',array['молоко','цельное молоко']::text[],60,3.27,3.2,4.63,746782,'Foundation','2026-04-30'),
  ('сливки 36%',array['сливки','жирные сливки']::text[],340,2.84,36.08,2.84,170859,'SR Legacy','2018-04-01'),
  ('сметана',array['сметана 20%','сметана жирная']::text[],198,2.44,19.35,4.63,171257,'SR Legacy','2018-04-01'),
  ('кефир нежирный',array['кефир','кефир натуральный']::text[],43,3.79,1.02,4.77,170904,'SR Legacy','2018-04-01'),
  ('творог',array['творог зернёный','творог зерненый']::text[],98,11.12,4.3,3.38,172179,'SR Legacy','2018-04-01'),
  ('моцарелла',array['сыр моцарелла']::text[],299,22.17,22.14,2.4,170845,'SR Legacy','2018-04-01'),
  ('сливочное масло',array['масло сливочное']::text[],717,0.85,81.11,0.06,173410,'SR Legacy','2018-04-01'),
  ('овсяные хлопья',array['овсянка','геркулес','хлопья овсяные']::text[],379,13.5,5.89,68.7,2346396,'Foundation','2026-04-30'),
  ('репчатый лук',array['лук','луковица','лук репчатый']::text[],38,0.83,0.05,8.61,790646,'Foundation','2026-04-30'),
  ('арахисовая паста',array['паста арахисовая','арахисовое масло']::text[],589,24,49.4,22.7,2262072,'Foundation','2026-04-30'),
  ('свиная вырезка',array['свинина','вырезка свиная']::text[],125,21.6,3.9,0,2646169,'Foundation','2026-04-30'),
  ('картофель',array['картошка','картофель очищенный']::text[],71.6,1.81,0.264,16,2346403,'Foundation','2026-04-30'),
  ('рис белый сухой',array['рис','белый рис','рис длиннозёрный','рис длиннозерный']::text[],370,7.04,1.03,80.3,2512381,'Foundation','2026-04-30'),
  ('тофу твёрдый',array['тофу','твердый тофу','твёрдый тофу']::text[],78,9.04,4.17,2.85,172448,'SR Legacy','2018-04-01'),
  ('соевый соус',array['соус соевый','сёю','сею','шою']::text[],53,8.14,0.57,4.93,174277,'SR Legacy','2018-04-01'),
  ('кунжут',array['семена кунжута','кунжутные семена']::text[],573,17.73,49.67,23.45,170150,'SR Legacy','2018-04-01'),
  ('нори',array['лист нори','листы нори','водоросли нори','лавер']::text[],35,5.81,0.28,5.11,168458,'SR Legacy','2018-04-01'),
  ('мисо',array['паста мисо','мисо паста']::text[],198,12.79,6.01,25.37,172442,'SR Legacy','2018-04-01'),
  ('вакаме',array['водоросли вакаме']::text[],45,3.03,0.64,9.14,170496,'SR Legacy','2018-04-01'),
  ('томат',array['помидор','помидоры','томаты','томат рома']::text[],19,0.696,0.425,3.84,1999634,'Foundation','2026-04-30'),
  ('томатная паста',array['паста томатная']::text[],82,4.32,0.47,18.91,-1022,'SR Legacy reference average','2018-04-01'),
  ('натуральный йогурт',array['йогурт','йогурт натуральный','йогурт без добавок']::text[],77.3,3.82,4.48,5.57,2259793,'Foundation','2026-04-30'),
  ('кабачок',array['кабачки','цуккини']::text[],17,1.21,0.32,3.11,169291,'SR Legacy','2018-04-01'),
  ('креветки сырые',array['креветки','очищенные креветки']::text[],71,13.61,1.01,0.91,174210,'SR Legacy','2018-04-01'),
  ('тунец консервированный',array['тунец','тунец в собственном соку']::text[],86,19.44,0.96,0,173709,'SR Legacy','2018-04-01'),
  ('треска сырая',array['треска','филе трески']::text[],69,15.27,0.41,0,174191,'SR Legacy','2018-04-01'),
  ('белокочанная капуста',array['капуста','белокочанная капуста']::text[],25,1.28,0.1,5.8,169975,'SR Legacy','2018-04-01'),
  ('брокколи',array['капуста брокколи']::text[],34,2.82,0.37,6.64,170379,'SR Legacy','2018-04-01'),
  ('цветная капуста',array['капуста цветная']::text[],25,1.92,0.28,4.97,169986,'SR Legacy','2018-04-01'),
  ('шпинат',array['свежий шпинат']::text[],23,2.86,0.39,3.63,168462,'SR Legacy','2018-04-01'),
  ('шампиньоны',array['грибы','белые шампиньоны']::text[],22,3.09,0.34,3.26,169251,'SR Legacy','2018-04-01'),
  ('тыква',array['мякоть тыквы']::text[],26,1,0.1,6.5,168448,'SR Legacy','2018-04-01'),
  ('свёкла',array['свекла','свекла сырая']::text[],43,1.61,0.17,9.56,169145,'SR Legacy','2018-04-01'),
  ('сельдерей',array['стебель сельдерея','стебли сельдерея']::text[],14,0.69,0.17,2.97,169988,'SR Legacy','2018-04-01'),
  ('зелёный горошек',array['зеленый горошек','свежий горошек']::text[],81,5.42,0.4,14.45,170419,'SR Legacy','2018-04-01'),
  ('баклажан',array['баклажаны']::text[],25,0.98,0.18,5.88,169228,'SR Legacy','2018-04-01'),
  ('болгарский перец',array['сладкий перец','красный сладкий перец','красный болгарский перец','перец красный болгарский','перец болгарский красный','болгарский красный перец','перец сладкий красный','сладкий красный перец','красный перец болгарский']::text[],26,0.99,0.3,6.03,170108,'SR Legacy','2018-04-01'),
  ('гречневая крупа',array['гречка','гречка сухая']::text[],346,11.73,2.71,74.95,170685,'SR Legacy','2018-04-01'),
  ('манная крупа',array['манка','семолина']::text[],360,12.68,1.05,72.83,168933,'SR Legacy','2018-04-01'),
  ('кускус сухой',array['кускус']::text[],376,12.76,0.64,77.43,169699,'SR Legacy','2018-04-01'),
  ('киноа сухая',array['киноа']::text[],368,14.12,6.07,64.16,168874,'SR Legacy','2018-04-01'),
  ('макароны сухие',array['макароны','спагетти','сухая паста','паста сухая']::text[],371,13.04,1.51,74.67,169736,'SR Legacy','2018-04-01'),
  ('белый хлеб',array['хлеб','тостовый хлеб','белый тостовый хлеб']::text[],266,8.85,3.33,49.42,174924,'SR Legacy','2018-04-01'),
  ('ржаной хлеб',array['чёрный хлеб','черный хлеб','хлеб ржаной']::text[],259,8.5,3.3,48.3,-1021,'SR Legacy reference average','2018-04-01'),
  ('нут сухой',array['нут','турецкий горох']::text[],378,20.47,6.04,62.95,173756,'SR Legacy','2018-04-01'),
  ('чечевица сухая',array['чечевица']::text[],352,24.63,1.06,63.35,172420,'SR Legacy','2018-04-01'),
  ('белая фасоль сухая',array['фасоль','белая фасоль']::text[],333,23.36,0.85,60.27,175202,'SR Legacy','2018-04-01'),
  ('лимон',array['лимоны','сок лимона']::text[],29,1.1,0.3,9.32,167746,'SR Legacy','2018-04-01'),
  ('лайм',array['лаймы','сок лайма']::text[],30,0.7,0.2,10.54,168155,'SR Legacy','2018-04-01'),
  ('апельсин',array['апельсины']::text[],47,0.94,0.12,11.75,169097,'SR Legacy','2018-04-01'),
  ('авокадо',array['мякоть авокадо']::text[],160,2,14.66,8.53,171705,'SR Legacy','2018-04-01'),
  ('манго',array['мякоть манго']::text[],60,0.82,0.38,14.98,169910,'SR Legacy','2018-04-01'),
  ('ананас',array['мякоть ананаса']::text[],50,0.54,0.12,13.12,169124,'SR Legacy','2018-04-01'),
  ('груша',array['груши']::text[],63,0.39,0.16,15.01,167776,'SR Legacy','2018-04-01'),
  ('виноград',array['виноград красный','виноград зелёный','виноград зеленый']::text[],69,0.72,0.16,18.1,174683,'SR Legacy','2018-04-01'),
  ('клубника',array['свежая клубника','ягоды клубники']::text[],32,0.67,0.3,7.68,167762,'SR Legacy','2018-04-01'),
  ('малина',array['свежая малина','ягоды малины']::text[],52,1.2,0.65,11.94,167755,'SR Legacy','2018-04-01'),
  ('черника',array['свежая черника','ягоды черники']::text[],57,0.74,0.33,14.49,171711,'SR Legacy','2018-04-01'),
  ('ежевика',array['свежая ежевика','ягоды ежевики']::text[],43,1.39,0.49,9.61,173946,'SR Legacy','2018-04-01'),
  ('черешня',array['черешня свежая','сладкая вишня']::text[],63,1.06,0.2,16.01,171719,'SR Legacy','2018-04-01'),
  ('персик',array['персики','персик жёлтый','персик желтый']::text[],39,0.91,0.25,9.54,169928,'SR Legacy','2018-04-01'),
  ('киви',array['киви зелёный','киви зеленый','мякоть киви']::text[],61,1.14,0.52,14.66,168153,'SR Legacy','2018-04-01'),
  ('абрикос',array['абрикосы','свежий абрикос']::text[],48,1.4,0.39,11.12,-1010,'SR Legacy reference average','2018-04-01'),
  ('нектарин',array['нектарины','свежий нектарин']::text[],44,1.06,0.32,10.55,-1011,'SR Legacy reference average','2018-04-01'),
  ('слива',array['сливы','свежая слива']::text[],46,0.7,0.28,11.42,-1012,'SR Legacy reference average','2018-04-01'),
  ('арбуз',array['арбузная мякоть','мякоть арбуза']::text[],30,0.61,0.15,7.55,-1013,'SR Legacy reference average','2018-04-01'),
  ('дыня',array['мякоть дыни','дыня канталупа']::text[],34,0.84,0.19,8.16,-1014,'SR Legacy reference average','2018-04-01'),
  ('гранатовые зёрна',array['гранатовые зерна','зёрна граната','зерна граната']::text[],83,1.67,1.17,18.7,-1015,'SR Legacy reference average','2018-04-01'),
  ('хурма',array['хурма свежая','мякоть хурмы']::text[],70,0.58,0.19,18.59,-1016,'SR Legacy reference average','2018-04-01'),
  ('чёрная смородина',array['черная смородина','смородина чёрная','смородина черная']::text[],63,1.4,0.41,15.38,-1017,'SR Legacy reference average','2018-04-01'),
  ('крыжовник',array['крыжовник свежий']::text[],44,0.88,0.58,10.18,-1018,'SR Legacy reference average','2018-04-01'),
  ('клюква',array['клюква свежая']::text[],46,0.46,0.13,12,-1019,'SR Legacy reference average','2018-04-01'),
  ('вишня',array['вишня свежая','кислая вишня']::text[],50,1,0.3,12.18,-1020,'SR Legacy reference average','2018-04-01'),
  ('кокосовое молоко',array['молоко кокосовое']::text[],230,2.29,23.84,5.54,170172,'SR Legacy','2018-04-01'),
  ('какао-порошок',array['какао','какао порошок']::text[],228,19.6,13.7,57.9,169593,'SR Legacy','2018-04-01'),
  ('тёмный шоколад',array['темный шоколад','горький шоколад','шоколад 70%']::text[],598,7.79,42.63,45.9,170273,'SR Legacy','2018-04-01'),
  ('имбирь',array['корень имбиря','свежий имбирь']::text[],80,1.82,0.75,17.77,169231,'SR Legacy','2018-04-01'),
  ('уксус пищевой',array['рисовый уксус','яблочный уксус','столовый уксус']::text[],18,0,0,0.04,172237,'SR Legacy','2018-04-01'),
  ('подсолнечное масло',array['растительное масло','масло растительное','масло для жарки']::text[],884,0,100,0,171017,'SR Legacy','2018-04-01'),
  ('оливковое масло',array['масло оливковое','оливковое масло extra virgin']::text[],884,0,100,0,171413,'SR Legacy','2018-04-01'),
  ('лосось атлантический',array['лосось','сёмга','семга','филе лосося']::text[],142,19.8,6.34,0,173686,'SR Legacy','2018-04-01'),
  ('мёд',array['мед']::text[],304,0.3,0,82.4,169640,'SR Legacy','2018-04-01'),
  ('сахар',array['сахарный песок','сахар белый']::text[],387,0,0,100,169655,'SR Legacy','2018-04-01'),
  ('соль',array['поваренная соль','столовая соль']::text[],0,0,0,0,173468,'SR Legacy','2018-04-01')
on conflict (canonical_name) do update set
  aliases=excluded.aliases,kcal=excluded.kcal,protein=excluded.protein,fat=excluded.fat,
  carbs=excluded.carbs,fdc_id=excluded.fdc_id,data_type=excluded.data_type,
  dataset_release=excluded.dataset_release,source_name=excluded.source_name,
  source_url=excluded.source_url,updated_at=now();

-- Дополнительные продукты из пользовательских рецептов и маркировок.
-- Отрицательные fdc_id отделяют локальные/брендовые записи от идентификаторов USDA.
insert into public.food_nutrition_reference
  (canonical_name,aliases,kcal,protein,fat,carbs,fdc_id,data_type,dataset_release,source_name,source_url)
values
  ('вода',array['питьевая вода']::text[],0,0,0,0,-1001,'Справочное значение','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('грейпфрут',array['грейпфрут, мякоть','мякоть грейпфрута']::text[],42,0.77,0.14,10.66,-1002,'Foundation','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('рисовая лапша сухая',array['рисовая лапша','лапша рисовая']::text[],364,5.95,0.56,80.18,169742,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('разрыхлитель теста',array['разрыхлитель','пекарский порошок']::text[],51,0.1,0,24.1,172804,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('фарш минтая',array['минтай фарш','рыбный фарш из минтая','ингредиенты на всю партию: фарш минтая','ингредиенты на всю рыбную партию: фарш минтая']::text[],70,15.9,0.9,0,-1003,'Маркировка продукта','2026-08-21','Данные с упаковки',''),
  ('угорь унаги в соусе',array['угорь унаги','угорь в соусе','оставшийся угорь унаги']::text[],281.4,16.4,29.4,1.8,-1004,'Маркировка продукта','2026-08-21','Данные с упаковки',''),
  ('San Carlo Classica',array['чипсы San Carlo Classica']::text[],502,6.3,27,56.3,-1005,'Маркировка производителя','2026-08-21','San Carlo','https://www.sancarlo.it/it/prodotti_scheda.asp?NutrizionId=502&ProductId=171'),
  ('San Carlo Lime & Pink Pepper',array['San Carlo лайм с перцем','чипсы San Carlo Lime & Pink Pepper']::text[],493,6.7,26,56,-1006,'Маркировка производителя','2026-08-21','San Carlo','https://www.sancarlo.it/it/prodotti_scheda.asp?NutrizionId=570&ProductId=564'),
  ('San Carlo томат',array['San Carlo томатные','чипсы San Carlo томат','San Carlo помидор и базилик']::text[],480,6.9,23,59,-1007,'Маркировка производителя','2026-08-21','San Carlo','https://www.sancarlo.it/it/prodotti_scheda.asp?NutrizionId=746&ProductId=745'),
  ('консервированная кукуруза',array['кукуруза консервированная','половина банки консервированной кукурузы','оставшаяся половина банки кукурузы']::text[],72,2.3,1.4,12,-1008,'Данные из рецепта','2026-08-21','Данные пользователя',''),
  ('кокосовое молоко Aroy-D',array['Aroy-D кокосовое молоко','кокосовое молоко Aroy D','Aroy D кокосовое молоко']::text[],185,1.6,19,2,-1062,'Маркировка продукта','2026-08-28','Aroy-D / маркировка продукта','https://aroydbrand.com/our_product/uht-coconut-milk-4/')
on conflict (canonical_name) do update set
  aliases=excluded.aliases,kcal=excluded.kcal,protein=excluded.protein,fat=excluded.fat,
  carbs=excluded.carbs,fdc_id=excluded.fdc_id,data_type=excluded.data_type,
  dataset_release=excluded.dataset_release,source_name=excluded.source_name,
  source_url=excluded.source_url,updated_at=now();

-- Дополнительные проверенные продукты, встречающиеся в национальных рецептах.
-- Отрицательный ID является внутренним стабильным идентификатором строки;
-- значения на 100 г сверены со справочником USDA FoodData Central / SR Legacy.
insert into public.food_nutrition_reference
  (canonical_name,aliases,kcal,protein,fat,carbs,fdc_id,data_type,dataset_release,source_name,source_url)
values
  ('говядина постная',array['говядина','говядина для тушения','говядина на кости','говядина тонкими ломтиками','говяжий стейк','говяжьи рёбра','говяжья вырезка']::text[],250,26.1,15.3,0,-2001,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('баранина',array['бараний фарш','лопатка ягнёнка','лопатка ягненка']::text[],294,24.5,21,0,-2002,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('куриное бедро',array['куриные бёдра','куриные бедра','куриное бедро без кости','куриные бёдра без кости','куриные бедра без кости']::text[],191,19.7,12,0,-2003,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('куриный фарш',array['фарш из курицы','куриный фарш из бёдер']::text[],143,17.4,8.1,0,-2004,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('свиная грудинка',array['свиная грудинка без костей','свиная грудинка без кости']::text[],518,9.34,53,0,-2005,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('свиной фарш',array['фарш из свинины']::text[],263,16.9,21.2,0,-2006,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('говяжья печень',array['печень говяжья']::text[],135,20.4,3.63,3.89,-2007,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('зелёный лук',array['зеленый лук','перья зелёного лука','перья зеленого лука']::text[],32,1.83,0.19,7.34,-2008,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('петрушка',array['свежая петрушка']::text[],36,2.97,0.79,6.33,-2009,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кинза',array['кориандр свежий','листья кинзы']::text[],23,2.13,0.52,3.67,-2010,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('мята',array['свежая мята','листья мяты']::text[],44,3.29,0.73,8.41,-2011,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('руккола',array['салат руккола']::text[],25,2.58,0.66,3.65,-2012,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('салат ромэн',array['ромэн','салат ромен','листовой салат','листья салата']::text[],17,1.23,0.3,3.29,-2013,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('лук-порей',array['порей']::text[],61,1.5,0.3,14.15,-2014,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('дайкон',array['редька дайкон','маринованный дайкон']::text[],18,0.6,0.1,4.1,-2015,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('бок-чой',array['пак-чой','китайская капуста бок-чой']::text[],13,1.5,0.2,2.18,-2016,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('вёшенки',array['вешенки','грибы вёшенки','грибы вешенки']::text[],33,3.31,0.41,6.09,-2017,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('бамбуковые побеги',array['побеги бамбука']::text[],19,1.72,0.4,3.22,-2018,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('ростки маша',array['проростки маша','ростки сои']::text[],30,3.04,0.18,5.94,-2019,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('грецкие орехи',array['орех грецкий','грецкий орех']::text[],654,15.23,65.21,13.71,-2020,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('миндаль',array['миндальные лепестки']::text[],579,21.15,49.93,21.55,-2021,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кешью',array['жареный кешью']::text[],553,18.22,43.85,30.19,-2022,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кедровые орехи',array['кедровый орех']::text[],673,13.69,68.37,13.08,-2023,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('пармезан',array['сыр пармезан']::text[],431,38.46,28.61,4.06,-2024,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('пекорино романо',array['сыр пекорино','пекорино']::text[],387,31.9,26.94,3.63,-2025,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('рикотта',array['сыр рикотта']::text[],174,11.26,12.98,3.04,-2026,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кимчи',array['кимчхи','выдержанное кимчи','рассол кимчи']::text[],15,1.1,0.5,2.4,-2027,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кочуджан',array['кочудян','кочуджанг','кочудянг','кочуджан']::text[],205,4.9,1.7,43.2,-2028,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('рыбный соус',array['тайский рыбный соус']::text[],35,5.06,0.01,3.64,-2029,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('клейкий рис сухой',array['клейкий рис','рис клейкий']::text[],370,6.81,0.55,81.68,-2030,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('рис арборио',array['арборио','рис для ризотто']::text[],360,6.67,0.67,80,-2031,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('лапша соба сухая',array['лапша соба','соба']::text[],336,14.38,0.71,74.62,-2032,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('рисовая бумага',array['листы рисовой бумаги','листы для спринг-роллов']::text[],333,5.95,0.56,80.18,-2033,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('рисовые клёцки тток',array['рисовые палочки тток','тток','ттокпокки']::text[],235,4.5,0.3,52,-2034,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('крабовые палочки',array['сурими']::text[],95,7.62,0.46,15,-2035,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('панировочные сухари',array['панко','сухари панировочные']::text[],395,13.35,5.3,71.98,-2036,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('булгур сухой',array['булгур','булгур мелкий']::text[],342,12.29,1.33,75.87,-2037,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('перловая крупа',array['перловка']::text[],352,9.91,1.16,77.72,-2038,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('пшено',array['пшённая крупа','пшенная крупа']::text[],378,11.02,4.22,72.85,-2039,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кокосовое масло',array['масло кокосовое']::text[],892,0,99.06,0,-2040,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('майонез',array['майонез классический']::text[],680,0.96,74.85,0.57,-2041,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кетчуп',array['томатный кетчуп']::text[],101,1.04,0.1,27.4,-2042,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('горчица',array['горчица готовая','дижонская горчица','зернистая горчица']::text[],60,3.74,3.34,5.83,-2043,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('желатин',array['желатин пищевой']::text[],335,85.6,0.1,0,-2044,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('изюм',array['изюм без косточек']::text[],299,3.07,0.46,79.18,-2045,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('оливки',array['маслины']::text[],116,0.84,10.9,6,-2046,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('каперсы',array['каперсы маринованные']::text[],23,2.36,0.86,4.89,-2047,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('мидии сырые',array['мидии','мякоть мидий']::text[],86,11.9,2.24,3.69,-2048,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кукурузный крахмал',array['крахмал','кукурузный крахмал']::text[],381,0.26,0.05,91.27,-2049,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('сухие дрожжи',array['дрожжи','активные сухие дрожжи']::text[],325,40.44,7.61,41.22,-2050,'SR Legacy','2018-04-01','USDA FoodData Central','https://fdc.nal.usda.gov/')
on conflict (canonical_name) do update set
  aliases=excluded.aliases,kcal=excluded.kcal,protein=excluded.protein,fat=excluded.fat,
  carbs=excluded.carbs,fdc_id=excluded.fdc_id,data_type=excluded.data_type,
  dataset_release=excluded.dataset_release,source_name=excluded.source_name,
  source_url=excluded.source_url,updated_at=now();

-- Расширенный справочник повседневных овощей, фруктов, специй и соусов.
-- Отрицательные fdc_id — внутренние стабильные идентификаторы. Значения указаны
-- на 100 г как справочные средние; данные с этикетки пользователя имеют приоритет.
insert into public.food_nutrition_reference
  (canonical_name,aliases,kcal,protein,fat,carbs,fdc_id,data_type,dataset_release,source_name,source_url)
values
  ('спаржа',array['спаржа свежая','побеги спаржи']::text[],20,2.2,0.12,3.88,-3001,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('брюссельская капуста',array['капуста брюссельская','брюссельская капуста свежая']::text[],43,3.38,0.3,8.95,-3002,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('краснокочанная капуста',array['красная капуста','капуста краснокочанная']::text[],31,1.43,0.16,7.37,-3003,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('пекинская капуста',array['капуста пекинская','китайская капуста','капуста напа']::text[],16,1.2,0.2,3.23,-3004,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кейл',array['капуста кейл','кудрявая капуста','листовая капуста кейл']::text[],35,2.92,1.49,4.42,-3005,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('мангольд',array['листовая свёкла','листовая свекла','швейцарский мангольд']::text[],19,1.8,0.2,3.74,-3006,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кольраби',array['капуста кольраби']::text[],27,1.7,0.1,6.2,-3007,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('пастернак',array['корень пастернака']::text[],75,1.2,0.3,17.99,-3008,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('репа',array['репка','репа свежая']::text[],28,0.9,0.1,6.43,-3009,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('корень сельдерея',array['сельдерей корневой','корневой сельдерей']::text[],42,1.5,0.3,9.2,-3010,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('стручковая фасоль',array['зелёная фасоль','зеленая фасоль','спаржевая фасоль']::text[],31,1.83,0.22,6.97,-3011,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('артишок',array['артишоки','артишок свежий']::text[],47,3.27,0.15,10.51,-3012,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('окра',array['бамия','стручки окры']::text[],33,1.93,0.19,7.45,-3013,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('щавель',array['щавель свежий','листья щавеля']::text[],22,2,0.7,3.2,-3014,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('редька чёрная',array['редька черная','чёрная редька','черная редька']::text[],36,1.9,0.2,6.7,-3015,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('хрен',array['корень хрена','хрен свежий']::text[],48,1.18,0.69,11.29,-3016,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кукуруза свежая',array['кукуруза в початках','зёрна свежей кукурузы','зерна свежей кукурузы']::text[],86,3.27,1.35,18.7,-3017,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('савойская капуста',array['капуста савойская']::text[],27,2,0.1,6.1,-3018,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('водяной каштан',array['китайский водяной каштан','водяные каштаны']::text[],97,1.4,0.1,23.94,-3019,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('сахарный горошек',array['стручки сахарного горошка','снежный горошек','горох манжту']::text[],42,2.8,0.2,7.55,-3020,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('мандарин',array['мандарины','мандарин свежий']::text[],53,0.81,0.31,13.34,-3021,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('помело',array['памела','помело свежий']::text[],38,0.76,0.04,9.62,-3022,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('папайя',array['папайя спелая','мякоть папайи']::text[],43,0.47,0.26,10.82,-3023,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('гуава',array['гуава свежая','мякоть гуавы']::text[],68,2.55,0.95,14.32,-3024,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('инжир',array['инжир свежий','фига','смоква']::text[],74,0.75,0.3,19.18,-3025,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('айва',array['айва свежая','плод айвы']::text[],57,0.4,0.1,15.3,-3026,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('фейхоа',array['фейхоа свежая']::text[],61,0.71,0.42,15.21,-3027,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('маракуйя',array['маракуя','плод страсти','мякоть маракуйи']::text[],97,2.2,0.7,23.38,-3028,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('личи',array['плоды личи','личи свежие']::text[],66,0.83,0.44,16.53,-3029,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('питахайя',array['питайя','драконий фрукт','драконов фрукт']::text[],57,1.18,0.14,12.94,-3030,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('голубика',array['голубика свежая','садовая голубика']::text[],57,0.74,0.33,14.49,-3031,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('красная смородина',array['смородина красная','красная смородина свежая']::text[],56,1.4,0.2,13.8,-3032,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('белая смородина',array['смородина белая','белая смородина свежая']::text[],56,1.4,0.2,13.8,-3033,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('брусника',array['брусника свежая','ягоды брусники']::text[],46,0.7,0.5,8.2,-3034,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('облепиха',array['облепиха свежая','ягоды облепихи']::text[],82,1.2,5.4,5.7,-3035,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('шелковица',array['тутовник','ягоды шелковицы']::text[],43,1.44,0.39,9.8,-3036,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('физалис',array['физалис свежий','перуанская вишня']::text[],53,1.9,0.7,11.2,-3037,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кумкват',array['кумкваты','кумкват свежий']::text[],71,1.88,0.86,15.9,-3038,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('рамбутан',array['рамбутаны','рамбутан свежий']::text[],82,0.65,0.21,20.87,-3039,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('алыча свежая',array['алыча','слива алыча']::text[],34,0.2,0.1,7.9,-3040,'Reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('базилик свежий',array['базилик','листья базилика','зелёный базилик','зеленый базилик']::text[],23,3.15,0.64,2.65,-3041,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('базилик сушёный',array['сушеный базилик','сухой базилик']::text[],233,22.98,4.07,47.75,-3042,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кардамон',array['кардамон молотый','зёрна кардамона','зерна кардамона']::text[],311,10.76,6.7,68.47,-3043,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('гвоздика',array['гвоздика молотая','бутоны гвоздики']::text[],274,5.97,13,65.53,-3044,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('шафран',array['нити шафрана','шафран сушёный','шафран сушеный']::text[],310,11.43,5.85,65.37,-3045,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('порошок карри',array['карри','карри молотый','смесь карри']::text[],325,14.29,14.01,55.83,-3046,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('паприка сладкая',array['паприка','паприка молотая','сладкая паприка']::text[],282,14.14,12.89,53.99,-3047,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('кайенский перец',array['перец кайенский','кайенский перец молотый']::text[],318,12.01,17.27,56.63,-3048,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('семена горчицы',array['горчичные семена','горчица семена']::text[],508,26.08,36.24,28.09,-3049,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('семена фенхеля',array['фенхель семена','семя фенхеля']::text[],345,15.8,14.87,52.29,-3050,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('имбирь молотый',array['сушёный имбирь','сушеный имбирь','порошок имбиря']::text[],335,8.98,4.24,71.62,-3051,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('луковый порошок',array['сушёный лук молотый','сушеный лук молотый','порошок лука']::text[],341,10.41,1.04,79.12,-3052,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('душистый перец',array['перец душистый','ямайский перец']::text[],263,6.09,8.69,72.12,-3053,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('семена аниса',array['анис','анисовые семена']::text[],337,17.6,15.9,50.02,-3054,'USDA reference average','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('соус терияки',array['терияки','соус терияки готовый']::text[],89,5.93,0.02,15.56,-3055,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('соус шрирача',array['шрирача','острый соус шрирача']::text[],93,1.93,0.93,19.16,-3056,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('сладкий соус чили',array['соус сладкий чили','тайский сладкий чили']::text[],214,0.6,0.4,52,-3057,'Generic label average','2026-04-30','Среднее по маркировкам',''),
  ('соус барбекю',array['барбекю соус','соус bbq','bbq соус']::text[],172,0.82,0.63,40.77,-3058,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('вустерширский соус',array['ворчестерский соус','вустерский соус','соус ворчестер','соус вустер']::text[],78,0,0,19.46,-3059,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('соус песто',array['песто','песто дженовезе','зелёный песто','зеленый песто']::text[],384,5.1,36.3,6.2,-3060,'Generic label average','2026-04-30','Среднее по маркировкам',''),
  ('соус наршараб',array['наршараб','гранатовый соус']::text[],270,0.5,0.2,67,-3061,'Generic label average','2026-04-30','Среднее по маркировкам',''),
  ('сливовый соус',array['соус сливовый','китайский сливовый соус']::text[],184,0.89,0.7,42.81,-3062,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('соус табаско',array['табаско','острый соус табаско']::text[],12,1.29,0.76,0.8,-3063,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('бальзамический уксус',array['уксус бальзамический','бальзамик']::text[],88,0.49,0,17.03,-3064,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('соус сальса',array['сальса','томатная сальса']::text[],36,1.5,0.2,7,-3065,'USDA generic reference','2026-04-30','USDA FoodData Central','https://fdc.nal.usda.gov/'),
  ('соус понзу',array['понзу','цитрусовый соевый соус']::text[],45,3.2,0.1,8.4,-3066,'Generic label average','2026-04-30','Среднее по маркировкам','')
on conflict (canonical_name) do update set
  aliases=excluded.aliases,kcal=excluded.kcal,protein=excluded.protein,fat=excluded.fat,
  carbs=excluded.carbs,fdc_id=excluded.fdc_id,data_type=excluded.data_type,
  dataset_release=excluded.dataset_release,source_name=excluded.source_name,
  source_url=excluded.source_url,updated_at=now();

-- Обычная паприка относится к сладкой, а копчёная остаётся отдельным продуктом.
update public.food_nutrition_reference
set aliases=array_remove(array_remove(aliases,'паприка'),'паприка молотая'), updated_at=now()
where canonical_name='копчёная паприка';

update public.food_nutrition_reference
set aliases=(select array_agg(distinct value order by value) from unnest(aliases || array['гранат','плод граната']::text[]) value), updated_at=now()
where canonical_name='гранатовые зёрна';

-- Нормализованный индекс синонимов позволяет искать только видимые продукты
-- одним коротким запросом, не скачивая весь справочник в браузер.
create table if not exists public.food_nutrition_alias_lookup (
  alias_key text primary key,
  alias_label text not null,
  canonical_name text not null references public.food_nutrition_reference(canonical_name) on update cascade on delete cascade,
  updated_at timestamptz not null default now(),
  constraint food_nutrition_alias_key_not_blank check (length(btrim(alias_key)) > 0)
);

create index if not exists food_nutrition_alias_lookup_canonical_idx
on public.food_nutrition_alias_lookup (canonical_name);

alter table public.food_nutrition_alias_lookup enable row level security;
revoke all on table public.food_nutrition_alias_lookup from public, anon, authenticated;
grant select on table public.food_nutrition_alias_lookup to anon, authenticated;
drop policy if exists "Anyone can read food nutrition aliases" on public.food_nutrition_alias_lookup;
create policy "Anyone can read food nutrition aliases"
on public.food_nutrition_alias_lookup for select to anon, authenticated using (true);

insert into public.food_nutrition_alias_lookup (alias_key,alias_label,canonical_name)
select distinct on (alias_key) alias_key,alias_label,canonical_name
from (
  select
    btrim(regexp_replace(replace(lower(value),'ё','е'),'[^a-zа-я0-9-]+',' ','g')) as alias_key,
    value as alias_label,
    food.canonical_name
  from public.food_nutrition_reference food
  cross join lateral unnest(array_prepend(food.canonical_name,food.aliases)) value
) aliases
where alias_key <> ''
order by alias_key,canonical_name
on conflict (alias_key) do update set
  alias_label=excluded.alias_label,
  canonical_name=excluded.canonical_name,
  updated_at=now();

create schema if not exists private;

create or replace function private.sync_food_nutrition_alias_lookup()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  value text;
  normalized text;
  occupied_by text;
begin
  if tg_op in ('UPDATE','DELETE') then
    delete from public.food_nutrition_alias_lookup where canonical_name=old.canonical_name;
  end if;
  if tg_op in ('INSERT','UPDATE') then
    foreach value in array array_prepend(new.canonical_name,new.aliases) loop
      normalized:=btrim(regexp_replace(replace(lower(value),'ё','е'),'[^a-zа-я0-9-]+',' ','g'));
      if normalized<>'' then
        select canonical_name into occupied_by from public.food_nutrition_alias_lookup where alias_key=normalized;
        if occupied_by is not null and occupied_by<>new.canonical_name then
          raise exception 'Nutrition alias % already belongs to %',value,occupied_by;
        end if;
        insert into public.food_nutrition_alias_lookup(alias_key,alias_label,canonical_name)
        values(normalized,value,new.canonical_name)
        on conflict(alias_key) do update set alias_label=excluded.alias_label,canonical_name=excluded.canonical_name,updated_at=now();
      end if;
    end loop;
    return new;
  end if;
  return old;
end;
$$;

revoke all on function private.sync_food_nutrition_alias_lookup() from public, anon, authenticated;

drop trigger if exists sync_food_nutrition_alias_lookup on public.food_nutrition_reference;
create trigger sync_food_nutrition_alias_lookup
after insert or update of canonical_name,aliases or delete
on public.food_nutrition_reference
for each row execute function private.sync_food_nutrition_alias_lookup();

create or replace view public.food_nutrition_lookup
with (security_invoker=true)
as
select
  lookup.alias_key,
  food.canonical_name,
  food.aliases,
  food.kcal,
  food.protein,
  food.fat,
  food.carbs,
  food.fdc_id,
  food.data_type,
  food.dataset_release,
  food.source_name,
  food.source_url
from public.food_nutrition_alias_lookup lookup
join public.food_nutrition_reference food using (canonical_name);

revoke all on table public.food_nutrition_lookup from public, anon, authenticated;
grant select on table public.food_nutrition_lookup to anon, authenticated;

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
