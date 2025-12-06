-- Add Credits to User
-- This query adds extra credits to a specific user using the hybrid credits system
-- Replace the email and amount with your desired values

-- Option 1: Using the add_extra_credits function (RECOMMENDED)
-- This is the safest way as it logs the transaction
SELECT public.add_extra_credits(
  (SELECT id FROM auth.users WHERE email = 'dicksonfkd@gmail.com'),  -- Replace with actual email
  100,  -- Replace with number of credits to add
  'Manual credit addition by admin'  -- Optional description
);

-- Option 2: Direct update (if function doesn't exist yet)
-- Update extra_credits directly on users table
UPDATE public.users
SET extra_credits = extra_credits + 100  -- Replace with number of credits to add
WHERE id = (SELECT id FROM auth.users WHERE email = 'dicksonfkd@gmail.com');  -- Replace with actual email

-- Option 3: View current credits for a user
SELECT 
  u.email,
  users.monthly_credits,
  users.extra_credits,
  (users.monthly_credits + users.extra_credits) as total_credits,
  users.plan,
  users.subscription_renews_at
FROM public.users users
JOIN auth.users u ON users.id = u.id
WHERE u.email = 'dicksonfkd@gmail.com';  -- Replace with actual email

-- Option 4: View all users and their credits
SELECT 
  u.email,
  users.monthly_credits,
  users.extra_credits,
  (users.monthly_credits + users.extra_credits) as total_credits,
  users.plan
FROM public.users users
JOIN auth.users u ON users.id = u.id
ORDER BY u.email;
