-- ==============================================================================
-- MS Flowers: Customer Profiles & Auth Sync Schema
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable pgcrypto (if not already enabled)
create extension if not exists "pgcrypto";

-- 2. Create public.profiles table (linked directly to auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  phone        text,
  avatar_url   text,
  role         text not null default 'customer' check (role in ('customer', 'admin', 'staff')),
  orders_count integer not null default 0,
  total_spent  numeric(10,2) not null default 0.00,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for fast lookup by email and role
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx  on public.profiles(role);
create index if not exists profiles_created_idx on public.profiles(created_at desc);

-- 3. Automatic updated_at trigger
create or replace function public.set_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profile_updated_at_trigger on public.profiles;
create trigger set_profile_updated_at_trigger
before update on public.profiles
for each row execute function public.set_profile_updated_at();

-- 4. Automatic Auth Sync: When a user signs up via Supabase Auth,
-- automatically insert a profile row into public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end,
    phone = case when excluded.phone <> '' then excluded.phone else public.profiles.phone end,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate the auth trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Backfill existing users from auth.users (if any already exist)
insert into public.profiles (id, email, full_name, phone, role, created_at)
select 
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  coalesce(raw_user_meta_data->>'phone', ''),
  coalesce(raw_user_meta_data->>'role', 'customer'),
  created_at
from auth.users
on conflict (id) do nothing;

-- 6. Enable Row Level Security (RLS) on public.profiles
alter table public.profiles enable row level security;

-- Policy 1: Users can read their own profile
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy 2: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policy 3: Public read for basic metadata if needed, or service role full access
drop policy if exists "Allow service role full access" on public.profiles;
create policy "Allow service role full access"
  on public.profiles
  using (true)
  with check (true);

-- ==============================================================================
-- 7. (Optional / Recommended) Orders Table Linked to Profiles
-- ==============================================================================
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null,
  user_id          uuid references public.profiles(id) on delete set null,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  recipient_name   text,
  recipient_phone  text,
  delivery_address text,
  area             text,
  pincode          text,
  slot_label       text,
  delivery_date    date,
  items            jsonb not null default '[]'::jsonb,
  item_count       integer not null default 1,
  total_amount     numeric(10,2) not null check (total_amount >= 0),
  payment_method   text default 'Cash on Delivery (COD)',
  payment_status   text default 'Pending' check (payment_status in ('Pending', 'Paid', 'Failed')),
  order_status     text default 'Pending' check (order_status in ('Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_email_idx   on public.orders(customer_email);
create index if not exists orders_created_idx on public.orders(created_at desc);

alter table public.orders enable row level security;

-- Users can view their own orders
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id or auth.jwt()->>'email' = customer_email);

-- Anyone / Service role can insert new orders on checkout
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);
