-- Fix Profile Display Name Storage
-- The profiles table uses 'user_id' as the foreign key to auth.users
-- but the query in Profile.tsx was using 'id' instead

-- Ensure profiles table has correct structure
-- This should already exist from 02_core_tables.sql, but let's verify

-- Check if we need to add any missing RLS policies
-- The UPDATE policy should have WITH CHECK clause as well

-- Drop and recreate the UPDATE policy with both USING and WITH CHECK
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also ensure INSERT policy has proper check
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Verify the table structure
-- Run this to check:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public';
