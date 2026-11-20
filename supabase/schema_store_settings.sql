-- ============================================================
-- MS FLOWERS & CAKE - STORE SETTINGS (FOOTER, CONTACT & SOCIALS)
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'MS Flowers & Cake',
  tagline TEXT NOT NULL DEFAULT 'Kolkata’s trusted boutique destination for fresh handpicked flower bouquets, artisanal celebration cakes, and romantic flower + cake combos.',
  support_phone TEXT NOT NULL DEFAULT '+91 6295233296',
  support_email TEXT NOT NULL DEFAULT 'rohit62952332@gmail.com',
  order_notification_email TEXT NOT NULL DEFAULT 'rohit62952332@gmail.com',
  order_email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  address TEXT NOT NULL DEFAULT 'Chingrighata, Salt Lake, Kolkata, West Bengal - 700105',
  operating_hours TEXT NOT NULL DEFAULT 'Open Daily: 8:00 AM – 11:30 PM',
  midnight_hours TEXT NOT NULL DEFAULT 'Midnight Delivery Available (Till 12:30 AM)',
  whatsapp_number TEXT NOT NULL DEFAULT '+91 6295233296',
  whatsapp_url TEXT DEFAULT 'https://wa.me/916295233296',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/profile.php?id=61596205570248',
  instagram_url TEXT DEFAULT 'https://instagram.com/msflowers_kolkata',
  copyright_text TEXT DEFAULT '© 2026 MS: Online Flowers and Cake Delivery in Kolkata. All rights reserved.',
  handcrafted_text TEXT DEFAULT 'Handcrafted with ❤️ in Chingrighata, Salt Lake, Kolkata',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Allow public read on store_settings'
  ) THEN
    CREATE POLICY "Allow public read on store_settings"
      ON public.store_settings FOR SELECT
      USING (true);
  END IF;
END $$;

-- Allow admin full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Allow admin all on store_settings'
  ) THEN
    CREATE POLICY "Allow admin all on store_settings"
      ON public.store_settings FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Seed default initial row
INSERT INTO public.store_settings (
  id,
  store_name,
  tagline,
  support_phone,
  support_email,
  order_notification_email,
  order_email_notifications_enabled,
  address,
  operating_hours,
  midnight_hours,
  whatsapp_number,
  whatsapp_url,
  facebook_url,
  instagram_url,
  copyright_text,
  handcrafted_text
) VALUES (
  'default',
  'MS Flowers & Cake',
  'Kolkata’s trusted boutique destination for fresh handpicked flower bouquets, artisanal celebration cakes, and romantic flower + cake combos.',
  '+91 6295233296',
  'rohit62952332@gmail.com',
  'rohit62952332@gmail.com',
  true,
  'Chingrighata, Salt Lake, Kolkata, West Bengal - 700105',
  'Open Daily: 8:00 AM – 11:30 PM',
  'Midnight Delivery Available (Till 12:30 AM)',
  '+91 6295233296',
  'https://wa.me/916295233296',
  'https://www.facebook.com/profile.php?id=61596205570248',
  'https://instagram.com/msflowers_kolkata',
  '© 2026 MS: Online Flowers and Cake Delivery in Kolkata. All rights reserved.',
  'Handcrafted with ❤️ in Chingrighata, Salt Lake, Kolkata'
) ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  support_phone = EXCLUDED.support_phone,
  support_email = EXCLUDED.support_email,
  address = EXCLUDED.address,
  operating_hours = EXCLUDED.operating_hours,
  midnight_hours = EXCLUDED.midnight_hours,
  whatsapp_number = EXCLUDED.whatsapp_number,
  whatsapp_url = EXCLUDED.whatsapp_url,
  facebook_url = EXCLUDED.facebook_url,
  instagram_url = EXCLUDED.instagram_url,
  copyright_text = EXCLUDED.copyright_text,
  handcrafted_text = EXCLUDED.handcrafted_text;
