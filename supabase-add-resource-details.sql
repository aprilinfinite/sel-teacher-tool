-- ============================================
-- ADD RESOURCE DETAIL COLUMNS TO resources TABLE
-- ============================================
-- Run this in the Supabase Dashboard SQL Editor.

-- Add short_description column
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add resource_description column (long-form description)
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS resource_description TEXT;

-- Add tags column (comma-separated or JSON array)
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS tags TEXT;

-- Add materials_needed column
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS materials_needed TEXT;

-- Grant privileges on new columns to service_role
GRANT SELECT, INSERT, UPDATE 
ON public.resources 
TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'resources'
--   AND column_name IN ('short_description', 'resource_description', 'tags', 'materials_needed');
