-- Schema snapshot of tables that already exist in production Supabase.
-- Idempotent: safe to re-run.

create extension if not exists "uuid-ossp";

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null,
  parent_id uuid,
  group_name text,
  subtitle text,
  image_url text,
  banner_image_url text,
  badge text,
  sort_order integer default 0,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.delivery_settings (
  id text primary key default 'default',
  free_delivery_threshold numeric not null default 999,
  standard_delivery_fee numeric not null default 49,
  express_delivery_fee numeric not null default 99,
  midnight_delivery_fee numeric not null default 149,
  estimated_timeline text not null default 'Within 90 Minutes Express / Same-Day (Kolkata)',
  dispatch_hub_name text not null default 'Kolkata Central Hub',
  dispatch_hub_address text not null default 'Chingrighata Central Hub, Salt Lake Bypass, Kolkata - 700105',
  support_phone text default '6201069758',
  support_email text default 'contact@msflowers.in',
  updated_at timestamptz default now()
);

create table if not exists public.hero_slides (
  id text primary key,
  headline text not null,
  headline_color text default 'text-[#b91c1c]',
  subtitle text not null,
  badge text,
  cta_label text default 'SHOP NOW',
  cta_href text default '#combos',
  desktop_image_url text not null,
  mobile_image_url text not null,
  card_bg text default 'bg-linear-to-b from-[#f5e4d7] via-[#f7e9df] to-[#fbf2ec]',
  display_order integer default 1,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: public can only read; all writes go through the service-role key (API routes).
alter table public.delivery_settings enable row level security;
alter table public.hero_slides enable row level security;

drop policy if exists "Public read delivery settings" on public.delivery_settings;
create policy "Public read delivery settings" on public.delivery_settings
  for select using (true);

drop policy if exists "Public read active hero slides" on public.hero_slides;
create policy "Public read active hero slides" on public.hero_slides
  for select using (is_active = true);
