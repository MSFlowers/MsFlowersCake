-- SECURITY FIX: categories had a policy "Admin full access" (ALL, role public, using true)
-- which let anyone holding the anon key insert/update/delete categories.
-- Writes go through the service-role key (bypasses RLS), so the policy is not needed.

drop policy if exists "Admin full access on categories" on public.categories;

-- Keep public read of active categories (already exists; recreate idempotently).
drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories" on public.categories
  for select using (is_active = true);

-- hero_slides / delivery_settings: RLS is on. Add public read so anon-key reads work too.
drop policy if exists "Public read delivery settings" on public.delivery_settings;
create policy "Public read delivery settings" on public.delivery_settings
  for select using (true);

drop policy if exists "Public read active hero slides" on public.hero_slides;
create policy "Public read active hero slides" on public.hero_slides
  for select using (is_active = true);
