-- ============================================================
-- Phase 5.3A – Bundle Builder Foundation
-- ============================================================
-- Creates the bundles table with a 1:1 relationship to resources.
-- One Resource can have only ONE Bundle.
-- ============================================================

-- 1. Create the bundles table
--    resource_id matches the resources.id type (INTEGER / SERIAL)
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(10,2),
  purchase_url TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- 2. Foreign key: bundles.resource_id → resources.id
--    ON DELETE RESTRICT prevents deleting a resource that owns a bundle.
--    UNIQUE enforces the 1:1 relationship (one bundle per resource).
ALTER TABLE bundles
  ADD CONSTRAINT bundles_resource_id_fkey
  FOREIGN KEY (resource_id)
  REFERENCES resources (id)
  ON DELETE RESTRICT;

ALTER TABLE bundles
  ADD CONSTRAINT bundles_resource_id_unique
  UNIQUE (resource_id);

-- 3. CHECK constraints
--    status must be one of the allowed values
ALTER TABLE bundles
  ADD CONSTRAINT bundles_status_check
  CHECK (status IN ('Draft', 'Published', 'Inactive'));

--    price must not be negative (allow NULL for unpriced bundles)
ALTER TABLE bundles
  ADD CONSTRAINT bundles_price_check
  CHECK (price IS NULL OR price >= 0);

-- 4. Grant privileges to service_role
--    Required for the application to read/write bundles via the service_role client.
--    In Supabase, tables created via the SQL Editor do NOT auto-grant to service_role,
--    unlike tables created via the Table Editor. Without this, the API returns:
--    "permission denied for table bundles"
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.bundles
TO service_role;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bundles_resource_id ON bundles (resource_id);
CREATE INDEX IF NOT EXISTS idx_bundles_status ON bundles (status);

-- ============================================================
-- Verification queries
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'bundles'
-- ORDER BY ordinal_position;
--
-- SELECT
--   tc.constraint_name,
--   tc.constraint_type,
--   rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.referential_constraints rc
--   ON tc.constraint_name = rc.constraint_name
-- WHERE tc.table_name = 'bundles'
--   AND tc.constraint_type = 'FOREIGN KEY';
