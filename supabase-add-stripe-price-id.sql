-- ============================================================
-- Phase 6.0A – Stripe Commerce Foundation
-- ============================================================
-- Adds stripe_price_id columns to products and bundles tables.
-- Keeps existing purchase_url columns for backward compatibility.
-- ============================================================

-- 1. Add stripe_price_id to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 2. Add stripe_price_id to bundles table
ALTER TABLE bundles
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 3. Grant privileges to service_role (in case new columns need explicit grants)
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.products
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.bundles
TO service_role;

-- ============================================================
-- Verification queries
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('products', 'bundles')
--   AND column_name = 'stripe_price_id'
-- ORDER BY table_name, ordinal_position;
--
-- Expected:
--   products | stripe_price_id | text | YES
--   bundles  | stripe_price_id | text | YES
