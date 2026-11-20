-- ============================================================
-- MS FLOWERS & CAKE - ORDER EMAIL NOTIFICATION SETTINGS
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS order_notification_email TEXT NOT NULL DEFAULT 'rohit62952332@gmail.com',
  ADD COLUMN IF NOT EXISTS order_email_notifications_enabled BOOLEAN NOT NULL DEFAULT true;

UPDATE public.store_settings
SET
  order_notification_email = COALESCE(NULLIF(TRIM(order_notification_email), ''), 'rohit62952332@gmail.com'),
  order_email_notifications_enabled = COALESCE(order_email_notifications_enabled, true)
WHERE id = 'default';
