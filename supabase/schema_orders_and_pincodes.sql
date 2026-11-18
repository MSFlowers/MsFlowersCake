-- ==============================================================================
-- MS Flowers: Serviceable Pincodes & Dynamic Orders Schema + Seed Data
-- Run this in your Supabase Dashboard -> SQL Editor (Safe & Idempotent)
-- ==============================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Pincodes Table (Kolkata Central Delivery Hubs)
-- ------------------------------------------------------------------------------
create table if not exists public.pincodes (
  id            uuid primary key default gen_random_uuid(),
  pincode       text unique not null,
  area_name     text not null,
  is_active     boolean not null default true,
  delivery_time text not null default '45–90 Mins',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists pincodes_code_idx on public.pincodes(pincode);
create index if not exists pincodes_active_idx on public.pincodes(is_active);

-- Automatic updated_at trigger for pincodes
create or replace function public.set_pincode_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_pincode_updated_at_trigger on public.pincodes;
create trigger set_pincode_updated_at_trigger
before update on public.pincodes
for each row execute function public.set_pincode_updated_at();

alter table public.pincodes enable row level security;
drop policy if exists "Public read active pincodes" on public.pincodes;
create policy "Public read active pincodes" on public.pincodes for select using (true);

drop policy if exists "Allow service role full access on pincodes" on public.pincodes;
create policy "Allow service role full access on pincodes" on public.pincodes using (true) with check (true);

-- Seed Handwritten Kolkata Central Delivery Pincodes (From Notebook)
insert into public.pincodes (pincode, area_name, is_active, delivery_time)
values
  ('700105', 'Chingrighata / Salt Lake Bypass Hub', true, '45–60 Mins Express'),
  ('700091', 'Salt Lake Sector V / Technopolis', true, '45–60 Mins Express'),
  ('700064', 'Salt Lake Sector I, II & City Centre 1', true, '45–60 Mins Express'),
  ('700098', 'Salt Lake Sector III & Stadium Area', true, '45–60 Mins Express'),
  ('701106', 'Salt Lake Sector IV Hub', true, '45–60 Mins Express'),
  ('700010', 'Beliaghata / Phoolbagan Crossing', true, '45–60 Mins Express'),
  ('700015', 'Tanggara / Seal Lane / Science City', true, '45–60 Mins Express'),
  ('700054', 'Kankurgachi / VIP Market', true, '60–90 Mins Hub Slot'),
  ('700085', 'Ultadanga / Hudco Crossing', true, '60–90 Mins Hub Slot'),
  ('700048', 'Lake Town / Bangur Avenue', true, '60–90 Mins Hub Slot'),
  ('700052', 'VIP Road / Kaikhali Crossing', true, '60–90 Mins Hub Slot'),
  ('700046', 'Topsia / Tangra South Bypass', true, '45–60 Mins Express'),
  ('700042', 'Kasba / Ruby Hospital EM Bypass', true, '60–90 Mins Hub Slot'),
  ('700107', 'Anandapur / Kasba East / Ruby Area', true, '60–90 Mins Hub Slot'),
  ('700156', 'New Town Action Area I / Eco Park', true, '60–90 Mins Hub Slot')
on conflict (pincode) do update set
  area_name = excluded.area_name,
  is_active = excluded.is_active,
  delivery_time = excluded.delivery_time;

-- ------------------------------------------------------------------------------
-- 2. Dynamic Orders Table (Supports existing and fresh tables)
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text unique not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Ensure all required columns exist even if table was created previously
alter table public.orders add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.orders add column if not exists customer_name text not null default 'Customer';
alter table public.orders add column if not exists customer_email text not null default 'customer@msflowers.in';
alter table public.orders add column if not exists customer_phone text default '';
alter table public.orders add column if not exists recipient_name text;
alter table public.orders add column if not exists recipient_phone text;
alter table public.orders add column if not exists delivery_address text not null default 'Kolkata Central Hub';
alter table public.orders add column if not exists area text;
alter table public.orders add column if not exists pincode text not null default '700105';
alter table public.orders add column if not exists slot_type text not null default 'standard';
alter table public.orders add column if not exists slot_time_window text default 'Standard Daytime Delivery';
alter table public.orders add column if not exists delivery_date text;
alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists item_count integer not null default 1;
alter table public.orders add column if not exists items_subtotal numeric(10,2) not null default 0.00;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists coupon_discount numeric(10,2) not null default 0.00;
alter table public.orders add column if not exists slot_fee numeric(10,2) not null default 0.00;
alter table public.orders add column if not exists grand_total numeric(10,2) not null default 0.00;
alter table public.orders add column if not exists payment_method text not null default 'Cash on Delivery (COD)';
alter table public.orders add column if not exists payment_status text not null default 'Pending';
alter table public.orders add column if not exists status text not null default 'Confirmed';
alter table public.orders add column if not exists cake_message text;
alter table public.orders add column if not exists card_message text;
alter table public.orders add column if not exists delivery_note text;
alter table public.orders add column if not exists occasion text;

create index if not exists orders_number_idx on public.orders(order_number);
create index if not exists orders_email_idx on public.orders(customer_email);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- Automatic updated_at trigger for orders
create or replace function public.set_order_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_order_updated_at_trigger on public.orders;
create trigger set_order_updated_at_trigger
before update on public.orders
for each row execute function public.set_order_updated_at();

alter table public.orders enable row level security;

-- Drop previous restrictive policies
drop policy if exists "Customer read orders by email" on public.orders;
drop policy if exists "Allow public order insertion" on public.orders;
drop policy if exists "Allow service role full access on orders" on public.orders;

-- Allow public read & insert for storefront checkouts
create policy "Allow public order insertion" on public.orders for insert with check (true);
create policy "Customer read orders by email" on public.orders for select using (true);
create policy "Allow service role full access on orders" on public.orders using (true) with check (true);

-- ------------------------------------------------------------------------------
-- 3. Seed Initial Sample Orders (Matching Reference Screen)
-- ------------------------------------------------------------------------------
insert into public.orders (
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  recipient_name,
  recipient_phone,
  delivery_address,
  area,
  pincode,
  slot_type,
  slot_time_window,
  delivery_date,
  items,
  item_count,
  items_subtotal,
  coupon_code,
  coupon_discount,
  slot_fee,
  grand_total,
  payment_method,
  status,
  cake_message,
  card_message
)
values
  (
    '#MS-413271',
    'M. Irsu',
    'm.irsu77777@gmail.com',
    '6201069758',
    'M. Irsu',
    '6201069758',
    'Chingrighata Bypass, Near Central Hub, Flat 4B',
    'Chingrighata',
    '700105',
    'standard',
    'Within 90 Minutes Express',
    '2026-11-18',
    '[
      {
        "sku": "MS-FL-01",
        "name": "Luxury Red Roses Bouquet (12 Blooms)",
        "qty": 1,
        "price": 799,
        "image": "/products/flowers/red-roses-bouquet.jpg"
      }
    ]'::jsonb,
    1,
    799.00,
    'WELCOME10',
    80.00,
    49.00,
    768.00,
    'Cash on Delivery (COD)',
    'Confirmed',
    'Happy Celebration!',
    'Wishing you love and happiness from Kolkata.'
  ),
  (
    '#MS-762558',
    'M. Irsu',
    'm.irsu77777@gmail.com',
    '6201069758',
    'Priya Sharma',
    '9830012345',
    'Salt Lake Sector V, Block EP & GP, Technopolis',
    'Salt Lake',
    '700091',
    'midnight',
    '11:30 PM – 12:15 AM Midnight Slot',
    '2026-11-17',
    '[
      {
        "sku": "MS-CK-02",
        "name": "Dutch Chocolate Truffle Cake (1 Kg)",
        "qty": 1,
        "price": 1099,
        "image": "/products/cakes/chocolate-truffle.jpg"
      },
      {
        "sku": "MS-FL-03",
        "name": "Exotic Purple Orchids in Glass Vase",
        "qty": 1,
        "price": 499,
        "image": "/products/flowers/purple-orchids-vase.jpg"
      }
    ]'::jsonb,
    2,
    1598.00,
    null,
    0.00,
    149.00,
    1747.00,
    'Cash on Delivery (COD)',
    'Cancelled',
    'Happy Birthday Priya!',
    'Many many happy returns of the day.'
  ),
  (
    '#MS-891043',
    'Sushain Demo',
    'sushain16kaushal@gmail.com',
    '9876543210',
    'Sushain Demo',
    '9876543210',
    'Salt Lake City, Sector 2, Kolkata',
    'Salt Lake',
    '700091',
    'standard',
    'Within 90 Minutes Express',
    '2026-11-18',
    '[
      {
        "sku": "MS-FL-02",
        "name": "Imperial Pink Lilies & Carnations Bunch",
        "qty": 1,
        "price": 1299,
        "image": "/products/flowers/pink-lilies-carnations.jpg"
      }
    ]'::jsonb,
    1,
    1299.00,
    'WELCOME10',
    130.00,
    49.00,
    1218.00,
    'Online Payment (UPI)',
    'Processing',
    '',
    'Best wishes!'
  ),
  (
    '#MS-552194',
    'Rahul Mukherjee',
    'rahul.m@gmail.com',
    '9831098765',
    'Megha Sen',
    '9830112233',
    'Park Street, Flat 3A, Near Park Hotel',
    'Park Street',
    '700016',
    'standard',
    'Standard Hub Slot',
    '2026-11-18',
    '[
      {
        "sku": "MS-CB-01",
        "name": "Classic Romance Rose Bouquet & Truffle Cake",
        "qty": 1,
        "price": 1899,
        "image": "/products/combos/roses-truffle-cake.jpg"
      }
    ]'::jsonb,
    1,
    1899.00,
    'KOLKATA10',
    190.00,
    49.00,
    1758.00,
    'Online Payment (Card)',
    'Shipped',
    'Happy Anniversary!',
    'Forever together.'
  ),
  (
    '#MS-318492',
    'Ananya Banerjee',
    'ananya.banerjee@gmail.com',
    '9830998877',
    'Ananya Banerjee',
    '9830998877',
    'New Town Action Area I, Eco Space, Kolkata',
    'New Town',
    '700156',
    'standard',
    'Standard Hub Slot',
    '2026-11-17',
    '[
      {
        "sku": "MS-FL-01",
        "name": "Luxury Red Roses Bouquet (12 Blooms)",
        "qty": 1,
        "price": 799,
        "image": "/products/flowers/red-roses-bouquet.jpg"
      }
    ]'::jsonb,
    1,
    799.00,
    null,
    0.00,
    49.00,
    848.00,
    'Cash on Delivery (COD)',
    'Delivered',
    '',
    'Congratulations on the new home!'
  )
on conflict (order_number) do nothing;
