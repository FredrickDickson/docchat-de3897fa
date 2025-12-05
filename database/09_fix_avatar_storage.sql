-- Fix Avatar Storage - Add RLS Policies for avatars bucket
-- This migration adds the missing policies that allow users to upload and manage their avatars



-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 4. Create policies for avatars bucket

-- Allow users to upload their own avatar
-- Path format: {user_id}/avatar.{ext}
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar (for upsert)
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own avatar
CREATE POLICY "Users can read their own avatar"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view avatars (since bucket is public)
-- This is important so avatars can be displayed to other users
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 5. Verify the bucket configuration
-- You can run this query to check:
-- SELECT * FROM storage.buckets WHERE id = 'avatars';
