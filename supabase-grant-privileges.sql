-- ============================================
-- GRANT PRIVILEGES TO service_role
-- ============================================
-- This grants the minimum required privileges
-- to allow the application to read and write
-- to the resources table via the service_role.

-- Grant basic table privileges to service_role
-- SELECT: Required for reading existing resources and slug uniqueness checks
-- INSERT: Required for adding new resources
-- UPDATE: Required for any future updates to resources
-- DELETE: Required for cleanup operations (e.g., removing failed uploads)
GRANT SELECT, INSERT, UPDATE, DELETE 
ON public.resources 
TO service_role;

-- ============================================
-- SEQUENCE PERMISSIONS (if id is SERIAL/IDENTITY)
-- ============================================
-- If the id column uses SERIAL or IDENTITY, PostgreSQL creates
-- a sequence. The service_role needs permission to use it
-- for INSERT operations to generate new IDs.

-- Grant usage and select on the sequence
-- This is required for INSERT to work with auto-incrementing IDs
GRANT USAGE, SELECT 
ON SEQUENCE public.resources_id_seq 
TO service_role;

-- ============================================
-- NOTES
-- ============================================
-- 1. These grants are REVOKE-safe - they only add privileges
-- 2. Existing data is preserved - no table modifications
-- 3. The table structure remains unchanged
-- 4. service_role bypasses RLS, so no policy changes needed
-- 5. After running, the upload should work immediately
--
-- To verify the grants were applied:
-- SELECT * FROM information_schema.table_privileges 
-- WHERE table_schema = 'public' AND table_name = 'resources';