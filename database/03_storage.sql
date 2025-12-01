INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-uploads', 'pdf-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- 2. extracted-text (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('extracted-text', 'extracted-text', false)
ON CONFLICT (id) DO NOTHING;

-- 3. public-assets (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;


-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;


-- Policies for pdf-uploads

CREATE POLICY "Users can upload their own PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'pdf-uploads' AND
    auth.uid() = owner
);

CREATE POLICY "Users can read their PDFs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'pdf-uploads' AND
    auth.uid() = owner
);

CREATE POLICY "Users can delete their PDFs"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'pdf-uploads' AND
    auth.uid() = owner
);


-- Policies for extracted-text

CREATE POLICY "Users can upload extracted text"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'extracted-text' AND
    auth.uid() = owner
);

CREATE POLICY "Users can read extracted text"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'extracted-text' AND
    auth.uid() = owner
);

CREATE POLICY "Users can delete extracted text"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'extracted-text' AND
    auth.uid() = owner
);


-- Policies for public-assets

CREATE POLICY "Public Assets are viewable by everyone"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public-assets' );

-- Only authenticated users (or admins) might upload to public assets, 
-- or you might want to restrict this further. 
-- For now, allowing authenticated users to upload for simplicity, 
-- but strictly you might want an admin check here.
CREATE POLICY "Authenticated users can upload public assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'public-assets' AND
    auth.role() = 'authenticated'
);


-- ------------------------------------------------------------------
-- DocChat documents bucket (Private)
-- ------------------------------------------------------------------

-- 4. documents (Private - used by DocChat for user uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket.
-- We use the convention: object key = "<user_id>/<filename>"
-- and restrict access so users can only access their own folder.

CREATE POLICY "Users can view their own documents objects" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own documents objects" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents objects" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
