-- ============================================================
-- Phase 6.1D – Bundle Thumbnail Support
-- ============================================================
-- Adds a thumbnail_path column to the bundles table,
-- matching the same approach used by products.
-- ============================================================

-- 1. Add thumbnail_path column to bundles table
ALTER TABLE bundles
  ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- 2. Grant privileges to service_role (in case new column needs explicit grant)
--    (The existing GRANT on bundles already covers all columns)
