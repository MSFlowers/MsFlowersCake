-- ==============================================================================
-- MS Flowers: Promo Coupons & Discounts Schema + Seed Data
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  description    text,
  discount_type  text not null check (discount_type in ('percentage', 'flat')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_order      numeric(10,2) not null default 0,
  max_discount   numeric(10,2),
  expiry_date    date,
  usage_count    integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Fast lookup indexes
create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_active_idx on public.coupons(is_active);
create index if not exists coupons_created_idx on public.coupons(created_at desc);

-- Automatic updated_at trigger
create or replace function public.set_coupon_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_coupon_updated_at_trigger on public.coupons;
create trigger set_coupon_updated_at_trigger
before update on public.coupons
for each row execute function public.set_coupon_updated_at();

-- Enable Row Level Security (RLS)
alter table public.coupons enable row level security;

-- Public can read active coupons on checkout
drop policy if exists "Public read active coupons" on public.coupons;
create policy "Public read active coupons"
  on public.coupons for select
  using (is_active = true);

-- Service role full access for admin management
drop policy if exists "Allow service role full access on coupons" on public.coupons;
create policy "Allow service role full access on coupons"
  on public.coupons
  using (true)
  with check (true);

-- ==============================================================================
-- Seed Mentioned MS Flowers Promo Coupons
-- ==============================================================================
insert into public.coupons (
  code,
  description,
  discount_type,
  discount_value,
  min_order,
  max_discount,
  expiry_date,
  usage_count,
  is_active
)
values
  (
    'WELCOME10',
    'Get 10% OFF on your floral bouquets & celebration cakes (up to ₹500)',
    'percentage',
    10.00,
    499.00,
    500.00,
    '2027-12-31',
    42,
    true
  ),
  (
    'KOLKATA10',
    'Special Kolkata celebration 10% instant discount across all blooms',
    'percentage',
    10.00,
    0.00,
    250.00,
    '2027-12-31',
    64,
    true
  ),
  (
    'FIRST100',
    'Flat ₹100 Instant Discount on orders above ₹799',
    'flat',
    100.00,
    799.00,
    null,
    '2027-12-31',
    38,
    true
  ),
  (
    'MSFLOWERS50',
    'Flat ₹50 Instant Discount on quick delivery orders above ₹499',
    'flat',
    50.00,
    499.00,
    null,
    '2027-12-31',
    51,
    true
  ),
  (
    'CAKE15',
    '15% OFF on freshly baked celebration cakes & midnight deliveries',
    'percentage',
    15.00,
    599.00,
    300.00,
    '2027-12-31',
    27,
    true
  ),
  (
    'FRESH15',
    '15% OFF on premium Dutch roses, orchids, and handpicked blooms',
    'percentage',
    15.00,
    599.00,
    300.00,
    '2027-12-31',
    33,
    true
  )
on conflict (code) do update set
  description = excluded.description,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_order = excluded.min_order,
  max_discount = excluded.max_discount,
  expiry_date = excluded.expiry_date,
  is_active = excluded.is_active;
