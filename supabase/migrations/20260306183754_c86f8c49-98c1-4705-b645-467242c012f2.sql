-- Drop the overly-permissive storage policies that allow ANY authenticated user
-- to write/delete files in the product-files bucket
DROP POLICY IF EXISTS "Service role can upload product files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update product files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete product files" ON storage.objects;

-- Re-create them scoped to admins only.
-- The FileUpload component and Stripe webhook use the service_role key which
-- bypasses RLS, so legitimate admin uploads via the UI still work.
CREATE POLICY "Admins can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-files'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update product files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-files'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-files'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);