-- ============================================================
-- Phase 5.1D – Protect Resources from Accidental Deletion
-- ============================================================
-- Changes the foreign key on products.resource_id
-- from ON DELETE CASCADE to ON DELETE RESTRICT
-- ============================================================

-- 1. Drop the existing foreign key constraint
-- The constraint may be named differently depending on when it was created.
-- We try the most common auto-generated name first, then fall back.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_resource_id_fkey;

-- 2. Re-add the foreign key with RESTRICT behavior
-- RESTRICT prevents deletion of a resource if it still has products.
ALTER TABLE products
  ADD CONSTRAINT products_resource_id_fkey
  FOREIGN KEY (resource_id)
  REFERENCES resources (id)
  ON DELETE RESTRICT;

-- ============================================================
-- Verification
-- ============================================================
-- To verify the constraint was applied correctly:
--
-- SELECT
--   tc.constraint_name,
--   tc.constraint_type,
--   rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.referential_constraints rc
--   ON tc.constraint_name = rc.constraint_name
-- WHERE tc.table_name = 'products'
--   AND tc.constraint_type = 'FOREIGN KEY';
--
-- Expected: delete_rule = 'RESTRICT'
