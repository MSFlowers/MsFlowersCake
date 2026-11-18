-- ==============================================================================
-- MS Flowers: Dynamic Customer Reviews (with Moderation) & Bulk Inquiries
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

create extension if not exists "pgcrypto";

-- 1. Reviews Table
create table if not exists public.reviews (
  id                  uuid primary key default gen_random_uuid(),
  product_id          text not null,
  product_name        text not null,
  product_image       text,
  customer_id         uuid references public.customers(id) on delete set null,
  customer_name       text not null,
  customer_email      text not null,
  rating              integer not null check (rating >= 1 and rating <= 5),
  title               text,
  comment             text not null,
  photo_url           text,
  is_verified_buyer   boolean not null default true,
  status              text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_status_idx on public.reviews(status);

alter table public.reviews enable row level security;
drop policy if exists "Public read approved reviews" on public.reviews;
create policy "Public read approved reviews" on public.reviews for select using (true);
drop policy if exists "Allow service role full access on reviews" on public.reviews;
create policy "Allow service role full access on reviews" on public.reviews using (true) with check (true);

-- 2. Inquiries Table
create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text not null,
  inquiry_type  text not null default 'Bulk / Wholesale Order',
  location      text not null default 'Kolkata',
  message       text not null,
  status        text not null default 'unresolved' check (status in ('unresolved', 'resolved')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists inquiries_status_idx on public.inquiries(status);

alter table public.inquiries enable row level security;
drop policy if exists "Public read inquiries" on public.inquiries;
create policy "Public read inquiries" on public.inquiries for select using (true);
drop policy if exists "Allow service role full access on inquiries" on public.inquiries;
create policy "Allow service role full access on inquiries" on public.inquiries using (true) with check (true);

-- 3. Initial Seed Reviews (Matching Flowers, Cakes & Combos)
insert into public.reviews (product_id, product_name, customer_name, customer_email, rating, title, comment, status)
values
  ('fl-01', 'Velvet Crimson 12 Red Roses Bouquet', 'Sushain Demo', 'sushaindemo@gmail.com', 5, 'Fresh and Fragrant Blooms', 'The Dutch roses arrived fresh and blooming on time for our anniversary in Salt Lake. Amazing packaging!', 'approved'),
  ('ck-01', 'Signature Belgian Chocolate Truffle Cake', 'Priya Roy', 'priya.roy@gmail.com', 5, 'Super Moist & Rich Chocolate', 'Ordered for midnight delivery at Chingrighata. Reached right at 12:00 AM! Taste was divine.', 'approved'),
  ('fl-02', 'Imperial Pink Lilies & Carnations Bunch', 'Ananya Banerjee', 'ananya.banerjee@gmail.com', 5, 'Elegant presentation', 'Beautiful flowers with wonderful scent. Delivered within 60 mins express slot.', 'approved'),
  ('cb-01', 'Classic Romance Rose Bouquet & Truffle Cake', 'Rahul Mukherjee', 'rahul.m@gmail.com', 4, 'Great value combo', 'The combination of fresh red roses and dark truffle cake was perfect for my sister birthday.', 'approved'),
  ('fl-01', 'Velvet Crimson 12 Red Roses Bouquet', 'Dev Sharma', 'dev.sharma@gmail.com', 5, 'Pending Review Example', 'I recently ordered this bouquet and was impressed with the freshness and wrapping.', 'pending')
on conflict do nothing;

-- 4. Initial Seed Inquiries (Matching Ref Image 3)
insert into public.inquiries (name, email, phone, inquiry_type, location, message, status)
values
  ('Sushain', 'ask@gmail.com', '9876543210', 'Bulk / Wholesale Order', 'Salt Lake, Kolkata', 'Need 40 Dutch rose bouquets and personalized gift boxes for our corporate anniversary event.', 'resolved'),
  ('Roel Sharma', 'roel.sharma@gmail.com', '9876543210', 'Custom Bouquet / Event', 'New Town, Kolkata', 'Looking for stage floral decor and 50 wedding centerpiece bouquets for next weekend reception.', 'unresolved'),
  ('Megha Sen', 'megha.sen@gmail.com', '9830112233', 'Bulk / Wholesale Order', 'Park Street, Kolkata', 'We require regular weekly flower arrangements for our boutique hotel lobby.', 'unresolved')
on conflict do nothing;
