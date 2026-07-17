-- ============================================================
-- Phase 5.3B – Grant service_role Permissions on bundles Table
-- ============================================================
-- This is a patch for existing databases where the bundles
-- table was created via Phase 5.3A but the GRANT statement
-- was missing, causing the API to return:
--   "permission denied for table bundles"
--
-- Root cause: Tables created via the Supabase SQL Editor
-- do NOT auto-grant privileges to service_role, unlike
-- tables created via the Table Editor.
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.bundles
TO service_role;

-- ============================================================
-- Verification
-- ============================================================
-- Run this query to confirm the grants were applied:
--
-- SELECT grantee, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
--   AND table_name = 'bundles'
-- ORDER BY grantee, privilege_type;
--
-- Expected output:
--   service_role | DELETE
--   service_role | INSERT
--   service_role | SELECT
--   service_role | UPDATE
