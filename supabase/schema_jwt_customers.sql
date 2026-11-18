-- ==============================================================================
-- MS Flowers: Pure Custom JWT Customers Table Schema
-- Run this in your Supabase Dashboard -> SQL Editor
-- (Does NOT depend on Supabase Auth / auth.users)
-- ==============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text unique not null,
  phone        text,
  password     text not null,
  role         text not null default 'customer' check (role in ('customer', 'admin')),
  orders_count integer not null default 0,
  total_spent  numeric(10,2) not null default 0.00,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Fast lookup indexes
create index if not exists customers_email_idx on public.customers(email);
create index if not exists customers_role_idx  on public.customers(role);
create index if not exists customers_created_idx on public.customers(created_at desc);

-- Automatic updated_at trigger
create or replace function public.set_customer_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_customer_updated_at_trigger on public.customers;
create trigger set_customer_updated_at_trigger
before update on public.customers
for each row execute function public.set_customer_updated_at();

-- Enable Row Level Security (RLS)
alter table public.customers enable row level security;

-- Policy: Allow service role full access for backend API operations
drop policy if exists "Allow service role full access on customers" on public.customers;
create policy "Allow service role full access on customers"
  on public.customers
  using (true)
  with check (true);

-- (Optional) Seed a default demo admin / customer if you want
-- password is "msflowers123"
-- insert into public.customers (name, email, phone, password, role)
-- values ('MS Admin', 'admin@msflowers.in', '9830012345', 'dummy_hash', 'admin')
-- on conflict (email) do nothing;
