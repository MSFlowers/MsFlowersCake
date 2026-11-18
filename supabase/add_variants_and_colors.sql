-- Run this in Supabase SQL Editor to support dynamic variants & color galleries:
alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists color_galleries jsonb not null default '[]'::jsonb;
