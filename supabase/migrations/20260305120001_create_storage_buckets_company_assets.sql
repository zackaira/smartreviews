-- Storage buckets for company logo and gallery images.
-- Path convention: {owner_id}/{company_id}/... (first segment = auth.uid())
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'company-logos',
    'company-logos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png']
  ),
  (
    'company-images',
    'company-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png']
  )
ON CONFLICT (id) DO NOTHING;

-- RLS: only the owner (first path segment = auth.uid()) can insert/update/delete
-- Public buckets allow SELECT for everyone; we restrict write operations by path.

CREATE POLICY "company_logos_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "company_logos_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "company_logos_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "company_images_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "company_images_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'company-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "company_images_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'company-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
