-- ============================================
-- SUPABASE PERMISSION INSPECTION QUERIES
-- Run these in the Supabase Dashboard SQL Editor
-- ============================================

-- 1. Check if the resources table exists and who owns it
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'resources';
-- Expected: Should return 1 row showing the table exists
-- If no rows: Table doesn't exist in public schema

-- ============================================

-- 2. Check all grants on the resources table
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name = 'resources'
ORDER BY grantee, privilege_type;
-- Expected: Should show service_role with INSERT, SELECT, UPDATE, DELETE privileges
-- If service_role is missing INSERT: That's the problem

-- ============================================

-- 3. Check if Row Level Security (RLS) is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'resources';
-- Expected: rowsecurity = false (RLS disabled) OR true (RLS enabled)
-- If true: Need to check policies (query #4)

-- ============================================

-- 4. List all RLS policies on the resources table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'resources';
-- Expected: If RLS is enabled, should show policies
-- Check if any policy allows INSERT for service_role or authenticated users
-- If no policies exist and RLS is enabled: INSERT will be denied

-- ============================================

-- 5. Check if service_role has INSERT privilege specifically
SELECT 
  has_table_privilege('service_role', 'public.resources', 'INSERT') AS service_role_can_insert,
  has_table_privilege('service_role', 'public.resources', 'SELECT') AS service_role_can_select,
  has_table_privilege('service_role', 'public.resources', 'UPDATE') AS service_role_can_update,
  has_table_privilege('service_role', 'public.resources', 'DELETE') AS service_role_can_delete;
-- Expected: All should return true
-- If INSERT is false: service_role lacks INSERT privilege

-- ============================================

-- 6. Check the current role and search path
SELECT 
  current_user AS current_role,
  current_database() AS current_db,
  current_schema() AS current_schema;
-- Expected: Should show which role you're connected as
-- Helps verify you're checking the right context

-- ============================================
-- DIAGNOSIS GUIDE
-- ============================================
-- Most likely issues:
-- 
-- 1. RLS is enabled but no INSERT policy exists for service_role
--    → Query #3 shows rowsecurity = true
--    → Query #4 shows no policies or policies don't allow INSERT
--
-- 2. service_role lacks INSERT grant
--    → Query #2 doesn't show service_role with INSERT privilege
--    → Query #5 shows service_role_can_insert = false
--
-- 3. Table is in a different schema
--    → Query #1 shows schemaname != 'public'
--
-- Run queries in order and check which one reveals the issue.