-- ============================================================
-- Phase 5.1C – CMS Foundation Improvements
-- ============================================================
-- Adds: slug, resource_type, created_by, updated_by (resources)
-- Adds: product_type, stripe_payment_link, created_by, updated_by (products)
-- ============================================================

-- 1. Add slug column (if not already present)
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing resources that don't have one
UPDATE resources
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM(title),
      '[^a-zA-Z0-9\\s-]', '', 'g'
    ),
    '\\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Make slug NOT NULL and UNIQUE after populating
ALTER TABLE resources
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on slug
-- First drop if exists to avoid errors on re-run
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_slug_key;
ALTER TABLE resources ADD CONSTRAINT resources_slug_key UNIQUE (slug);

-- 2. Add resource_type column
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS resource_type TEXT;

-- 3. Add created_by column
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- 4. Add updated_by column
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- ============================================================
-- Product table columns
-- ============================================================

-- 5. Add product_type column to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type TEXT;

-- 6. Add stripe_payment_link column to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;

-- 7. Add created_by column to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- 8. Add updated_by column to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources (slug);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources (resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources (created_by);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products (product_type);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products (created_by);

-- ============================================================
-- Verification queries
-- ============================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'resources'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- ORDER BY ordinal_position;
