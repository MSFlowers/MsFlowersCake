-- MS Flowers: products table (run in Supabase SQL Editor)
-- Assumes public.categories(id uuid) already exists.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  group_type       text not null check (group_type in ('Flowers','Cakes','Combos')),
  category_id      uuid references public.categories(id) on delete set null,      -- root: Cakes / Flowers / Combos
  sub_category_id  uuid references public.categories(id) on delete set null,      -- pill tab: Chocolate, Roses...
  price            numeric(10,2) not null check (price >= 0),
  original_price   numeric(10,2),
  rating           numeric(2,1) not null default 5.0,
  reviews_count    integer not null default 0,
  delivery_tag     text not null default '90-Min Delivery',
  badge            text,
  tagline          text,
  description      text,
  image            text not null,
  images           text[] not null default '{}',
  is_eggless       boolean not null default false,
  weight           text,
  specs            jsonb not null default '{}'::jsonb,
  care_tips        text[] not null default '{}',
  delivery_info    text[] not null default '{}',
  stock            integer not null default 25,
  threshold        integer not null default 5,
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  reviews          jsonb not null default '[]'::jsonb,
  is_midnight      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists products_group_idx   on public.products (group_type) where is_active;
create index if not exists products_cat_idx     on public.products (category_id);
create index if not exists products_subcat_idx  on public.products (sub_category_id);
create index if not exists products_created_idx on public.products (created_at desc);

create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();

-- RLS: public can read active products; writes only via service role (admin API)
alter table public.products enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
  on public.products for select
  using (is_active = true);

-- Optional many-to-many: one product in several categories/occasions (Birthday + Chocolate + Midnight)
create table if not exists public.product_categories (
  product_id  uuid not null references public.products(id)   on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);
alter table public.product_categories enable row level security;
drop policy if exists "Public read product_categories" on public.product_categories;
create policy "Public read product_categories" on public.product_categories for select using (true);
