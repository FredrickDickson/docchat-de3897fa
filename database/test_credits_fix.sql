-- Quick Test Script for Credits System Fix
-- Run this in Supabase SQL Editor to test the fixed credits system

-- Step 1: First, run the migration if you haven't already
-- Copy and paste the entire contents of 12_hybrid_credits_system.sql

-- Step 2: Verify the credits table has the correct schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'credits' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Expected columns: id, user_id, amount, type, description, created_at

-- Step 3: Test adding credits to your user
SELECT public.add_extra_credits(
  (SELECT id FROM auth.users WHERE email = 'dicksonfkd@gmail.com'),
  100,
  'Test credit addition after migration fix'
);

-- Step 4: Verify the transaction was logged
SELECT 
  id,
  user_id,
  amount,
  type,
  description,
  created_at
FROM public.credits 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dicksonfkd@gmail.com')
ORDER BY created_at DESC
LIMIT 5;

-- Step 5: Verify user's credits were updated
SELECT 
  u.email,
  users.monthly_credits,
  users.extra_credits,
  (users.monthly_credits + users.extra_credits) as total_credits,
  users.plan
FROM public.users users
JOIN auth.users u ON users.id = u.id
WHERE u.email = 'dicksonfkd@gmail.com';

-- Step 6: Test the get_total_credits function
SELECT public.get_total_credits(
  (SELECT id FROM auth.users WHERE email = 'dicksonfkd@gmail.com')
) as total_available_credits;
