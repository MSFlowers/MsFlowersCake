-- Run in Supabase Dashboard -> SQL Editor
alter table public.customers
  add column if not exists email_verified boolean not null default false,
  add column if not exists verification_token_hash text,
  add column if not exists verification_expires_at timestamptz;

-- Existing customers are treated as already verified (so nobody gets locked out)
update public.customers set email_verified = true where email_verified = false;

create index if not exists customers_verification_token_idx
  on public.customers(verification_token_hash);
