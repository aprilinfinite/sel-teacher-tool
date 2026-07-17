-- ============================================================
-- Phase 5.3E – Bundle-Products Junction Table
-- ============================================================
-- Creates a bundle_products junction table to persist the
-- many-to-many relationship between Bundles and Upsell Products.
--
-- One Bundle → Many Upsell Products
-- One Upsell Product → Many Bundles
-- ============================================================

-- 1. Create the junction table
CREATE TABLE IF NOT EXISTS bundle_products (
  id SERIAL PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (bundle_id, product_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bundle_products_bundle_id ON bundle_products (bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_products_product_id ON bundle_products (product_id);

-- 3. Grant privileges to service_role
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.bundle_products
TO service_role;

-- 4. Grant USAGE on the SERIAL sequence for INSERT operations
GRANT USAGE, SELECT ON SEQUENCE bundle_products_id_seq TO service_role;

-- ============================================================
-- Verification queries
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'bundle_products'
-- ORDER BY ordinal_position;
--
-- SELECT grantee, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
--   AND table_name = 'bundle_products'
-- ORDER BY grantee, privilege_type;
