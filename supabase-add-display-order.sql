-- ============================================
-- ADD display_order COLUMN TO resources TABLE
-- ============================================
-- This adds a display_order column to the resources table
-- for controlling the order resources appear in lists.
-- Run this in the Supabase Dashboard SQL Editor.

-- Add the display_order column with a default of 0
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Grant privileges on the new column to service_role
GRANT SELECT, INSERT, UPDATE 
ON public.resources 
TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================
-- To verify the column was added:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'resources'
--   AND column_name = 'display_order';
