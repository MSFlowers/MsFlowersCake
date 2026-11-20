-- RLS HARDENING
-- Problem: policies named "Allow service role full access ..." were created as `using (true)` WITHOUT
-- `to service_role`, so they apply to the public/anon role -> anyone with the (public) anon key could
-- read/write customers (password hashes), orders, inquiries, pincodes, reviews, coupons, etc.
-- The service-role key bypasses RLS automatically, so those policies are not needed.
--
-- This script keeps ONLY the anon read policies the storefront needs and drops everything else.
-- Safe because every other table is accessed via supabaseAdmin (service role) in the code.
-- !! Make sure SUPABASE_Secret_key is the real service_role key before running (see README of audit),
--    otherwise admin/orders APIs will start failing.

do $$
declare
  r record;
  keep jsonb := '{
    "categories":        ["Public read active categories"],
    "products":          ["Public read active products"],
    "product_categories":["Public read product_categories"],
    "hero_slides":       ["Public read active hero slides"],
    "delivery_settings": ["Public read delivery settings"],
    "coupons":           ["Public read active coupons"],
    "store_settings":    ["Allow public read on store_settings"],
    "pincodes":          ["Public read active pincodes"],
    "reviews":           [],
    "orders":            [],
    "customers":         [],
    "inquiries":         [],
    "razorpay_pending_orders": [],
    "profiles":          ["Users can read own profile","Users can update own profile"]
  }';
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (select jsonb_object_keys(keep))
  loop
    if not (keep -> r.tablename) ? r.policyname then
      execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
      raise notice 'dropped % on %', r.policyname, r.tablename;
    end if;
  end loop;
end $$;

-- Reviews: anon may only read APPROVED reviews (was `using (true)` -> leaked pending/rejected + emails).
drop policy if exists "Public read approved reviews" on public.reviews;
create policy "Public read approved reviews" on public.reviews
  for select using (status = 'approved');
