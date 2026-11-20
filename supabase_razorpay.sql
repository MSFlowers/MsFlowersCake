-- Run this once in Supabase -> SQL Editor
alter table public.orders
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_signature text;

create unique index if not exists orders_razorpay_payment_id_key
  on public.orders (razorpay_payment_id)
  where razorpay_payment_id is not null;

create unique index if not exists orders_razorpay_order_id_key
  on public.orders (razorpay_order_id)
  where razorpay_order_id is not null;

-- Webhook support: stores checkout data until payment is confirmed
create table if not exists public.razorpay_pending_orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text unique not null,
  order_data jsonb not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.razorpay_pending_orders enable row level security;
